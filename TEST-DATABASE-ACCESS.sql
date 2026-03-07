-- Тестовые запросы для проверки доступа к таблицам
-- Выполните эти запросы после отключения RLS

-- 1. Проверка доступа к таблице User
SELECT COUNT(*) as "User count" FROM "User";

-- 2. Проверка структуры таблицы User
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;

-- 3. Проверка наличия поля role
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'User' 
AND column_name = 'role';

-- 4. Просмотр всех пользователей (если есть)
SELECT id, email, name, role, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- 5. Проверка всех таблиц
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

