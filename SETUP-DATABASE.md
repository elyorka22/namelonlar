# 🗄️ Настройка базы данных с нуля

Если таблицы не существуют, выполните этот скрипт.

---

## 🚀 Быстрое решение

### Шаг 1: Откройте SQL Editor в Supabase

1. Supabase Dashboard → ваш проект → **SQL Editor**
2. Нажмите **New Query**

### Шаг 2: Выполните SQL скрипт

1. Откройте файл `CREATE-DATABASE-TABLES.sql` в проекте
2. Скопируйте **весь** содержимое файла
3. Вставьте в SQL Editor в Supabase
4. Нажмите **Run** или `Ctrl+Enter`

### Шаг 3: Проверьте результат

Выполните запрос для проверки:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Должны быть видны таблицы:
- User
- Account
- Session
- Category
- Listing
- Favorite
- Conversation
- Message
- Report
- Banner

---

## ✅ После создания таблиц

### Шаг 1: Установите роль ADMIN для вашего пользователя

```sql
-- Замените на ваш email
UPDATE "User" 
SET "role" = 'ADMIN' 
WHERE "email" = 'ваш-email@gmail.com';
```

### Шаг 2: Проверьте

```sql
SELECT id, email, name, role FROM "User";
```

---

## 🔄 Альтернативный способ: Prisma db push

Если вы работаете локально:

### Шаг 1: Установите DATABASE_URL

```bash
# Скачайте переменные окружения из Vercel
vercel env pull .env.local
```

Или создайте `.env.local` с:

```env
DATABASE_URL="postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Шаг 2: Синхронизируйте схему

```bash
npx prisma db push
```

Это создаст все таблицы автоматически.

---

## ⚠️ Важно

- **Не удаляйте** существующие данные, если они есть
- Скрипт использует `CREATE TABLE IF NOT EXISTS`, поэтому безопасен для повторного выполнения
- Если таблицы уже существуют, скрипт их не изменит

---

## 🐛 Если возникают ошибки

1. **Ошибка "relation already exists":**
   - Это нормально, значит таблица уже создана
   - Продолжайте выполнение скрипта

2. **Ошибка "type already exists":**
   - Это нормально, значит enum уже создан
   - Продолжайте выполнение скрипта

3. **Ошибка "constraint already exists":**
   - Это нормально, значит ограничение уже создано
   - Продолжайте выполнение скрипта

---

## 📝 Проверка всех таблиц

После выполнения скрипта проверьте:

```sql
-- Список всех таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Проверка структуры таблицы User
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;
```

Должно быть видно поле `role` типа `UserRole`.

