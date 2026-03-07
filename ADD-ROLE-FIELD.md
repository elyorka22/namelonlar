# 🔧 Добавление поля role в таблицу User

Если в таблице User нет поля `role`, нужно добавить его вручную.

---

## 🚀 Способ 1: Через SQL запрос в Supabase (Быстро)

### Шаг 1: Откройте SQL Editor

1. Supabase Dashboard → ваш проект → **SQL Editor**
2. Нажмите **New Query**

### Шаг 2: Выполните SQL запрос

Скопируйте и выполните этот SQL:

```sql
-- Создаем enum для ролей (если еще не создан)
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Добавляем поле role в таблицу User (если его нет)
DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" DEFAULT 'USER';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Обновляем существующие записи (если role NULL, устанавливаем USER)
UPDATE "User" SET "role" = 'USER' WHERE "role" IS NULL;
```

Нажмите **Run** или `Ctrl+Enter`

### Шаг 3: Проверьте результат

Выполните запрос для проверки:

```sql
SELECT id, email, name, role FROM "User" LIMIT 5;
```

Должно быть видно поле `role` со значением `USER` для всех пользователей.

---

## 🚀 Способ 2: Через Prisma db push (Локально)

Если вы работаете локально:

### Шаг 1: Убедитесь, что DATABASE_URL установлен

```bash
# Проверьте .env файл
cat .env | grep DATABASE_URL
```

### Шаг 2: Синхронизируйте схему с базой данных

```bash
npx prisma db push
```

Это синхронизирует схему Prisma с базой данных и добавит недостающие поля.

---

## 🚀 Способ 3: Создать миграцию

### Шаг 1: Создайте миграцию

```bash
npx prisma migrate dev --name add_user_role
```

### Шаг 2: Примените миграцию

```bash
npx prisma migrate deploy
```

---

## ✅ После добавления поля role

### Шаг 1: Установите роль ADMIN для вашего пользователя

В Supabase SQL Editor выполните:

```sql
-- Замените на ваш email
UPDATE "User" 
SET "role" = 'ADMIN' 
WHERE "email" = 'ваш-email@gmail.com';
```

### Шаг 2: Проверьте результат

```sql
SELECT id, email, name, role 
FROM "User" 
WHERE "email" = 'ваш-email@gmail.com';
```

Должно быть видно `role = 'ADMIN'`

### Шаг 3: Войдите в админ панель

1. Выйдите из системы (если авторизованы)
2. Войдите снова
3. Перейдите на `/admin`

---

## 🔍 Проверка всех полей таблицы User

Чтобы увидеть все поля таблицы User, выполните:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;
```

Должны быть видны все поля, включая `role`.

---

## ⚠️ Если поле все еще не видно

1. **Обновите страницу** в Supabase Dashboard
2. **Проверьте, что запрос выполнился без ошибок**
3. **Попробуйте выйти и войти снова** в Supabase Dashboard

---

## 📝 Полный SQL для копирования

Если нужно выполнить все сразу:

```sql
-- 1. Создаем enum
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Добавляем поле role
DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" DEFAULT 'USER';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 3. Обновляем существующие записи
UPDATE "User" SET "role" = 'USER' WHERE "role" IS NULL;

-- 4. Устанавливаем ADMIN для вашего email (замените на ваш)
UPDATE "User" 
SET "role" = 'ADMIN' 
WHERE "email" = 'ваш-email@gmail.com';

-- 5. Проверяем результат
SELECT id, email, name, role FROM "User";
```

