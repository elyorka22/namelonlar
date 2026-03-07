-- Создание админ пользователя с паролем
-- ВАЖНО: Сначала сгенерируйте хеш пароля на https://bcrypt-generator.com/

-- Пример: пароль 'admin123' -> хеш '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
-- ЗАМЕНИТЕ хеш на ваш собственный!

-- Создаем или обновляем админ пользователя
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
    'admin@namelonlar.uz',                    -- ЗАМЕНИТЕ на ваш email
    'Admin',                                 -- ЗАМЕНИТЕ на ваше имя
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- ЗАМЕНИТЕ на хеш вашего пароля
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP;

-- Проверяем результат
SELECT 
    id, 
    email, 
    name, 
    role,
    CASE WHEN password IS NOT NULL THEN 'Has password ✅' ELSE 'No password ❌' END as password_status
FROM "User" 
WHERE "email" = 'admin@namelonlar.uz';  -- ЗАМЕНИТЕ на ваш email

