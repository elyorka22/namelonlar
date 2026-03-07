# 🔓 Исправление Row Level Security (RLS) политик

В Supabase по умолчанию включен Row Level Security (RLS), который блокирует доступ к таблицам. Нужно либо отключить RLS, либо создать политики доступа.

---

## 🚀 Способ 1: Отключить RLS (Быстро, для разработки)

### Шаг 1: Откройте SQL Editor

1. Supabase Dashboard → ваш проект → **SQL Editor**
2. Нажмите **New Query**

### Шаг 2: Выполните SQL скрипт

Скопируйте и выполните содержимое файла `DISABLE-RLS.sql`:

```sql
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
```

Нажмите **Run**

### Шаг 3: Проверьте результат

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Все таблицы должны иметь `rowsecurity = false`

---

## 🚀 Способ 2: Создать политики RLS (Рекомендуется для production)

Если хотите оставить RLS включенным, создайте политики доступа:

```sql
-- Политики для таблицы User
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users" ON "User"
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid()::text = id);

-- Политики для таблицы Listing
ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings" ON "Listing"
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Users can create listings" ON "Listing"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own listings" ON "Listing"
    FOR UPDATE USING (auth.uid()::text = "userId");

-- Политики для таблицы Category
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON "Category"
    FOR SELECT USING (true);

-- Политики для таблицы Favorite
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON "Favorite"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own favorites" ON "Favorite"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own favorites" ON "Favorite"
    FOR DELETE USING (auth.uid()::text = "userId");

-- Политики для таблицы Banner
ALTER TABLE "Banner" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners" ON "Banner"
    FOR SELECT USING ("isActive" = true);

-- Политики для таблицы Conversation
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON "Conversation"
    FOR SELECT USING (
        auth.uid()::text = "participant1Id" OR 
        auth.uid()::text = "participant2Id"
    );

-- Политики для таблицы Message
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations" ON "Message"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Conversation" 
            WHERE "Conversation".id = "Message"."conversationId"
            AND (
                "Conversation"."participant1Id" = auth.uid()::text OR
                "Conversation"."participant2Id" = auth.uid()::text
            )
        )
    );

CREATE POLICY "Users can send messages" ON "Message"
    FOR INSERT WITH CHECK (auth.uid()::text = "senderId");

-- Остальные таблицы (Account, Session, VerificationToken, Report)
-- Обычно используются только серверной частью, можно оставить RLS отключенным
```

---

## ⚠️ Важно:

**Для разработки и тестирования:**
- Используйте **Способ 1** (отключить RLS) - это проще и быстрее

**Для production:**
- Используйте **Способ 2** (создать политики) - это безопаснее

---

## 🔍 Проверка после отключения RLS

После выполнения скрипта проверьте:

```sql
-- Проверка статуса RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Все таблицы должны иметь `rowsecurity = false`

---

## ✅ После исправления RLS

1. Попробуйте снова открыть таблицы в Supabase Table Editor
2. Должны быть видны все данные
3. Можно будет редактировать поле `role` в таблице User

