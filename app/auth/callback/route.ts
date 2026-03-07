import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Синхронизируем пользователя с Prisma
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.user.email! },
        });

        if (!existingUser) {
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
        console.error("Error syncing user to Prisma:", error);
        // Продолжаем даже если синхронизация не удалась
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, request.url));
}

