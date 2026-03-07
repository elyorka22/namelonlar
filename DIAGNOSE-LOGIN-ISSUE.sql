-- Полная диагностика проблемы с входом в админ панель
-- Выполните этот скрипт в Supabase SQL Editor

-- ============================================
-- 1. ПРОВЕРКА ПОЛЬЗОВАТЕЛЯ В ТАБЛИЦЕ User
-- ============================================
SELECT 
    '=== ПРОВЕРКА ПОЛЬЗОВАТЕЛЯ ===' as section;

SELECT 
    id,
    email,
    name,
    role,
    CASE 
        WHEN password IS NULL THEN '❌ НЕТ ПАРОЛЯ'
        WHEN password = '' THEN '❌ ПУСТОЙ ПАРОЛЬ'
        WHEN password NOT LIKE '$2%' THEN '❌ НЕВЕРНЫЙ ФОРМАТ (не bcrypt)'
        WHEN LENGTH(password) != 60 THEN '❌ НЕВЕРНАЯ ДЛИНА (должно быть 60)'
        ELSE '✅ ПАРОЛЬ УСТАНОВЛЕН ПРАВИЛЬНО'
    END as password_status,
    LENGTH(password) as password_length,
    LEFT(password, 10) as password_prefix,
    "createdAt",
    "updatedAt"
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

-- Если пользователь не найден, проверьте все пользователи:
SELECT 
    '=== ВСЕ ПОЛЬЗОВАТЕЛИ ===' as section;

SELECT 
    id,
    email,
    name,
    role,
    CASE WHEN password IS NOT NULL THEN 'Has password' ELSE 'No password' END as pwd
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10;

-- ============================================
-- 2. ПРОВЕРКА В auth.users (Supabase Auth)
-- ============================================
SELECT 
    '=== ПРОВЕРКА В auth.users ===' as section;

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users
WHERE email = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

-- ============================================
-- 3. ПРОВЕРКА РОЛИ
-- ============================================
SELECT 
    '=== ПРОВЕРКА РОЛИ ===' as section;

SELECT 
    email,
    role,
    CASE 
        WHEN role = 'ADMIN' THEN '✅ ADMIN'
        WHEN role = 'MODERATOR' THEN '⚠️ MODERATOR'
        ELSE '❌ USER'
    END as role_status
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

-- ============================================
-- 4. СОЗДАНИЕ/ОБНОВЛЕНИЕ АДМИН ПОЛЬЗОВАТЕЛЯ
-- ============================================
-- ВАЖНО: Сначала сгенерируйте хеш пароля на https://bcrypt-generator.com/
-- Пример для пароля 'admin123': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

SELECT 
    '=== СОЗДАНИЕ/ОБНОВЛЕНИЕ АДМИНА ===' as section;

-- Раскомментируйте и выполните после генерации хеша:
/*
INSERT INTO "User" (
    id,
    email,
    name,
    password,
    role,
    "createdAt",
    "updatedAt"
)
VALUES (
    gen_random_uuid()::text,
    'admin@example.com',  -- ЗАМЕНИТЕ на ваш email
    'Admin',              -- ЗАМЕНИТЕ на ваше имя
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- ЗАМЕНИТЕ на хеш вашего пароля
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = 'ADMIN',
    name = COALESCE(EXCLUDED.name, "User".name),
    "updatedAt" = CURRENT_TIMESTAMP;
*/

-- ============================================
-- 5. ПРОВЕРКА ФИНАЛЬНОГО РЕЗУЛЬТАТА
-- ============================================
SELECT 
    '=== ФИНАЛЬНАЯ ПРОВЕРКА ===' as section;

SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password IS NOT NULL 
             AND password LIKE '$2%' 
             AND LENGTH(password) = 60 
             AND role = 'ADMIN'
        THEN '✅ ВСЕ ПРАВИЛЬНО - МОЖНО ВХОДИТЬ'
        ELSE '❌ ЕСТЬ ПРОБЛЕМЫ'
    END as final_status,
    CASE WHEN password IS NOT NULL THEN 'Has password' ELSE 'No password' END as pwd_status,
    CASE WHEN role = 'ADMIN' THEN 'Admin role' ELSE 'Not admin' END as role_status
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

