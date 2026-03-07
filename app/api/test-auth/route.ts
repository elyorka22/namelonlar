import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Тестовый endpoint для проверки авторизации
// Используйте только для отладки!
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        found: false,
        message: "Пользователь не найден",
      });
    }

    if (!user.password) {
      return NextResponse.json({
        found: true,
        hasPassword: false,
        message: "У пользователя нет пароля",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    // Проверяем формат пароля
    const isBcryptFormat = user.password.startsWith("$2") && user.password.length === 60;

    // Проверяем пароль
    let passwordValid = false;
    try {
      passwordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      return NextResponse.json({
        found: true,
        hasPassword: true,
        passwordFormat: isBcryptFormat ? "✅ Правильный формат" : "❌ Неверный формат",
        message: "Ошибка при проверке пароля (возможно, неверный формат хеша)",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return NextResponse.json({
      found: true,
      hasPassword: true,
      passwordFormat: isBcryptFormat ? "✅ Правильный формат" : "❌ Неверный формат",
      passwordValid: passwordValid ? "✅ Пароль правильный" : "❌ Пароль неверный",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      passwordHashPreview: user.password.substring(0, 20) + "...",
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

