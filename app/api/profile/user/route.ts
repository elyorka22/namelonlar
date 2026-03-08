import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUserData } from "@/lib/auth";
import { AuthError } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Используем единую систему авторизации
    const currentUser = await requireAuth();

    // Получаем данные пользователя из Prisma (если есть)
    const userData = await getUserData(currentUser.id, currentUser.email);
    
    // Если пользователя нет в Prisma, возвращаем данные из Supabase
    if (!userData) {
      return NextResponse.json({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        image: currentUser.image,
        password: null,
      });
    }

    // Возвращаем данные из Prisma
    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      image: userData.image,
      password: userData.password,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: "Авторизация требуется" },
        { status: 401 }
      );
    }
    
    console.error("[API-PROFILE-USER] Error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

