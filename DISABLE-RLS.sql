-- Отключение Row Level Security (RLS) для всех таблиц
-- Выполните этот скрипт в Supabase SQL Editor после создания таблиц

-- Отключаем RLS для всех таблиц
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Listing" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Banner" DISABLE ROW LEVEL SECURITY;

-- Проверка: все таблицы должны иметь RLS отключенным
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

