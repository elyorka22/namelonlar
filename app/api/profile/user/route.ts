import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUserData } from "@/lib/auth";
import { AuthError } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Используем единую систему авторизации
    const currentUser = await requireAuth();

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

