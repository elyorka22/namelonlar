# Как выдать роль админа в Supabase

Роль пользователя (USER, MODERATOR, ADMIN) для входа через **Supabase Auth** хранится в `app_metadata` пользователя. Проверка роли делается без запроса в Prisma — данные берутся из сессии Supabase.

## Через SQL в Supabase Dashboard

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект → **SQL Editor**.
2. Выполните (подставьте нужный email):

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "ADMIN"}'::jsonb
WHERE email = 'admin@example.com';
```

Для модератора: замените `"ADMIN"` на `"MODERATOR"`.

3. Пользователю нужно перелогиниться (выйти и зайти снова), чтобы обновился JWT с новой ролью.

## Через Supabase Admin API (серверный код)

Если у вас есть endpoint для назначения админов, используйте Service Role Key и метод обновления пользователя:

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // только на сервере!
  { auth: { persistSession: false } }
);

await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { role: "ADMIN" },
});
```

## NextAuth (email/password)

Для пользователей, которые входят через NextAuth (логин/пароль), роль по-прежнему хранится в Prisma (таблица `User`, поле `role`). Её можно менять через Prisma Studio или админ-панель.
