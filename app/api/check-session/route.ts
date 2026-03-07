import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth-helpers";

/**
 * Тестовый endpoint для проверки сессии на сервере
 * Используйте только для диагностики!
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Проверяем Supabase cookies
    const supabaseCookies = allCookies.filter(c => 
      c.name.includes('supabase') || c.name.includes('sb-')
    );
    
    // Проверяем сессию через Supabase
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Проверяем через getCurrentUser
    const currentUser = await getCurrentUser();
    
    return NextResponse.json({
      cookies: {
        total: allCookies.length,
        supabase: supabaseCookies.length,
        supabaseCookieNames: supabaseCookies.map(c => c.name),
      },
      supabaseSession: {
        hasSession: !!session,
        hasUser: !!user,
        userEmail: session?.user?.email || user?.email || null,
        sessionError: sessionError?.message || null,
        userError: userError?.message || null,
      },
      getCurrentUser: {
        found: !!currentUser,
        userId: currentUser?.id || null,
        userEmail: currentUser?.email || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

