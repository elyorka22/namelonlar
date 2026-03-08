import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log("[API-PROFILE-USER] Checking authentication...");
    
    let currentUser = await getCurrentUser();
    console.log("[API-PROFILE-USER] getCurrentUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");

    // Fallback: если getCurrentUser не нашел, пробуем напрямую через Supabase
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
          const prismaUser = await prisma.user.findUnique({ where: { email: session.user.email! } });
          if (prismaUser) {
            currentUser = { id: prismaUser.id, email: prismaUser.email, name: prismaUser.name, image: prismaUser.image };
          }
        } else {
          const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
          if (supabaseUser) {
            console.log("[API-PROFILE-USER] Found user via Supabase getUser:", supabaseUser.email);
            const prismaUser = await prisma.user.findUnique({ where: { email: supabaseUser.email! } });
            if (prismaUser) {
              currentUser = { id: prismaUser.id, email: prismaUser.email, name: prismaUser.name, image: prismaUser.image };
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

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
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

