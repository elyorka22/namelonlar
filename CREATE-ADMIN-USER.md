# 👤 Создание админ пользователя с паролем

Есть несколько способов создать админ пользователя с паролем.

---

## 🚀 Способ 1: Через форму регистрации (Простой)

### Шаг 1: Зарегистрируйтесь на сайте

1. Откройте ваш сайт: `https://namelonlar.vercel.app`
2. Перейдите на `/auth/register`
3. Заполните форму:
   - **Ism**: Ваше имя
   - **Email**: Ваш email
   - **Parol**: Ваш пароль (минимум 6 символов)
   - **Parolni tasdiqlang**: Подтвердите пароль
4. Нажмите **Ro'yxatdan o'tish**

### Шаг 2: Установите роль ADMIN

После регистрации установите роль ADMIN через SQL:

```sql
-- Замените на ваш email
UPDATE "User" 
SET "role" = 'ADMIN' 
WHERE "email" = 'ваш-email@gmail.com';
```

### Шаг 3: Войдите в админ панель

1. Войдите на сайт с вашим email и паролем
2. Перейдите на `/admin`

---

## 🚀 Способ 2: Создать через SQL (Быстро)

Если хотите создать админ пользователя напрямую через SQL:

### Шаг 1: Сгенерируйте хеш пароля

Пароли хешируются через bcrypt. Используйте один из способов:

**Вариант A: Онлайн генератор**
- Перейдите на https://bcrypt-generator.com/
- Введите ваш пароль
- Скопируйте хеш (должен начинаться с `$2a$` или `$2b$`)

**Вариант B: Через Node.js (локально)**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('ваш-пароль', 10).then(console.log)"
```

### Шаг 2: Создайте пользователя через SQL

В Supabase SQL Editor выполните:

```sql
-- Замените значения на ваши
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
    gen_random_uuid()::text,  -- или используйте cuid()
    'admin@example.com',      -- ваш email
    'Admin User',             -- ваше имя
    '$2a$10$...',             -- хеш пароля (из шага 1)
    'ADMIN',                  -- роль
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP;
```

---

## 🚀 Способ 3: Установить пароль для существующего пользователя

Если у вас уже есть пользователь (например, созданный через Google OAuth):

### Шаг 1: Сгенерируйте хеш пароля

Используйте https://bcrypt-generator.com/ или Node.js

### Шаг 2: Обновите пользователя

```sql
-- Замените на ваш email и хеш пароля
UPDATE "User" 
SET 
    password = '$2a$10$...',  -- хеш вашего пароля
    role = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'ваш-email@gmail.com';
```

---

## 🔐 Генерация хеша пароля

### Онлайн (Рекомендуется):

1. Перейдите на https://bcrypt-generator.com/
2. Введите ваш пароль (например: `admin123`)
3. Установите **Rounds**: `10`
4. Нажмите **Generate Hash**
5. Скопируйте хеш (например: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`)

### Через Node.js (локально):

```bash
# В папке проекта
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log('Hash:', h))"
```

---

## ✅ Проверка

После создания пользователя проверьте:

```sql
SELECT id, email, name, role, 
       CASE WHEN password IS NOT NULL THEN 'Has password' ELSE 'No password' END as password_status
FROM "User" 
WHERE "email" = 'ваш-email@gmail.com';
```

Должно быть видно:
- `role = 'ADMIN'`
- `password_status = 'Has password'`

---

## 🔑 Пример полного SQL скрипта

```sql
-- 1. Генерируем хеш пароля (замените 'admin123' на ваш пароль)
-- Используйте https://bcrypt-generator.com/ для генерации хеша

-- 2. Создаем или обновляем админ пользователя
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
    'admin@namelonlar.uz',                    -- ваш email
    'Admin',                                  -- ваше имя
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- хеш пароля 'admin123'
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP;

-- 3. Проверяем результат
SELECT id, email, name, role FROM "User" WHERE "email" = 'admin@namelonlar.uz';
```

---

## 🎯 После создания:

1. Откройте сайт: `https://namelonlar.vercel.app`
2. Перейдите на `/auth/signin`
3. Войдите с вашим email и паролем
4. Перейдите на `/admin`
5. Должна открыться админ панель! ✅

---

## ⚠️ Важно:

- **Минимальная длина пароля**: 6 символов
- Пароли хранятся в хешированном виде (bcrypt)
- Не храните пароли в открытом виде
- Используйте надежные пароли для админ аккаунтов

