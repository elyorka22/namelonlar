import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Упрощенный middleware
 * 
 * Принципы:
 * 1. Только обновляет cookies если нужно
 * 2. Не проверяет авторизацию (это делают страницы и API routes)
 * 3. Не блокирует запросы
 * 4. Не синхронизирует с Prisma (это делают страницы и API routes при необходимости)
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Только обновляем cookies если нужно
  // Не проверяем авторизацию - это делают страницы и API routes
  try {
    // Просто вызываем getSession() для обновления cookies если сессия есть
    await supabase.auth.getSession();
  } catch (error) {
    // Игнорируем ошибки - это нормально для неавторизованных пользователей
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

