import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { syncUserFromSupabase } from "@/lib/sync-user";

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
  // Согласно документации Supabase SSR, нужно вызывать getUser() для обновления сессии
  try {
    // Вызываем getUser() - это обновит cookies если сессия изменилась или истекла
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (user) {
      // Сессия активна, cookies обновлены через getUser()
      // Дополнительно вызываем getSession() для синхронизации
      await supabase.auth.getSession();
      
      // ВАЖНО: Синхронизируем пользователя в Prisma если его там нет
      // Это гарантирует, что пользователь будет синхронизирован при первом запросе после авторизации
      // Делаем это только для определенных путей (профиль, API) чтобы не замедлять все запросы
      const path = request.nextUrl.pathname;
      if (path.startsWith("/profile") || path.startsWith("/api/profile") || path.startsWith("/admin")) {
        try {
          // Быстрая проверка - синхронизируем только если нужно
          // Используем короткий timeout чтобы не замедлять запрос
          const syncPromise = syncUserFromSupabase(user);
          const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 500));
          
          // Ждем либо синхронизацию, либо timeout (500ms)
          await Promise.race([syncPromise, timeoutPromise]);
          
          // Если синхронизация завершилась быстро, логируем
          const syncResult = await syncPromise.catch(() => null);
          if (syncResult?.created) {
            console.log("[MIDDLEWARE] ✅ User synced to Prisma:", user.email);
          }
        } catch (syncError) {
          // Игнорируем ошибки синхронизации в middleware - getCurrentUser() обработает
          console.log("[MIDDLEWARE] Sync skipped (will be handled by getCurrentUser)");
        }
      }
    } else if (error) {
      // Игнорируем ошибки отсутствия сессии - это нормально для неавторизованных пользователей
      if (error.message !== "Auth session missing!") {
        console.log("[MIDDLEWARE] Supabase getUser error:", error.message);
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

