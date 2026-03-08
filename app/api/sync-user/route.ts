import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Endpoint для принудительной синхронизации пользователя из Supabase Auth в Prisma
 * Используйте если пользователь авторизован, но не найден в Prisma
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const requestCookies = request.cookies.getAll();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return requestCookies.length > 0 ? requestCookies : cookieStore.getAll();
          },
          setAll() {
            // Не устанавливаем cookies в POST запросе
          },
        },
      }
    );
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 }
      );
    }
    
    const email = session.user.email!;
    
    // Проверяем, есть ли пользователь в Prisma
    let prismaUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (prismaUser) {
      return NextResponse.json({
        success: true,
        message: "User already exists in Prisma",
        user: {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name,
        },
      });
    }
    
    // Создаем пользователя в Prisma
    try {
      prismaUser = await prisma.user.create({
        data: {
          email: email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
          image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
          emailVerified: session.user.email_confirmed_at ? new Date(session.user.email_confirmed_at) : null,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: "User synced to Prisma successfully",
        user: {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name,
        },
      });
    } catch (createError: any) {
      if (createError.code === 'P2002') {
        // Пользователь уже существует (race condition)
        prismaUser = await prisma.user.findUnique({
          where: { email },
        });
        return NextResponse.json({
          success: true,
          message: "User already exists (race condition)",
          user: {
            id: prismaUser!.id,
            email: prismaUser!.email,
            name: prismaUser!.name,
          },
        });
      }
      throw createError;
    }
  } catch (error: any) {
    console.error("[SYNC-USER] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

