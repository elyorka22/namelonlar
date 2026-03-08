import { prisma } from "@/lib/prisma";
import { User } from "@supabase/supabase-js";

/**
 * Централизованная функция для синхронизации пользователя из Supabase Auth в Prisma
 * Используется в callback route и getCurrentUser() для гарантированной синхронизации
 */
export async function syncUserFromSupabase(supabaseUser: User): Promise<{
  success: boolean;
  user: any;
  created: boolean;
  error?: string;
}> {
  const email = supabaseUser.email!;
  
  try {
    // Проверяем, есть ли пользователь в Prisma
    let prismaUser = await prisma.user.findUnique({
      where: { email },
    });

    if (prismaUser) {
      // Пользователь существует, обновляем информацию если нужно
      const needsUpdate = 
        (supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name) !== prismaUser.name ||
        (supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture) !== prismaUser.image;
      
      if (needsUpdate) {
        try {
          prismaUser = await prisma.user.update({
            where: { email },
            data: {
              name: supabaseUser.user_metadata?.full_name || 
                    supabaseUser.user_metadata?.name || 
                    prismaUser.name,
              image: supabaseUser.user_metadata?.avatar_url || 
                     supabaseUser.user_metadata?.picture || 
                     prismaUser.image,
              emailVerified: supabaseUser.email_confirmed_at 
                ? new Date(supabaseUser.email_confirmed_at) 
                : prismaUser.emailVerified,
            },
          });
        } catch (updateError: any) {
          console.error("[SYNC-USER] Error updating user:", updateError);
          // Продолжаем с существующими данными
        }
      }
      
      return {
        success: true,
        user: prismaUser,
        created: false,
      };
    }

    // Пользователя нет, создаем его
    try {
      prismaUser = await prisma.user.create({
        data: {
          email: email,
          name: supabaseUser.user_metadata?.full_name || 
                supabaseUser.user_metadata?.name || 
                null,
          image: supabaseUser.user_metadata?.avatar_url || 
                 supabaseUser.user_metadata?.picture || 
                 null,
          emailVerified: supabaseUser.email_confirmed_at 
            ? new Date(supabaseUser.email_confirmed_at) 
            : null,
        },
      });
      
      console.log("[SYNC-USER] ✅ User created in Prisma:", prismaUser.id, email);
      
      return {
        success: true,
        user: prismaUser,
        created: true,
      };
    } catch (createError: any) {
      // Если пользователь уже существует (race condition), получаем его
      if (createError.code === 'P2002') {
        console.log("[SYNC-USER] User already exists (race condition), fetching:", email);
        prismaUser = await prisma.user.findUnique({
          where: { email },
        });
        
        if (prismaUser) {
          return {
            success: true,
            user: prismaUser,
            created: false,
          };
        }
      }
      
      throw createError;
    }
  } catch (error: any) {
    console.error("[SYNC-USER] ❌ Error syncing user:", error);
    return {
      success: false,
      user: null,
      created: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Синхронизация с retry логикой (для критических мест)
 */
export async function syncUserWithRetry(
  supabaseUser: User,
  maxRetries: number = 3
): Promise<{ success: boolean; user: any }> {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await syncUserFromSupabase(supabaseUser);
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error;
    console.log(`[SYNC-USER] Retry attempt ${attempt}/${maxRetries} failed:`, lastError);
    
    // Небольшая задержка перед повтором
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }
  
  console.error("[SYNC-USER] ❌ All retry attempts failed:", lastError);
  return {
    success: false,
    user: null,
  };
}

