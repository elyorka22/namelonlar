import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = 'force-dynamic';

/**
 * Диагностический endpoint для проверки авторизации
 * Показывает где хранятся данные пользователя
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const requestCookies = request.cookies.getAll();
    
    // 1. Проверяем Supabase Auth (auth.users)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return requestCookies.length > 0 ? requestCookies : cookieStore.getAll();
          },
          setAll() {
            // Не устанавливаем cookies в GET запросе
          },
        },
      }
    );
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
    
    // 2. Проверяем Prisma (public.User)
    let prismaUser = null;
    if (session?.user?.email || supabaseUser?.email) {
      const email = session?.user?.email || supabaseUser?.email;
      try {
        prismaUser = await prisma.user.findUnique({
          where: { email: email! },
        });
      } catch (error: any) {
        console.error("[DEBUG-AUTH] Error querying Prisma:", error.message);
      }
    }
    
    // 3. Проверяем getCurrentUser()
    const currentUser = await getCurrentUser();
    
    // 4. Проверяем все пользователи в Prisma (для диагностики)
    let allPrismaUsers: Array<{
      id: string;
      email: string | null;
      name: string | null;
      createdAt: Date;
    }> = [];
    try {
      allPrismaUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    } catch (error: any) {
      console.error("[DEBUG-AUTH] Error querying all users:", error.message);
    }
    
    return NextResponse.json({
      cookies: {
        total: requestCookies.length,
        supabaseCookies: requestCookies.filter(c => 
          c.name.includes('supabase') || c.name.includes('sb-')
        ).length,
      },
      supabaseAuth: {
        hasSession: !!session,
        hasUser: !!supabaseUser,
        email: session?.user?.email || supabaseUser?.email || null,
        userId: session?.user?.id || supabaseUser?.id || null,
        sessionError: sessionError?.message || null,
        userError: userError?.message || null,
        // Показываем откуда данные
        source: session ? "getSession()" : supabaseUser ? "getUser()" : "none",
      },
      prismaDatabase: {
        found: !!prismaUser,
        userId: prismaUser?.id || null,
        email: prismaUser?.email || null,
        name: prismaUser?.name || null,
        hasPassword: !!prismaUser?.password,
        createdAt: prismaUser?.createdAt || null,
      },
      getCurrentUser: {
        found: !!currentUser,
        userId: currentUser?.id || null,
        email: currentUser?.email || null,
        name: currentUser?.name || null,
      },
      syncStatus: {
        supabaseToPrisma: session?.user?.email && prismaUser?.email 
          ? (session.user.email === prismaUser.email ? "✅ Synced" : "❌ Email mismatch")
          : "❌ Not synced",
        getCurrentUserWorks: !!currentUser && !!prismaUser 
          ? (currentUser.id === prismaUser.id ? "✅ Works" : "❌ ID mismatch")
          : "❌ Not working",
      },
      recentUsers: allPrismaUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

