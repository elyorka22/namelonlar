import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Тестовый endpoint для проверки подключения к базе данных
 * Используйте только для диагностики!
 */
export async function GET() {
  try {
    // Проверяем наличие DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        {
          error: "DATABASE_URL не установлен",
          status: "error",
        },
        { status: 500 }
      );
    }

    // Проверяем формат URL
    const urlInfo = {
      hasPooler: dbUrl.includes("pooler.supabase.com"),
      hasPgbouncer: dbUrl.includes("pgbouncer=true"),
      hasPort6543: dbUrl.includes(":6543"),
      region: dbUrl.match(/aws-0-([^.]+)/)?.[1] || "unknown",
      projectRef: dbUrl.match(/postgres\.([^:]+)/)?.[1] || "unknown",
    };

    // Пробуем подключиться к базе данных
    let connectionTest;
    try {
      // Простой запрос для проверки подключения
      await prisma.$queryRaw`SELECT 1 as test`;
      connectionTest = {
        status: "success",
        message: "Подключение к базе данных успешно",
      };
    } catch (dbError: any) {
      const errorMessage = dbError.message || "Unknown error";
      
      connectionTest = {
        status: "error",
        message: errorMessage,
        errorType: errorMessage.includes("Tenant or user not found")
          ? "authentication"
          : errorMessage.includes("Connection")
          ? "connection"
          : "unknown",
        suggestions: [],
      };

      if (errorMessage.includes("Tenant or user not found")) {
        connectionTest.suggestions = [
          "Проверьте пароль в DATABASE_URL - возможно, он изменился",
          "Получите новый Connection String из Supabase Dashboard",
          "Убедитесь, что проект Supabase активен (не приостановлен)",
          "Проверьте, что используете Connection Pooling URL (порт 6543)",
        ];
      } else if (errorMessage.includes("Connection refused") || errorMessage.includes("ECONNREFUSED")) {
        connectionTest.suggestions = [
          "Проверьте, что проект Supabase активен",
          "Проверьте регион в URL (должен совпадать с регионом проекта)",
          "Проверьте настройки фаервола в Supabase",
        ];
      }
    }

    // Пробуем выполнить простой запрос к таблице User
    let tableTest;
    try {
      const userCount = await prisma.user.count();
      tableTest = {
        status: "success",
        message: `Таблица User доступна. Найдено пользователей: ${userCount}`,
        userCount,
      };
    } catch (tableError: any) {
      tableTest = {
        status: "error",
        message: tableError.message || "Не удалось получить доступ к таблице User",
        error: tableError.message,
      };
    }

    return NextResponse.json({
      status: "completed",
      databaseUrl: {
        configured: true,
        format: urlInfo,
        // Не показываем полный URL из соображений безопасности
        preview: `${urlInfo.projectRef}@${urlInfo.region}:6543`,
      },
      connectionTest,
      tableTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Unknown error",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

