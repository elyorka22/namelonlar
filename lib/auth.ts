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
 * Получить текущего пользователя
 * 
 * ВАЖНО: Использует только Supabase Auth для проверки авторизации
 * Не зависит от наличия пользователя в Prisma
 * 
 * @returns Пользователь из Supabase или null
 */
export async function getCurrentUser() {
  // 1. Проверяем Supabase Auth (основной метод для Google OAuth)
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Синхронизируем с Prisma асинхронно (не блокируем)
      syncUserFromSupabase(session.user).catch((error) => {
        console.error("[AUTH] Sync error (non-blocking):", error);
      });
      
      return {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name || 
              session.user.user_metadata?.name || 
              null,
        image: session.user.user_metadata?.avatar_url || 
               session.user.user_metadata?.picture || 
               null,
      };
    }
  } catch (error) {
    console.error("[AUTH] Error checking Supabase session:", error);
  }

  // 2. Проверяем NextAuth (для email/password)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return session.user;
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

/**
 * Проверить, может ли пользователь заходить в админ-панель (ADMIN или MODERATOR).
 * Ищет пользователя по email (для Supabase Auth, т.к. id в Prisma может быть CUID),
 * при отсутствии email — по id.
 */
export async function isAdminOrModerator(
  userId: string,
  email?: string | null
): Promise<boolean> {
  try {
    let user = null;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        select: { role: true },
      });
    }
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
    }
    return user?.role === "ADMIN" || user?.role === "MODERATOR";
  } catch (error) {
    console.error("[AUTH] Error checking admin/moderator role:", error);
    return false;
  }
}

/**
 * Требовать авторизацию и роль администратора
 * 
 * @returns Авторизованный администратор
 * @throws AuthError если пользователь не авторизован или не администратор
 */
export async function requireAdmin() {
  const user = await requireAuth();
  
  const admin = await isAdmin(user.id);
  if (!admin) {
    throw new AuthError("Forbidden: Admin access required");
  }
  
  return user;
}

/**
 * Получить данные пользователя из Prisma
 * 
 * Используется для получения расширенных данных (объявления, настройки и т.д.)
 * НЕ используется для проверки авторизации
 * 
 * @param userId ID пользователя
 * @returns Данные пользователя из Prisma или null
 */
export async function getUserData(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  } catch (error) {
    console.error("[AUTH] Error getting user data:", error);
    return null;
  }
}
