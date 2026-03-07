# 🔐 Исправление входа в админ панель

Если получаете ошибку "неправильный пароль или логин", проверьте следующее:

---

## 🔍 Проблема 1: Пароль не захеширован правильно

Пароли должны быть захешированы через **bcrypt** с 10 раундами.

### Проверка текущего пароля:

```sql
SELECT 
    email,
    password,
    CASE 
        WHEN password IS NULL THEN '❌ Нет пароля'
        WHEN password NOT LIKE '$2%' THEN '❌ Неверный формат'
        WHEN LENGTH(password) != 60 THEN '❌ Неверная длина'
        ELSE '✅ Правильный формат'
    END as status
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';
```

**Правильный формат bcrypt hash:**
- Начинается с `$2a$10$` или `$2b$10$`
- Длина: 60 символов
- Пример: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

---

## ✅ Решение: Правильно установить пароль

### Шаг 1: Сгенерируйте хеш пароля

1. Перейдите на **https://bcrypt-generator.com/**
2. Введите ваш пароль (например: `admin123`)
3. Установите **Rounds**: `10`
4. Нажмите **Generate Hash**
5. Скопируйте хеш (должен начинаться с `$2a$10$`)

### Шаг 2: Установите пароль через SQL

В Supabase SQL Editor выполните:

```sql
-- ЗАМЕНИТЕ значения:
-- 1. 'ваш-email@gmail.com' - на ваш email
-- 2. '$2a$10$...' - на хеш из шага 1

UPDATE "User" 
SET 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- хеш вашего пароля
    role = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'ваш-email@gmail.com';
```

### Шаг 3: Проверьте результат

```sql
SELECT 
    email,
    role,
    CASE 
        WHEN password IS NOT NULL AND password LIKE '$2%' AND LENGTH(password) = 60 
        THEN '✅ Готово'
        ELSE '❌ Ошибка'
    END as status
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';
```

---

## 🔍 Проблема 2: Пользователь не существует в таблице User

Если пользователь был создан только через Google OAuth, его может не быть в таблице `User`.

### Решение: Синхронизируйте пользователя

Выполните скрипт `SYNC-USERS-FROM-AUTH.sql` или:

```sql
-- Синхронизируем пользователя из auth.users в User
INSERT INTO "User" (
    id, email, name, password, role, "createdAt", "updatedAt"
)
SELECT 
    id::text,
    email,
    COALESCE(
        raw_user_meta_data->>'full_name',
        raw_user_meta_data->>'name',
        split_part(email, '@', 1)
    ) as name,
    '$2a$10$...',  -- хеш вашего пароля (из bcrypt-generator.com)
    'ADMIN',
    created_at,
    updated_at
FROM auth.users
WHERE email = 'ваш-email@gmail.com'
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP;
```

---

## 🔍 Проблема 3: Неправильный email

Убедитесь, что email точно совпадает (регистр не важен, но пробелы важны).

### Проверка:

```sql
-- Проверяем все пользователи с похожим email
SELECT id, email, name, role 
FROM "User" 
WHERE LOWER(email) LIKE LOWER('%ваш-email%')
ORDER BY email;
```

---

## 🔍 Проблема 4: Роль не ADMIN

Убедитесь, что роль установлена правильно:

```sql
-- Проверяем роль
SELECT email, role FROM "User" WHERE "email" = 'ваш-email@gmail.com';

-- Если роль не ADMIN, установите:
UPDATE "User" 
SET "role" = 'ADMIN' 
WHERE "email" = 'ваш-email@gmail.com';
```

---

## ✅ Полный скрипт для исправления

```sql
-- 1. Проверяем пользователя
SELECT email, name, role, 
       CASE WHEN password IS NOT NULL THEN 'Has password' ELSE 'No password' END as pwd_status
FROM "User" 
WHERE "email" = 'ваш-email@gmail.com';

-- 2. Устанавливаем пароль и роль (ЗАМЕНИТЕ хеш!)
UPDATE "User" 
SET 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- хеш вашего пароля
    role = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'ваш-email@gmail.com';

-- 3. Проверяем результат
SELECT 
    email,
    role,
    CASE 
        WHEN password IS NOT NULL AND password LIKE '$2%' AND LENGTH(password) = 60 
        THEN '✅ Все правильно'
        ELSE '❌ Ошибка в пароле'
    END as status
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';
```

---

## 🧪 Тестирование входа

После установки пароля:

1. **Выйдите** из системы (если авторизованы)
2. Откройте `/auth/signin`
3. Введите ваш **email** и **пароль** (не хеш, а обычный пароль!)
4. Нажмите **Kirish**
5. Должен произойти вход

---

## ⚠️ Важно:

- **В форму входа вводите обычный пароль**, а не хеш!
- Хеш используется только в базе данных
- Пароль должен быть минимум 6 символов
- Bcrypt hash должен быть длиной 60 символов и начинаться с `$2a$10$`

---

## 🐛 Если все еще не работает:

1. Проверьте логи в Vercel (Deployments → Logs)
2. Убедитесь, что `NEXTAUTH_SECRET` установлен в Vercel
3. Проверьте, что пользователь существует в таблице `User` (не только в `auth.users`)
4. Попробуйте создать нового пользователя через форму регистрации

