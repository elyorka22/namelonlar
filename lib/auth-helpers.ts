import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Получить текущего пользователя (работает с NextAuth и Supabase)
 * Приоритет: Supabase Auth (для Google OAuth), затем NextAuth (для email/password)
 */
export async function getCurrentUser() {
  // Сначала проверяем Supabase Auth (для Google OAuth)
  try {
    const supabase = await createClient();
    
    // Проверяем cookies для диагностики
    let cookieStore;
    try {
      cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      const supabaseCookies = allCookies.filter(c => 
        c.name.includes('supabase') || c.name.includes('sb-')
      );
      console.log("[AUTH] Total cookies:", allCookies.length, "Supabase cookies:", supabaseCookies.length);
      if (supabaseCookies.length > 0) {
        console.log("[AUTH] Supabase cookie names:", supabaseCookies.map(c => c.name));
      }
    } catch (cookieError) {
      // Игнорируем ошибки cookies во время сборки
      console.log("[AUTH] Cookie check error (likely build time):", cookieError);
    }
    
    // Согласно документации Supabase SSR, getUser() более надежен для проверки авторизации
    // Но сначала пробуем getSession() для чтения из cookies
    let { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Если getSession не нашел сессию, пробуем getUser() (он может обновить токен)
    if (!session?.user && !sessionError) {
      console.log("[AUTH] No session from getSession, trying getUser()...");
      const { data: { user: fallbackUser }, error: fallbackError } = await supabase.auth.getUser();
      if (fallbackUser) {
        console.log("[AUTH] ✅ Found user via getUser() fallback:", fallbackUser.email);
        // Если getUser нашел пользователя, получаем полную сессию
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (fallbackSession?.user) {
          session = fallbackSession;
        }
      }
    }
    
    if (session?.user) {
      console.log("[AUTH] ✅ Supabase session found for user:", session.user.email);
      console.log("[AUTH] Session expires at:", session.expires_at);
      
      // Проверяем, есть ли пользователь в Prisma
      let prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
      });

      // Если пользователя нет в Prisma, создаем его
      if (!prismaUser) {
        console.log("[AUTH] Creating user in Prisma:", session.user.email);
        try {
          prismaUser = await prisma.user.create({
            data: {
              email: session.user.email!,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
              image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
              emailVerified: session.user.email_confirmed_at ? new Date(session.user.email_confirmed_at) : null,
            },
          });
        } catch (createError: any) {
          // Если пользователь уже существует (race condition), получаем его
          if (createError.code === 'P2002') {
            console.log("[AUTH] User already exists, fetching:", session.user.email);
            prismaUser = await prisma.user.findUnique({
              where: { email: session.user.email! },
            });
          } else {
            throw createError;
          }
        }
      }

      if (prismaUser) {
        console.log("[AUTH] ✅ Returning user from Supabase session:", prismaUser.id, prismaUser.email);
        return {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name,
          image: prismaUser.image,
        };
      } else {
        console.log("[AUTH] ❌ Failed to create/find user in Prisma");
      }
    } else if (sessionError) {
      console.log("[AUTH] ❌ Supabase session error:", sessionError.message);
      console.log("[AUTH] Session error code:", sessionError.status);
      // Не возвращаем null сразу - пробуем getUser
    } else {
      console.log("[AUTH] ⚠️ No Supabase session found");
      // Не возвращаем null сразу - пробуем getUser
    }
    
    // Если getSession не сработал, пробуем getUser (fallback)
    if (!session?.user) {
      console.log("[AUTH] Trying getUser as fallback...");
      const {
        data: { user: supabaseUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        console.log("[AUTH] ✅ Supabase user found via getUser:", supabaseUser.email);
        
        // Проверяем, есть ли пользователь в Prisma
        let prismaUser = await prisma.user.findUnique({
          where: { email: supabaseUser.email! },
        });

        // Если пользователя нет в Prisma, создаем его
        if (!prismaUser) {
          console.log("[AUTH] Creating user in Prisma:", supabaseUser.email);
          try {
            prismaUser = await prisma.user.create({
              data: {
                email: supabaseUser.email!,
                name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
                image: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
                emailVerified: supabaseUser.email_confirmed_at ? new Date(supabaseUser.email_confirmed_at) : null,
              },
            });
          } catch (createError: any) {
            // Если пользователь уже существует (race condition), получаем его
            if (createError.code === 'P2002') {
              console.log("[AUTH] User already exists, fetching:", supabaseUser.email);
              prismaUser = await prisma.user.findUnique({
                where: { email: supabaseUser.email! },
              });
            } else {
              throw createError;
            }
          }
        }

        if (prismaUser) {
          console.log("[AUTH] ✅ Returning user from Supabase getUser:", prismaUser.id, prismaUser.email);
          return {
            id: prismaUser.id,
            email: prismaUser.email,
            name: prismaUser.name,
            image: prismaUser.image,
          };
        } else {
          console.log("[AUTH] ❌ Failed to create/find user in Prisma via getUser");
        }
      } else if (userError) {
        console.log("[AUTH] ❌ Supabase getUser error:", userError.message);
        console.log("[AUTH] User error code:", userError.status);
      } else {
        console.log("[AUTH] ⚠️ No Supabase user found via getUser");
      }
    }
  } catch (error) {
    console.error("[AUTH] ❌ Error in Supabase auth check:", error);
    if (error instanceof Error) {
      console.error("[AUTH] Error message:", error.message);
      console.error("[AUTH] Error stack:", error.stack);
    }
    // Продолжаем с NextAuth
  }

  // Затем проверяем NextAuth (для email/password)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      console.log("[AUTH] NextAuth session found for user:", session.user.id);
      return session.user;
    } else {
      console.log("[AUTH] No NextAuth session found");
    }
  } catch (error) {
    console.error("[AUTH] Error getting NextAuth session:", error);
    // Не логируем ошибки во время сборки
    if (process.env.NODE_ENV !== "production" || typeof window === "undefined") {
      // Только в development или если не в браузере
    }
  }

  console.log("[AUTH] No user found");
  return null;
}

