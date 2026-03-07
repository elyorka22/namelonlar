-- Проверка проблемы с паролем
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Проверяем пользователя и его пароль
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password IS NULL THEN '❌ НЕТ ПАРОЛЯ'
        WHEN password = '' THEN '❌ ПУСТОЙ ПАРОЛЬ'
        WHEN password NOT LIKE '$2%' THEN '❌ НЕВЕРНЫЙ ФОРМАТ (не bcrypt)'
        WHEN LENGTH(password) != 60 THEN '❌ НЕВЕРНАЯ ДЛИНА (должно быть 60)'
        ELSE '✅ ПРАВИЛЬНЫЙ ФОРМАТ'
    END as password_status,
    LENGTH(password) as password_length,
    LEFT(password, 15) as password_preview,
    "createdAt",
    "updatedAt"
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

-- 2. Проверяем регистр email (может быть проблема)
SELECT 
    email,
    LOWER(email) as email_lowercase,
    CASE 
        WHEN email != LOWER(email) THEN '⚠️ Email с заглавными буквами'
        ELSE '✅ Email в нижнем регистре'
    END as email_case
FROM "User"
WHERE LOWER(email) = LOWER('ваш-email@gmail.com');  -- ЗАМЕНИТЕ на ваш email

-- 3. Показываем все пользователи с похожим email (на случай опечатки)
SELECT 
    id,
    email,
    name,
    role,
    CASE WHEN password IS NOT NULL THEN 'Has password' ELSE 'No password' END as pwd
FROM "User"
WHERE LOWER(email) LIKE LOWER('%ваш-email%')  -- ЗАМЕНИТЕ на часть вашего email
ORDER BY email;

-- 4. Если пароль не в правильном формате, нужно пересоздать его
-- Сначала сгенерируйте хеш на https://bcrypt-generator.com/
-- Затем выполните:

/*
UPDATE "User" 
SET 
    password = '$2a$10$...',  -- ЗАМЕНИТЕ на хеш из bcrypt-generator.com
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email
*/

-- 5. Финальная проверка
SELECT 
    email,
    role,
    CASE 
        WHEN password IS NOT NULL 
             AND password LIKE '$2%' 
             AND LENGTH(password) = 60 
             AND role = 'ADMIN'
        THEN '✅ ВСЁ ПРАВИЛЬНО'
        ELSE '❌ ЕСТЬ ПРОБЛЕМЫ'
    END as final_status
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

