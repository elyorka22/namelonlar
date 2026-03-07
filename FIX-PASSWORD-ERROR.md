# 🔧 Исправление ошибки "Noto'g'ri email yoki parol"

Если вы получаете эту ошибку, выполните проверки по порядку:

---

## 🔍 Шаг 1: Проверьте формат пароля в базе данных

Выполните SQL скрипт `VERIFY-PASSWORD-ISSUE.sql` в Supabase SQL Editor.

Он покажет:
- ✅ Правильный формат (bcrypt, 60 символов)
- ❌ Неверный формат (нужно пересоздать)

---

## 🔍 Шаг 2: Проверьте email

### Проблема: Регистр email

Email должен совпадать точно (или быть в нижнем регистре).

**Проверка:**
```sql
SELECT email, LOWER(email) as email_lowercase 
FROM "User" 
WHERE LOWER(email) = LOWER('ваш-email@gmail.com');
```

**Решение:**
Если в базе email с заглавными буквами, обновите его:
```sql
UPDATE "User" 
SET email = LOWER(email)
WHERE email = 'ваш-Email@gmail.com';
```

### Проблема: Пробелы в email

**Проверка:**
```sql
SELECT email, LENGTH(email) as length, TRIM(email) as trimmed
FROM "User" 
WHERE email LIKE '% %';
```

**Решение:**
```sql
UPDATE "User" 
SET email = TRIM(email)
WHERE email != TRIM(email);
```

---

## 🔍 Шаг 3: Пересоздайте пароль правильно

### Шаг 3.1: Сгенерируйте новый хеш

1. Откройте: **https://bcrypt-generator.com/**
2. Введите ваш пароль (например: `admin123`)
3. Установите **Rounds**: `10`
4. Нажмите **Generate Hash**
5. Скопируйте хеш (должен начинаться с `$2a$10$...` и быть длиной 60 символов)

### Шаг 3.2: Обновите пароль в базе

```sql
-- ЗАМЕНИТЕ значения:
UPDATE "User" 
SET 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- ваш хеш
    email = LOWER(TRIM(email)),  -- нормализуем email
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'ваш-email@gmail.com';  -- ваш email
```

### Шаг 3.3: Проверьте результат

```sql
SELECT 
    email,
    role,
    CASE 
        WHEN password LIKE '$2%' AND LENGTH(password) = 60 
        THEN '✅ OK'
        ELSE '❌ Ошибка'
    END as status
FROM "User"
WHERE "email" = 'ваш-email@gmail.com';
```

---

## 🔍 Шаг 4: Очистите кэш и попробуйте снова

1. **Выйдите** из системы
2. Очистите cookies браузера (F12 → Application → Cookies)
3. Закройте браузер
4. Откройте снова
5. Попробуйте войти:
   - Email: ваш-email@gmail.com (в нижнем регистре, без пробелов)
   - Пароль: ваш обычный пароль (не хеш!)

---

## 🔍 Шаг 5: Проверьте логи в Vercel

После попытки входа проверьте логи:

1. Vercel Dashboard → ваш проект → **Deployments** → последний deployment → **Logs**
2. Ищите строки с `[AUTH]`:
   - `[AUTH] User not found` → пользователь не найден
   - `[AUTH] User has no password` → нет пароля
   - `[AUTH] Password is not in bcrypt format` → неверный формат пароля
   - `[AUTH] Invalid password` → пароль не совпадает
   - `[AUTH] Login successful` → вход успешен ✅

---

## 🎯 Самый простой способ: Создать нового пользователя

Если ничего не помогает, создайте нового пользователя через форму регистрации:

1. Откройте: **https://namelonlar.vercel.app/auth/register**
2. Зарегистрируйтесь с новым email и паролем
3. Установите роль ADMIN:
   ```sql
   UPDATE "User" 
   SET "role" = 'ADMIN' 
   WHERE "email" = 'новый-email@gmail.com';
   ```
4. Войдите с новыми данными

---

## ⚠️ Частые ошибки:

1. **Вводите обычный пароль, а не хеш!**
   - ❌ Неправильно: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
   - ✅ Правильно: `admin123`

2. **Email должен быть в нижнем регистре**
   - ❌ Неправильно: `Admin@Example.com`
   - ✅ Правильно: `admin@example.com`

3. **Пароль в базе должен быть bcrypt хешем**
   - ❌ Неправильно: `admin123` (обычный текст)
   - ✅ Правильно: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

---

## 🔑 Пример правильного SQL:

```sql
-- 1. Нормализуем email
UPDATE "User" 
SET email = LOWER(TRIM(email))
WHERE email = 'ваш-Email@gmail.com';

-- 2. Устанавливаем правильный bcrypt хеш
-- (сгенерируйте на https://bcrypt-generator.com/)
UPDATE "User" 
SET 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    role = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE LOWER(email) = LOWER('ваш-email@gmail.com');

-- 3. Проверяем
SELECT 
    email,
    role,
    CASE 
        WHEN password LIKE '$2%' AND LENGTH(password) = 60 
        THEN '✅ Готово'
        ELSE '❌ Ошибка'
    END as status
FROM "User"
WHERE LOWER(email) = LOWER('ваш-email@gmail.com');
```

---

## ✅ После исправления:

1. Очистите cookies браузера
2. Войдите с нормализованным email (нижний регистр) и обычным паролем
3. Должен произойти вход! ✅

