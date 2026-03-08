import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getSupabaseUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { syncUserFromSupabase } from "@/lib/sync-user";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log("[API-PASSWORD] Checking authentication...");
    
    // Используем новую быструю проверку через Supabase
    let currentUser = await getCurrentUser();
    console.log("[API-PASSWORD] getCurrentUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");
    
    // Если getCurrentUser не нашел, пробуем напрямую через Supabase (fallback)
    if (!currentUser?.id) {
      console.log("[API-PASSWORD] getCurrentUser failed, trying getSupabaseUser...");
      currentUser = await getSupabaseUser();
      console.log("[API-PASSWORD] getSupabaseUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");
    }
    
    if (!currentUser?.id) {
      console.log("[API-PASSWORD] ❌ No user found, returning 401");
      return NextResponse.json(
        { error: "Авторизация требуется. Iltimos, qayta kirib ko'ring." },
        { status: 401 }
      );
    }
    
    console.log("[API-PASSWORD] ✅ User authenticated:", currentUser.email);

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

    // Получаем пользователя из базы или создаем если его нет
    let user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { password: true, email: true },
    });

    // Если пользователя нет в Prisma, создаем его (синхронизация)
    if (!user) {
      console.log("[API-PASSWORD] User not in Prisma, creating...");
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
        console.error("[API-PASSWORD] Failed to create user in Prisma for ID:", currentUser.id);
        return NextResponse.json(
          { error: "Пользователь не найден и не может быть создан" },
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
    console.error("[API-PASSWORD] ❌ Error updating password:", error);
    console.error("[API-PASSWORD] Error message:", error?.message);
    console.error("[API-PASSWORD] Error stack:", error?.stack);
    
    // Более детальная обработка ошибок
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }
    
    if (error?.message?.includes("Tenant or user not found")) {
      return NextResponse.json(
        { error: "Ошибка подключения к базе данных. Проверьте DATABASE_URL." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Внутренняя ошибка сервера",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

