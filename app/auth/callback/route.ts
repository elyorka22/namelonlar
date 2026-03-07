import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("[CALLBACK] Exchange code result:", { 
      hasUser: !!data.user, 
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (!error && data.user) {
      console.log("[CALLBACK] User authenticated:", data.user.email);
      
      // Синхронизируем пользователя с Prisma
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.user.email! },
        });

        if (!existingUser) {
          console.log("[CALLBACK] Creating user in Prisma:", data.user.email);
          // Создаем пользователя в Prisma
          await prisma.user.create({
            data: {
              email: data.user.email!,
              name:
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                null,
              image:
                data.user.user_metadata?.avatar_url ||
                data.user.user_metadata?.picture ||
                null,
              emailVerified: data.user.email_confirmed_at
                ? new Date(data.user.email_confirmed_at)
                : null,
            },
          });
        } else {
          console.log("[CALLBACK] Updating user in Prisma:", data.user.email);
          // Обновляем информацию о пользователе
          await prisma.user.update({
            where: { email: data.user.email! },
            data: {
              name:
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                existingUser.name,
              image:
                data.user.user_metadata?.avatar_url ||
                data.user.user_metadata?.picture ||
                existingUser.image,
              emailVerified: data.user.email_confirmed_at
                ? new Date(data.user.email_confirmed_at)
                : existingUser.emailVerified,
            },
          });
        }
      } catch (error) {
        console.error("[CALLBACK] Error syncing user to Prisma:", error);
        // Продолжаем даже если синхронизация не удалась
      }
    } else if (error) {
      console.error("[CALLBACK] Error exchanging code:", error.message);
    }
  }

  // URL to redirect to after sign in process completes
  // Добавляем параметр для обновления страницы
  const redirectUrl = new URL(next, request.url);
  redirectUrl.searchParams.set("auth", "success");
  
  // Создаем ответ с редиректом
  const response = NextResponse.redirect(redirectUrl);
  
  // Убеждаемся, что cookies установлены (Supabase должен был их установить через createClient)
  // Но явно проверяем сессию еще раз
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  console.log("[CALLBACK] Final session check:", { 
    hasSession: !!session, 
    userEmail: session?.user?.email 
  });
  
  return response;
}

