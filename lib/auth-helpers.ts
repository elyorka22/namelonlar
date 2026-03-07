import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Получить текущего пользователя (работает с NextAuth и Supabase)
 * Приоритет: Supabase Auth (для Google OAuth), затем NextAuth (для email/password)
 */
export async function getCurrentUser() {
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
    console.error("Supabase auth error:", error);
  }

  // Затем проверяем NextAuth (для email/password)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return session.user;
    }
  } catch (error) {
    console.error("NextAuth error:", error);
  }

  return null;
}

