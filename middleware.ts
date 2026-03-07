import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // ВАЖНО: Обновляем сессию Supabase ПЕРЕД отправкой ответа
  // Это обновит cookies если сессия изменилась
  try {
    // Сначала проверяем сессию (это обновит cookies если нужно)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Сессия активна, cookies уже обновлены через getSession
      // Дополнительно проверяем getUser для надежности
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user && !userError) {
        // Все в порядке, сессия валидна
      } else if (userError && userError.message !== "Auth session missing!") {
        console.log("[MIDDLEWARE] Supabase getUser error:", userError.message);
      }
    } else if (sessionError) {
      // Игнорируем ошибки отсутствия сессии - это нормально для неавторизованных пользователей
      if (sessionError.message !== "Auth session missing!") {
        console.log("[MIDDLEWARE] Supabase session error:", sessionError.message);
      }
    }
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

