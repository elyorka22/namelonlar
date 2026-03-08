import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log("[API-UPDATE] Checking authentication...");
    
    // Пробуем получить пользователя через getCurrentUser
    let currentUser = await getCurrentUser();
    console.log("[API-UPDATE] getCurrentUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");
    
    // Если getCurrentUser не нашел пользователя, пробуем напрямую через Supabase
    if (!currentUser?.id) {
      console.log("[API-UPDATE] getCurrentUser failed, trying direct Supabase check...");
      
      try {
        // Пробуем использовать cookies из request напрямую
        const requestCookies = request.cookies.getAll();
        console.log("[API-UPDATE] Request cookies:", requestCookies.length);
        
        const supabaseCookies = requestCookies.filter(c => 
          c.name.includes('supabase') || c.name.includes('sb-')
        );
        console.log("[API-UPDATE] Supabase cookies in request:", supabaseCookies.length, supabaseCookies.map(c => c.name));
        
        // Также пробуем через cookies()
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        console.log("[API-UPDATE] Cookies() total:", allCookies.length);
        
        // Создаем response для установки cookies
        const response = NextResponse.next();
        
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                // Пробуем сначала request cookies, потом cookies()
                return requestCookies.length > 0 ? requestCookies : cookieStore.getAll();
              },
              // В API routes можно устанавливать cookies
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                  response.cookies.set(name, value, options);
                });
              },
            },
          }
        );
        
        // Пробуем getSession сначала
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("[API-UPDATE] Supabase session:", { hasSession: !!session, error: sessionError?.message });
        
        if (session?.user) {
          console.log("[API-UPDATE] Found user via Supabase session:", session.user.email);
          
          // Находим пользователя в Prisma
          const prismaUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
          });
          
          if (prismaUser) {
            const role: string = prismaUser.role === "ADMIN" || prismaUser.role === "MODERATOR" ? prismaUser.role : "USER";
            currentUser = {
              id: prismaUser.id,
              email: prismaUser.email,
              name: prismaUser.name,
              image: prismaUser.image,
              role,
            };
            console.log("[API-UPDATE] ✅ User found via Supabase session:", currentUser.email);
          } else {
            console.log("[API-UPDATE] ❌ User not found in Prisma");
          }
        } else {
          // Пробуем getUser
          const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
          console.log("[API-UPDATE] Supabase getUser:", { hasUser: !!supabaseUser, error: userError?.message });
          
          if (supabaseUser) {
            console.log("[API-UPDATE] Found user via Supabase getUser:", supabaseUser.email);
            
            // Находим пользователя в Prisma
            const prismaUser = await prisma.user.findUnique({
              where: { email: supabaseUser.email! },
            });
            
            if (prismaUser) {
              const role: string = prismaUser.role === "ADMIN" || prismaUser.role === "MODERATOR" ? prismaUser.role : "USER";
              currentUser = {
                id: prismaUser.id,
                email: prismaUser.email,
                name: prismaUser.name,
                image: prismaUser.image,
                role,
              };
              console.log("[API-UPDATE] ✅ User found via Supabase getUser:", currentUser.email);
            } else {
              console.log("[API-UPDATE] ❌ User not found in Prisma");
            }
          } else {
            console.log("[API-UPDATE] ❌ No Supabase user found");
          }
        }
      } catch (supabaseError: any) {
        console.error("[API-UPDATE] Error in Supabase check:", supabaseError.message);
      }
    }
    
    if (!currentUser?.id) {
      console.log("[API-UPDATE] ❌ No user found, returning 401");
      return NextResponse.json(
        { error: "Авторизация требуется. Iltimos, qayta kirib ko'ring." },
        { status: 401 }
      );
    }
    
    console.log("[API-UPDATE] ✅ User authenticated:", currentUser.email);

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Ism kiritilmadi" },
        { status: 400 }
      );
    }

    // Обновляем профиль
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { name: name.trim() },
    });

    return NextResponse.json({
      success: true,
      message: "Profil muvaffaqiyatli yangilandi",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

