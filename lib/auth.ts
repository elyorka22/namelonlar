/**
 * Единая система авторизации
 * 
 * Принципы:
 * 1. Supabase Auth - единственный источник истины для авторизации
 * 2. Prisma - только для данных, не для авторизации
 * 3. Простая и надежная система без зависимостей от синхронизации
 */

import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import { syncUserFromSupabase } from "@/lib/sync-user";

// Re-export authOptions for backward compatibility
export { authOptions } from "@/lib/nextauth";

/**
 * Ошибка авторизации
 */
export class AuthError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Получить текущего пользователя.
 * Та же логика, что в auth-helpers: сначала getUser() (обновляет токен), иначе getSession().
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    let user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      const session = (await supabase.auth.getSession()).data.session;
      user = session?.user ?? null;
    }

    if (user) {
      syncUserFromSupabase(user).catch((error) => {
        console.error("[AUTH] Sync error (non-blocking):", error);
      });
      let role = (user.app_metadata?.role as string) || "USER";
      if (role !== "ADMIN" && role !== "MODERATOR" && user.email) {
        const prismaUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { role: true },
        });
        if (prismaUser?.role === "ADMIN" || prismaUser?.role === "MODERATOR") {
          role = prismaUser.role;
        }
      }
      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              null,
        image: user.user_metadata?.avatar_url ||
               user.user_metadata?.picture ||
               null,
        role: role === "ADMIN" || role === "MODERATOR" ? role : "USER",
      };
    }
  } catch (error) {
    console.error("[AUTH] Error checking Supabase session:", error);
  }

  // NextAuth (email/password) — роль из Prisma
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const prismaUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      const role = prismaUser?.role === "ADMIN" || prismaUser?.role === "MODERATOR" ? prismaUser.role : "USER";
      return {
        ...session.user,
        role,
      };
    }
  } catch (error) {
    console.error("[AUTH] Error checking NextAuth session:", error);
  }

  return null;
}

/**
 * Требовать авторизацию
 * 
 * Выбрасывает AuthError если пользователь не авторизован
 * Используется для защиты страниц и API routes
 * 
 * @returns Авторизованный пользователь
 * @throws AuthError если пользователь не авторизован
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new AuthError("Unauthorized");
  }
  
  return user;
}

/**
 * Проверить является ли пользователь администратором
 * 
 * @param userId ID пользователя
 * @returns true если пользователь администратор
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    return user?.role === "ADMIN";
  } catch (error) {
    console.error("[AUTH] Error checking admin role:", error);
    return false;
  }
}

/** Пользователь с опциональной ролью (из Supabase app_metadata или Prisma) */
export type UserWithRole = { id: string; email?: string | null; name?: string | null; image?: string | null; role?: string };

/**
 * Проверить, может ли пользователь заходить в админ-панель (ADMIN или MODERATOR).
 * Роль берётся из переданного user.role (Supabase app_metadata) — без запроса в Prisma.
 * Если role нет на user — fallback в Prisma по email/id (для NextAuth).
 */
export async function isAdminOrModerator(
  userOrId: UserWithRole | string,
  email?: string | null
): Promise<boolean> {
  const role = typeof userOrId === "object" ? userOrId.role : undefined;
  if (role === "ADMIN" || role === "MODERATOR") {
    return true;
  }
  if (typeof userOrId === "object" && role !== undefined) {
    return false;
  }
  const userId = typeof userOrId === "object" ? userOrId.id : userOrId;
  try {
    let prismaUser = null;
    if (email) {
      prismaUser = await prisma.user.findUnique({
        where: { email },
        select: { role: true },
      });
    }
    if (!prismaUser) {
      prismaUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
    }
    return prismaUser?.role === "ADMIN" || prismaUser?.role === "MODERATOR";
  } catch (error) {
    console.error("[AUTH] Error checking admin/moderator role:", error);
    return false;
  }
}

/**
 * Требовать авторизацию и роль администратора
 * Роль берётся из user.role (Supabase app_metadata), без запроса в Prisma при наличии.
 */
export async function requireAdmin() {
  const user = await requireAuth() as UserWithRole;
  if (user.role === "ADMIN" || user.role === "MODERATOR") {
    return user;
  }
  const admin = await isAdmin(user.id);
  if (!admin) {
    throw new AuthError("Forbidden: Admin access required");
  }
  return user;
}

/**
 * Получить данные пользователя из Prisma (для профиля, объявлений и т.д.)
 * Сначала поиск по id, при отсутствии — по email (для пользователей Supabase со старым CUID в Prisma).
 */
export async function getUserData(userId: string, email?: string | null) {
  try {
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
    }
    return user;
  } catch (error) {
    console.error("[AUTH] Error getting user data:", error);
    return null;
  }
}
