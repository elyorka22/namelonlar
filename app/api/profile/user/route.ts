import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getSupabaseUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { syncUserFromSupabase } from "@/lib/sync-user";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log("[API-PROFILE-USER] Checking authentication...");
    
    // Используем новую быструю проверку через Supabase
    let currentUser = await getCurrentUser();
    console.log("[API-PROFILE-USER] getCurrentUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");

    // Если getCurrentUser не нашел, пробуем напрямую через Supabase (fallback)
    if (!currentUser?.id) {
      console.log("[API-PROFILE-USER] getCurrentUser failed, trying getSupabaseUser...");
      currentUser = await getSupabaseUser();
      console.log("[API-PROFILE-USER] getSupabaseUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");
    }

    if (!currentUser?.id) {
      console.log("[API-PROFILE-USER] getCurrentUser failed, trying direct Supabase check...");
      
      try {
        const cookieStore = await cookies();
        const requestCookies = request.cookies.getAll();
        console.log("[API-PROFILE-USER] Request cookies:", requestCookies.length);
        console.log("[API-PROFILE-USER] CookieStore cookies:", cookieStore.getAll().length);
        
        const response = NextResponse.next();
        
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return requestCookies.length > 0 ? requestCookies : cookieStore.getAll();
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
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("[API-PROFILE-USER] Supabase session:", { hasSession: !!session, error: sessionError?.message });
        
        if (session?.user) {
          console.log("[API-PROFILE-USER] Found user via Supabase session:", session.user.email);
          
          // ВАЖНО: Используем функцию синхронизации для гарантированной синхронизации
          const syncResult = await syncUserFromSupabase(session.user);
          if (syncResult.success && syncResult.user) {
            currentUser = { 
              id: syncResult.user.id, 
              email: syncResult.user.email, 
              name: syncResult.user.name, 
              image: syncResult.user.image 
            };
            if (syncResult.created) {
              console.log("[API-PROFILE-USER] ✅ User was missing in Prisma, synced now:", currentUser.id);
            }
          }
        } else {
          const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
          if (supabaseUser) {
            console.log("[API-PROFILE-USER] Found user via Supabase getUser:", supabaseUser.email);
            
            // ВАЖНО: Используем функцию синхронизации для гарантированной синхронизации
            const syncResult = await syncUserFromSupabase(supabaseUser);
            if (syncResult.success && syncResult.user) {
              currentUser = { 
                id: syncResult.user.id, 
                email: syncResult.user.email, 
                name: syncResult.user.name, 
                image: syncResult.user.image 
              };
              if (syncResult.created) {
                console.log("[API-PROFILE-USER] ✅ User was missing in Prisma, synced now:", currentUser.id);
              }
            }
          }
        }
      } catch (supabaseError: any) {
        console.error("[API-PROFILE-USER] Error in Supabase check:", supabaseError.message);
      }
    }

    if (!currentUser?.id) {
      console.log("[API-PROFILE-USER] ❌ No user found, returning 401");
      return NextResponse.json(
        { error: "Авторизация требуется" },
        { status: 401 }
      );
    }

    console.log("[API-PROFILE-USER] ✅ User authenticated:", currentUser.email);

    // Пробуем получить пользователя из Prisma
    let user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
      },
    });

    // Если пользователя нет в Prisma, используем данные из Supabase
    // Синхронизация произойдет асинхронно
    if (!user) {
      console.log("[API-PROFILE-USER] User not in Prisma, using Supabase data");
      
      // Запускаем синхронизацию в фоне
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        syncUserFromSupabase(session.user).catch((error) => {
          console.error("[API-PROFILE-USER] Sync error (non-blocking):", error);
        });
      }
      
      // Возвращаем данные из Supabase
      user = {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        image: currentUser.image,
        password: null, // Пароль хранится только в Prisma
      };
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[API-PROFILE-USER] Error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

