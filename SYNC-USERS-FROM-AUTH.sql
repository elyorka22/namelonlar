-- Синхронизация пользователей из auth.users в таблицу User
-- Выполните этот скрипт в Supabase SQL Editor

-- Синхронизируем всех пользователей из auth.users в User
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
    id::text as id,
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
ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(
        EXCLUDED.name,
        "User".name,
        split_part(EXCLUDED.email, '@', 1)
    ),
    image = COALESCE(EXCLUDED.image, "User".image),
    "emailVerified" = COALESCE(EXCLUDED."emailVerified", "User"."emailVerified"),
    "updatedAt" = CURRENT_TIMESTAMP;

-- Проверка результата
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u."createdAt"
FROM "User" u
ORDER BY u."createdAt" DESC;

