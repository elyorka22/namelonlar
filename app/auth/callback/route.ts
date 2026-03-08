import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { syncUserWithRetry } from "@/lib/sync-user";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  // В Route Handler можно устанавливать cookies
  const cookieStore = await cookies();
  
  // URL to redirect to after sign in process completes
  const redirectUrl = new URL(next, request.url);
  redirectUrl.searchParams.set("auth", "success");
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    // Создаем клиент с полным доступом к cookies для Route Handler
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("[CALLBACK] Exchange code result:", { 
      hasUser: !!data.user, 
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (!error && data.user) {
      console.log("[CALLBACK] User authenticated:", data.user.email);
      
      // ВАЖНО: Синхронизируем пользователя с Prisma с retry логикой
      const syncResult = await syncUserWithRetry(data.user, 3);
      
      if (syncResult.success && syncResult.user) {
        console.log("[CALLBACK] ✅ User synced to Prisma:", syncResult.user.id, syncResult.user.email);
        if (syncResult.created) {
          console.log("[CALLBACK] ✅ User was created in Prisma");
        } else {
          console.log("[CALLBACK] ✅ User already existed in Prisma, updated if needed");
        }
      } else {
        console.error("[CALLBACK] ❌ Failed to sync user to Prisma after retries");
        // Продолжаем - getCurrentUser() попробует синхронизировать позже
      }
      
      // ВАЖНО: Вызываем getSession после exchangeCodeForSession
      // Это гарантирует, что cookies будут установлены правильно
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("[CALLBACK] Final session check:", { 
        hasSession: !!session, 
        userEmail: session?.user?.email,
        sessionError: sessionError?.message
      });
      
      // Проверяем, что cookies установлены
      const finalCookies = cookieStore.getAll();
      const supabaseCookies = finalCookies.filter(c => 
        c.name.includes('supabase') || c.name.includes('sb-')
      );
      console.log("[CALLBACK] Supabase cookies after exchange:", supabaseCookies.length);
      
      if (!session) {
        console.error("[CALLBACK] ⚠️ WARNING: Session not found after exchangeCodeForSession!");
      }
    } else if (error) {
      console.error("[CALLBACK] Error exchanging code:", error.message);
    }
  }
  
  return response;
}

