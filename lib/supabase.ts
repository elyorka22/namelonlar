import { createClient } from "@supabase/supabase-js";

// Client для серверных операций (загрузка файлов)
// Создаем клиент только если переменные окружения установлены
export const supabaseAdmin = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
    : null;

