import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Получить текущего пользователя (работает с NextAuth и Supabase)
 * Приоритет: Supabase Auth (для Google OAuth), затем NextAuth (для email/password)
 */
export async function getCurrentUser() {
  // Проверяем, есть ли cookies (во время сборки их нет)
  try {
    const cookieStore = await cookies();
    // Если нет cookies, возвращаем null (во время сборки)
    if (!cookieStore || cookieStore.getAll().length === 0) {
      return null;
    }
  } catch (error) {
    // Если ошибка при получении cookies (например, во время сборки), возвращаем null
    return null;
  }

  // Сначала проверяем Supabase Auth (для Google OAuth)
  try {
    const supabase = await createClient();
    
    // Проверяем cookies для диагностики
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter(c => 
      c.name.includes('supabase') || c.name.includes('sb-')
    );
    console.log("[AUTH] Supabase cookies found:", supabaseCookies.length);
    
    // Пробуем получить сессию (более надежно, чем getUser)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (session?.user) {
      console.log("[AUTH] ✅ Supabase session found for user:", session.user.email);
      
      // Проверяем, есть ли пользователь в Prisma
      let prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
      });

      // Если пользователя нет в Prisma, создаем его
      if (!prismaUser) {
        console.log("[AUTH] Creating user in Prisma:", session.user.email);
        prismaUser = await prisma.user.create({
          data: {
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
            image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
            emailVerified: session.user.email_confirmed_at ? new Date(session.user.email_confirmed_at) : null,
          },
        });
      }

      console.log("[AUTH] ✅ Returning user from Supabase session:", prismaUser.id, prismaUser.email);
      return {
        id: prismaUser.id,
        email: prismaUser.email,
        name: prismaUser.name,
        image: prismaUser.image,
      };
    } else if (sessionError) {
      console.log("[AUTH] ❌ Supabase session error:", sessionError.message);
      console.log("[AUTH] Session error code:", sessionError.status);
    } else {
      console.log("[AUTH] ⚠️ No Supabase session found");
    }
    
    // Если getSession не сработал, пробуем getUser
    const {
      data: { user: supabaseUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (supabaseUser) {
      console.log("[AUTH] ✅ Supabase user found via getUser:", supabaseUser.email);
      
      // Проверяем, есть ли пользователь в Prisma
      let prismaUser = await prisma.user.findUnique({
        where: { email: supabaseUser.email! },
      });

      // Если пользователя нет в Prisma, создаем его
      if (!prismaUser) {
        console.log("[AUTH] Creating user in Prisma:", supabaseUser.email);
        prismaUser = await prisma.user.create({
          data: {
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
            image: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
            emailVerified: supabaseUser.email_confirmed_at ? new Date(supabaseUser.email_confirmed_at) : null,
          },
        });
      }

      console.log("[AUTH] ✅ Returning user from Supabase getUser:", prismaUser.id, prismaUser.email);
      return {
        id: prismaUser.id,
        email: prismaUser.email,
        name: prismaUser.name,
        image: prismaUser.image,
      };
    } else if (userError) {
      console.log("[AUTH] ❌ Supabase getUser error:", userError.message);
      console.log("[AUTH] User error code:", userError.status);
    } else {
      console.log("[AUTH] ⚠️ No Supabase user found via getUser");
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

