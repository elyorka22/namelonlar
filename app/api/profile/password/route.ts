import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUserData } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { syncUserFromSupabase } from "@/lib/sync-user";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Используем единую систему авторизации
    const currentUser = await requireAuth();

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: "Yangi parol kiritilmadi" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Parol kamida 6 belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    // Получаем пользователя из Prisma
    let user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { password: true, email: true },
    });

    // Если пользователя нет в Prisma, создаем его (синхронизация)
    if (!user) {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const syncResult = await syncUserFromSupabase(session.user);
        if (syncResult.success && syncResult.user) {
          user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: { password: true, email: true },
          });
        }
      }
      
      if (!user) {
        return NextResponse.json(
          { error: "Пользователь не найден" },
          { status: 404 }
        );
      }
    }

    // Если у пользователя уже есть пароль, проверяем текущий
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Joriy parol kiritilmadi" },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Joriy parol noto'g'ri" },
          { status: 400 }
        );
      }
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });

    console.log("[API-PASSWORD] ✅ Password successfully updated for user:", currentUser.email);
    
    return NextResponse.json({
      success: true,
      message: user.password 
        ? "Parol muvaffaqiyatli o'zgartirildi" 
        : "Parol muvaffaqiyatli o'rnatildi",
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: "Авторизация требуется" },
        { status: 401 }
      );
    }
    
    console.error("[API-PASSWORD] Error:", error);
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

