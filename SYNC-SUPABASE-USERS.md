# 🔄 Синхронизация пользователей Supabase Auth с таблицей User

В Supabase есть **две разные таблицы** пользователей:

1. **`auth.users`** - встроенная таблица Supabase Auth (нет поля `role`)
2. **`public.User`** - наша таблица Prisma (есть поле `role`)

---

## 🔍 Где искать пользователей:

### ❌ НЕ здесь:
- Authentication → Users (это `auth.users`, там нет поля `role`)

### ✅ Здесь:
- **Table Editor** → **User** (это `public.User`, там есть поле `role`)

---

## 🚀 Как найти вашего пользователя:

### Способ 1: Через Table Editor

1. Supabase Dashboard → **Table Editor**
2. Найдите таблицу **User** (не Authentication → Users!)
3. Найдите вашу запись по email
4. Должно быть видно поле `role`

### Способ 2: Через SQL запрос

```sql
-- Просмотр всех пользователей в таблице User
SELECT id, email, name, role, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;
```

---

## ⚠️ Если пользователя нет в таблице User:

Это означает, что синхронизация не сработала. Нужно создать пользователя вручную или исправить синхронизацию.

### Решение: Создать пользователя вручную

```sql
-- Найдите ваш email в auth.users
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'ваш-email@gmail.com';

-- Создайте пользователя в таблице User
INSERT INTO "User" (
    id,
    email,
    name,
    image,
    "emailVerified",
    role,
    "createdAt",
    "updatedAt"
)
SELECT 
    id::text,
    email,
    COALESCE(
        raw_user_meta_data->>'full_name',
        raw_user_meta_data->>'name',
        split_part(email, '@', 1)
    ) as name,
    COALESCE(
        raw_user_meta_data->>'avatar_url',
        raw_user_meta_data->>'picture'
    ) as image,
    email_confirmed_at as "emailVerified",
    'USER' as role,
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM auth.users
WHERE email = 'ваш-email@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM "User" WHERE email = auth.users.email
);
```

---

## ✅ После создания пользователя:

### Установите роль ADMIN:

```sql
UPDATE "User" 
SET "role" = 'ADMIN' 
WHERE "email" = 'ваш-email@gmail.com';
```

### Проверьте результат:

```sql
SELECT id, email, name, role 
FROM "User" 
WHERE "email" = 'ваш-email@gmail.com';
```

---

## 🔄 Автоматическая синхронизация:

Пользователи должны автоматически синхронизироваться при входе через Google (см. `app/auth/callback/route.ts`). 

Если синхронизация не работает:
1. Проверьте логи в Vercel
2. Убедитесь, что callback route работает
3. Попробуйте войти через Google снова

---

## 📝 Быстрый способ для всех пользователей:

Если нужно синхронизировать всех пользователей из `auth.users` в `User`:

```sql
-- Синхронизация всех пользователей из auth.users в User
INSERT INTO "User" (
    id,
    email,
    name,
    image,
    "emailVerified",
    role,
    "createdAt",
    "updatedAt"
)
SELECT 
    id::text,
    email,
    COALESCE(
        raw_user_meta_data->>'full_name',
        raw_user_meta_data->>'name',
        split_part(email, '@', 1)
    ) as name,
    COALESCE(
        raw_user_meta_data->>'avatar_url',
        raw_user_meta_data->>'picture'
    ) as image,
    email_confirmed_at as "emailVerified",
    'USER' as role,
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM "User" WHERE "User".email = auth.users.email
)
ON CONFLICT (email) DO NOTHING;
```

После этого все пользователи будут в таблице `User` с полем `role`.

