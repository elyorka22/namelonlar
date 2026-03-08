import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getSupabaseUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { syncUserFromSupabase } from "@/lib/sync-user";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log("[API-PROFILE-USER] Checking authentication...");
    
    // Используем новую быструю проверку через Supabase
    let currentUser = await getCurrentUser();
    console.log("[API-PROFILE-USER] getCurrentUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");

    // Если getCurrentUser не нашел, пробуем напрямую через Supabase (fallback)
    if (!currentUser?.id) {
      console.log("[API-PROFILE-USER] getCurrentUser failed, trying getSupabaseUser...");
      currentUser = await getSupabaseUser();
      console.log("[API-PROFILE-USER] getSupabaseUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");
    }


    if (!currentUser?.id) {
      console.log("[API-PROFILE-USER] ❌ No user found, returning 401");
      return NextResponse.json(
        { error: "Авторизация требуется" },
        { status: 401 }
      );
    }

    console.log("[API-PROFILE-USER] ✅ User authenticated:", currentUser.email);

    // Пробуем получить пользователя из Prisma
    let user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
      },
    });

    // Если пользователя нет в Prisma, используем данные из Supabase
    // Синхронизация произойдет асинхронно
    if (!user) {
      console.log("[API-PROFILE-USER] User not in Prisma, using Supabase data");
      
      // Запускаем синхронизацию в фоне
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        syncUserFromSupabase(session.user).catch((error) => {
          console.error("[API-PROFILE-USER] Sync error (non-blocking):", error);
        });
      }
      
      // Возвращаем данные из Supabase
      user = {
        id: currentUser.id,
        email: currentUser.email ?? null,
        name: currentUser.name,
        image: currentUser.image,
        password: null, // Пароль хранится только в Prisma
      };
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[API-PROFILE-USER] Error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

