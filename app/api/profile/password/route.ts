import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log("[API-PASSWORD] Checking authentication...");
    
    // Пробуем получить пользователя через getCurrentUser
    let currentUser = await getCurrentUser();
    console.log("[API-PASSWORD] getCurrentUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");
    
    // Если getCurrentUser не нашел пользователя, пробуем напрямую через Supabase
    if (!currentUser?.id) {
      console.log("[API-PASSWORD] getCurrentUser failed, trying direct Supabase check...");
      
      try {
        // Пробуем использовать cookies из request напрямую
        const requestCookies = request.cookies.getAll();
        console.log("[API-PASSWORD] Request cookies:", requestCookies.length);
        
        const supabaseCookies = requestCookies.filter(c => 
          c.name.includes('supabase') || c.name.includes('sb-')
        );
        console.log("[API-PASSWORD] Supabase cookies in request:", supabaseCookies.length, supabaseCookies.map(c => c.name));
        
        // Также пробуем через cookies()
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        console.log("[API-PASSWORD] Cookies() total:", allCookies.length);
        
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
        console.log("[API-PASSWORD] Supabase session:", { hasSession: !!session, error: sessionError?.message });
        
        if (session?.user) {
          console.log("[API-PASSWORD] Found user via Supabase session:", session.user.email);
          
          // Находим пользователя в Prisma
          const prismaUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
          });
          
          if (prismaUser) {
            currentUser = {
              id: prismaUser.id,
              email: prismaUser.email,
              name: prismaUser.name,
              image: prismaUser.image,
            };
            console.log("[API-PASSWORD] ✅ User found via Supabase session:", currentUser.email);
          } else {
            console.log("[API-PASSWORD] ❌ User not found in Prisma");
          }
        } else {
          // Пробуем getUser
          const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
          console.log("[API-PASSWORD] Supabase getUser:", { hasUser: !!supabaseUser, error: userError?.message });
          
          if (supabaseUser) {
            console.log("[API-PASSWORD] Found user via Supabase getUser:", supabaseUser.email);
            
            // Находим пользователя в Prisma
            const prismaUser = await prisma.user.findUnique({
              where: { email: supabaseUser.email! },
            });
            
            if (prismaUser) {
              currentUser = {
                id: prismaUser.id,
                email: prismaUser.email,
                name: prismaUser.name,
                image: prismaUser.image,
              };
              console.log("[API-PASSWORD] ✅ User found via Supabase getUser:", currentUser.email);
            } else {
              console.log("[API-PASSWORD] ❌ User not found in Prisma");
            }
          } else {
            console.log("[API-PASSWORD] ❌ No Supabase user found");
          }
        }
      } catch (supabaseError: any) {
        console.error("[API-PASSWORD] Error in Supabase check:", supabaseError.message);
      }
    }
    
    if (!currentUser?.id) {
      console.log("[API-PASSWORD] ❌ No user found, returning 401");
      return NextResponse.json(
        { error: "Авторизация требуется. Iltimos, qayta kirib ko'ring." },
        { status: 401 }
      );
    }
    
    console.log("[API-PASSWORD] ✅ User authenticated:", currentUser.email);

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: "Yangi parol kiritilmadi" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Parol kamida 6 belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    // Получаем пользователя из базы
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Если у пользователя уже есть пароль, проверяем текущий
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Joriy parol kiritilmadi" },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Joriy parol noto'g'ri" },
          { status: 400 }
        );
      }
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: user.password 
        ? "Parol muvaffaqiyatli o'zgartirildi" 
        : "Parol muvaffaqiyatli o'rnatildi",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

