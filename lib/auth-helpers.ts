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
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (supabaseUser) {
      // Проверяем, есть ли пользователь в Prisma
      let prismaUser = await prisma.user.findUnique({
        where: { email: supabaseUser.email! },
      });

      // Если пользователя нет в Prisma, создаем его
      if (!prismaUser) {
        prismaUser = await prisma.user.create({
          data: {
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
            image: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
            emailVerified: supabaseUser.email_confirmed_at ? new Date() : null,
          },
        });
      }

      return {
        id: prismaUser.id,
        email: prismaUser.email,
        name: prismaUser.name,
        image: prismaUser.image,
      };
    }
  } catch (error) {
    // Если Supabase не настроен или ошибка, продолжаем с NextAuth
    // Не логируем ошибки во время сборки
    if (process.env.NODE_ENV !== "production" || typeof window === "undefined") {
      // Только в development или если не в браузере
    }
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

