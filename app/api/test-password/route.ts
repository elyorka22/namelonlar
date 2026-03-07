import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Тестовый endpoint для проверки пароля
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

    // Нормализуем email
    const normalizedEmail = email.trim().toLowerCase();

    // Ищем пользователя
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      },
    });

    if (!user) {
      return NextResponse.json({
        found: false,
        message: "Пользователь не найден",
        searchedEmail: normalizedEmail,
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
    const passwordLength = user.password.length;
    const passwordPrefix = user.password.substring(0, 15);

    // Пробуем сравнить пароль
    let passwordValid = false;
    let compareError = null;
    
    try {
      passwordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      compareError = error instanceof Error ? error.message : String(error);
    }

    // Дополнительная проверка: пробуем сравнить с разными вариантами
    const testVariations = {
      original: password,
      trimmed: password.trim(),
      withSpaces: ` ${password} `,
    };

    const variationResults: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(testVariations)) {
      try {
        variationResults[key] = await bcrypt.compare(value, user.password);
      } catch (e) {
        variationResults[key] = false;
      }
    }

    return NextResponse.json({
      found: true,
      hasPassword: true,
      passwordFormat: {
        isBcrypt: isBcryptFormat,
        length: passwordLength,
        prefix: passwordPrefix,
        status: isBcryptFormat && passwordLength === 60 ? "✅ Правильный формат" : "❌ Неверный формат",
      },
      passwordValidation: {
        valid: passwordValid ? "✅ Пароль правильный" : "❌ Пароль неверный",
        error: compareError,
      },
      testVariations: variationResults,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      input: {
        emailProvided: email,
        emailNormalized: normalizedEmail,
        emailInDatabase: user.email,
        emailMatch: user.email ? normalizedEmail === user.email.toLowerCase() : false,
        passwordLength: password.length,
      },
    });
  } catch (error) {
    console.error("Test password error:", error);
    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

