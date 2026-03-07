-- Проверка и установка пароля для пользователя
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Проверяем текущего пользователя
SELECT 
    id,
    email,
    name,
    role,
    CASE 
        WHEN password IS NULL THEN '❌ Нет пароля'
        WHEN password = '' THEN '❌ Пустой пароль'
        ELSE '✅ Есть пароль'
    END as password_status,
    LENGTH(password) as password_length
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

-- 2. Проверяем формат пароля (должен быть bcrypt hash)
-- Bcrypt hash начинается с $2a$, $2b$ или $2y$ и имеет длину 60 символов
SELECT 
    email,
    password,
    CASE 
        WHEN password IS NULL THEN 'Нет пароля'
        WHEN password NOT LIKE '$2%' THEN '⚠️ Неверный формат (не bcrypt)'
        WHEN LENGTH(password) != 60 THEN '⚠️ Неверная длина'
        ELSE '✅ Правильный формат'
    END as password_format
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

-- 3. Пример правильного bcrypt hash для пароля 'admin123':
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- 
-- Сгенерируйте хеш на https://bcrypt-generator.com/
-- Введите ваш пароль, установите Rounds: 10, нажмите Generate

-- 4. Установите пароль (ЗАМЕНИТЕ хеш на ваш)
UPDATE "User" 
SET 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- ЗАМЕНИТЕ на хеш вашего пароля
    role = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

-- 5. Проверяем результат
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password IS NOT NULL AND password LIKE '$2%' AND LENGTH(password) = 60 
        THEN '✅ Пароль установлен правильно'
        ELSE '❌ Пароль не установлен или неверный формат'
    END as status
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';  -- ЗАМЕНИТЕ на ваш email

