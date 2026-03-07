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
      
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            // В API routes можно устанавливать cookies
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            },
          },
        }
      );
      
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        console.log("[API-UPDATE] Found user via direct Supabase check:", supabaseUser.email);
        
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
          console.log("[API-UPDATE] ✅ User found via Supabase:", currentUser.email);
        } else {
          console.log("[API-UPDATE] ❌ User not found in Prisma");
        }
      } else {
        console.log("[API-UPDATE] ❌ No Supabase user found:", userError?.message);
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

