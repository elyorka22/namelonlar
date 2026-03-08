import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { syncUserFromSupabase } from "@/lib/sync-user";

/**
 * Получить текущего пользователя (работает с NextAuth и Supabase)
 * Приоритет: Supabase Auth (для Google OAuth), затем NextAuth (для email/password)
 */
export async function getCurrentUser() {
  // Сначала проверяем Supabase Auth (для Google OAuth)
  try {
    const supabase = await createClient();
    
    // Проверяем cookies для диагностики
    let cookieStore;
    try {
      cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      const supabaseCookies = allCookies.filter(c => 
        c.name.includes('supabase') || c.name.includes('sb-')
      );
      console.log("[AUTH] Total cookies:", allCookies.length, "Supabase cookies:", supabaseCookies.length);
      if (supabaseCookies.length > 0) {
        console.log("[AUTH] Supabase cookie names:", supabaseCookies.map(c => c.name));
      }
    } catch (cookieError) {
      // Игнорируем ошибки cookies во время сборки
      console.log("[AUTH] Cookie check error (likely build time):", cookieError);
    }
    
    // Согласно документации Supabase SSR, getUser() более надежен для проверки авторизации
    // Но сначала пробуем getSession() для чтения из cookies
    let { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Если getSession не нашел сессию, пробуем getUser() (он может обновить токен)
    if (!session?.user && !sessionError) {
      console.log("[AUTH] No session from getSession, trying getUser()...");
      const { data: { user: fallbackUser }, error: fallbackError } = await supabase.auth.getUser();
      if (fallbackUser) {
        console.log("[AUTH] ✅ Found user via getUser() fallback:", fallbackUser.email);
        // Если getUser нашел пользователя, получаем полную сессию
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (fallbackSession?.user) {
          session = fallbackSession;
        }
      }
    }
    
    if (session?.user) {
      console.log("[AUTH] ✅ Supabase session found for user:", session.user.email);
      console.log("[AUTH] Session expires at:", session.expires_at);
      
      // Используем централизованную функцию синхронизации
      const syncResult = await syncUserFromSupabase(session.user);
      
      if (!syncResult.success || !syncResult.user) {
        console.error("[AUTH] ❌ Failed to sync user from Supabase to Prisma:", syncResult.error);
        // Продолжаем - попробуем getUser fallback
      } else {
        const prismaUser = syncResult.user;
        
        if (syncResult.created) {
          console.log("[AUTH] ⚠️ User was missing in Prisma, created now:", prismaUser.id);
          console.log("[AUTH] This should have been done in /auth/callback, but synced now as fallback");
        }

        console.log("[AUTH] ✅ Returning user from Supabase session:", prismaUser.id, prismaUser.email);
        return {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name,
          image: prismaUser.image,
        };
      }
    } else if (sessionError) {
      console.log("[AUTH] ❌ Supabase session error:", sessionError.message);
      console.log("[AUTH] Session error code:", sessionError.status);
      // Не возвращаем null сразу - пробуем getUser
    } else {
      console.log("[AUTH] ⚠️ No Supabase session found");
      // Не возвращаем null сразу - пробуем getUser
    }
    
    // Если getSession не сработал, пробуем getUser (fallback)
    if (!session?.user) {
      console.log("[AUTH] Trying getUser as fallback...");
      const {
        data: { user: supabaseUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        console.log("[AUTH] ✅ Supabase user found via getUser:", supabaseUser.email);
        
        // Используем централизованную функцию синхронизации
        const syncResult = await syncUserFromSupabase(supabaseUser);
        
        if (syncResult.success && syncResult.user) {
          const prismaUser = syncResult.user;
          
          if (syncResult.created) {
            console.log("[AUTH] ⚠️ User was missing in Prisma (getUser fallback), created now:", prismaUser.id);
          }
          
          console.log("[AUTH] ✅ Returning user from Supabase getUser:", prismaUser.id, prismaUser.email);
          return {
            id: prismaUser.id,
            email: prismaUser.email,
            name: prismaUser.name,
            image: prismaUser.image,
          };
        } else {
          console.error("[AUTH] ❌ Failed to sync user from Supabase to Prisma (getUser fallback):", syncResult.error);
        }
      } else if (userError) {
        console.log("[AUTH] ❌ Supabase getUser error:", userError.message);
        console.log("[AUTH] User error code:", userError.status);
      } else {
        console.log("[AUTH] ⚠️ No Supabase user found via getUser");
      }
    }
  } catch (error) {
    console.error("[AUTH] ❌ Error in Supabase auth check:", error);
    if (error instanceof Error) {
      console.error("[AUTH] Error message:", error.message);
      console.error("[AUTH] Error stack:", error.stack);
    }
    // Продолжаем с NextAuth
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

