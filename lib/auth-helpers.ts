import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { syncUserFromSupabase } from "@/lib/sync-user";

/**
 * Быстрая проверка авторизации через Supabase Auth (без Prisma)
 * Возвращает пользователя из Supabase, даже если его нет в Prisma
 * Это основной источник истины для проверки авторизации
 * 
 * ВАЖНО: Использует только getSession() для чтения cookies
 * Не вызывает getUser() чтобы не обновлять токен на каждом запросе
 */
export async function getSupabaseUser() {
  try {
    const supabase = await createClient();
    
    // Используем только getSession() - это читает cookies без обновления токена
    // getUser() обновляет токен и может вызывать проблемы при частых вызовах
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (session?.user) {
      const role = (session.user.app_metadata?.role as string) || "USER";
      return {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              null,
        image: session.user.user_metadata?.avatar_url ||
               session.user.user_metadata?.picture ||
               null,
        role: role === "ADMIN" || role === "MODERATOR" ? role : "USER",
      };
    }
    
    // Если getSession не нашел, но ошибки нет - пользователь не авторизован
    if (sessionError && sessionError.message !== "Auth session missing!") {
      console.error("[AUTH] Error in getSupabaseUser:", sessionError.message);
    }
  } catch (error) {
    console.error("[AUTH] Error in getSupabaseUser:", error);
  }
  
  return null;
}

/**
 * Получить текущего пользователя (работает с NextAuth и Supabase)
 * ВАЖНО: Теперь возвращает пользователя из Supabase даже если его нет в Prisma
 * Синхронизация с Prisma происходит асинхронно и не блокирует доступ
 */
export async function getCurrentUser() {
  // Сначала проверяем Supabase Auth (для Google OAuth)
  // ВАЖНО: Используем быструю проверку без ожидания синхронизации с Prisma
  const supabaseUser = await getSupabaseUser();
  
  if (supabaseUser) {
    console.log("[AUTH] ✅ Supabase user found:", supabaseUser.email);
    
    // Синхронизируем с Prisma асинхронно (не блокируем ответ)
    // Это гарантирует, что пользователь будет доступен даже если синхронизация еще не завершилась
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Запускаем синхронизацию в фоне
      syncUserFromSupabase(session.user).then((syncResult) => {
        if (syncResult.created) {
          console.log("[AUTH] ✅ User synced to Prisma (async):", supabaseUser.email);
        }
      }).catch((error) => {
        console.error("[AUTH] Sync error (non-blocking):", error);
      });
    }
    
    // Возвращаем пользователя из Supabase СРАЗУ, не дожидаясь Prisma
    return supabaseUser;
  }

  // Затем проверяем NextAuth (для email/password)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      console.log("[AUTH] NextAuth session found for user:", session.user.id);
      const nextAuthUser = session.user as { id: string; email?: string | null; name?: string | null; image?: string | null };
      const prismaUser = await prisma.user.findUnique({
        where: { id: nextAuthUser.id },
        select: { role: true },
      });
      const role = prismaUser?.role === "ADMIN" || prismaUser?.role === "MODERATOR" ? prismaUser.role : "USER";
      return {
        ...nextAuthUser,
        role,
      };
    } else {
      console.log("[AUTH] No NextAuth session found");
    }
  } catch (error) {
    console.error("[AUTH] Error getting NextAuth session:", error);
    // Не логируем ошибки во время сборки
    if (process.env.NODE_ENV !== "production" || typeof window === "undefined") {
      // Только в development или если не в браузере
    }
  }

  console.log("[AUTH] No user found");
  return null;
}

