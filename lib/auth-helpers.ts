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
 */
export async function getSupabaseUser() {
  try {
    const supabase = await createClient();
    
    // Сначала пробуем getSession (быстрее)
    let { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Если getSession не нашел, пробуем getUser (может обновить токен)
    if (!session?.user && !sessionError) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user) {
        // Если getUser нашел пользователя, получаем сессию
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession?.user) {
          session = newSession;
        } else {
          // Если сессии нет, но пользователь есть, создаем минимальный объект
          return {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          };
        }
      }
    }
    
    if (session?.user) {
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
      return session.user;
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

