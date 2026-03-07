-- Полная проверка и исправление RLS для всех таблиц
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Проверяем текущее состояние RLS
SELECT 
    tablename, 
    rowsecurity as "RLS Enabled",
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as "Status"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Отключаем RLS для всех таблиц (безопасно для повторного выполнения)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'User', 'Account', 'Session', 'VerificationToken',
            'Category', 'Listing', 'Favorite', 'Conversation',
            'Message', 'Report', 'Banner'
        )
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
        RAISE NOTICE 'RLS disabled for table: %', r.tablename;
    END LOOP;
END $$;

-- 3. Удаляем все существующие политики (если есть)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Policy dropped: %.%', r.tablename, r.policyname;
    END LOOP;
END $$;

-- 4. Проверяем результат
SELECT 
    tablename, 
    rowsecurity as "RLS Enabled",
    CASE WHEN rowsecurity THEN 'ENABLED ⚠️' ELSE 'DISABLED ✅' END as "Status"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'User', 'Account', 'Session', 'VerificationToken',
    'Category', 'Listing', 'Favorite', 'Conversation',
    'Message', 'Report', 'Banner'
)
ORDER BY tablename;

-- 5. Проверяем, что политик больше нет
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

