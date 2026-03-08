import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Создает Supabase клиент для Server Components (read-only cookies)
 * Cookies устанавливаются только в middleware или Route Handlers
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // В Server Components может выбросить — middleware подхватит обновление
          }
        },
      },
    }
  );
}

