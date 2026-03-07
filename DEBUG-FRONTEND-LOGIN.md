# 🐛 Отладка входа на фронтенде

Если не можете войти даже на сайт, выполните эти шаги:

---

## 🔍 Шаг 1: Откройте консоль браузера

1. Откройте сайт: **https://namelonlar.vercel.app/auth/signin**
2. Нажмите **F12** (или правой кнопкой → Inspect)
3. Перейдите на вкладку **Console**

---

## 🔍 Шаг 2: Попробуйте войти

1. Введите ваш email и пароль
2. Нажмите **Kirish**
3. Смотрите в консоль - должны появиться логи с `[SIGNIN]`

### Что должно быть в консоли:

```
[SIGNIN] Attempting login with: { email: 'ваш-email@gmail.com', passwordLength: 8 }
[SIGNIN] Test password result: { found: true, hasPassword: true, ... }
[SIGNIN] Test passed, attempting NextAuth signIn
[SIGNIN] NextAuth result: { ok: true } или { error: '...' }
```

---

## 🔍 Шаг 3: Проверьте ошибки

### Если видите "Foydalanuvchi topilmadi":

Проблема: Пользователь не найден в базе данных

**Решение:**
```sql
-- Проверьте, есть ли пользователь
SELECT email FROM "User" WHERE LOWER(email) = LOWER('ваш-email@gmail.com');

-- Если нет, создайте через форму регистрации или SQL
```

### Если видите "Parol o'rnatilmagan":

Проблема: У пользователя нет пароля

**Решение:**
```sql
-- Установите пароль (сгенерируйте хеш на https://bcrypt-generator.com/)
UPDATE "User" 
SET password = '$2a$10$...'  -- ваш хеш
WHERE email = 'ваш-email@gmail.com';
```

### Если видите "Noto'g'ri parol":

Проблема: Пароль не совпадает

**Решение:**
1. Пересоздайте пароль на https://bcrypt-generator.com/
2. Обновите в базе:
   ```sql
   UPDATE "User" 
   SET password = '$2a$10$...'  -- новый хеш
   WHERE email = 'ваш-email@gmail.com';
   ```

### Если видите "NextAuth error":

Проблема: NextAuth не может создать сессию

**Проверьте:**
1. `NEXTAUTH_SECRET` установлен в Vercel
2. `NEXTAUTH_URL` установлен в Vercel
3. Cookies не заблокированы в браузере

---

## 🔍 Шаг 4: Проверьте Network запросы

1. В консоли браузера перейдите на вкладку **Network**
2. Попробуйте войти снова
3. Найдите запрос к `/api/auth/callback/credentials` или `/api/auth/signin`
4. Посмотрите:
   - **Status**: должен быть 200 (OK) или 302 (Redirect)
   - **Response**: что возвращает сервер

### Если Status 401 или 403:

Проблема в авторизации на сервере. Проверьте логи в Vercel.

### Если Status 500:

Ошибка на сервере. Проверьте логи в Vercel.

---

## 🔍 Шаг 5: Проверьте Cookies

1. В консоли браузера → **Application** → **Cookies**
2. Найдите cookies для `namelonlar.vercel.app`
3. Должны быть cookies:
   - `next-auth.session-token` (если вход успешен)
   - `next-auth.csrf-token`

### Если cookies нет:

Сессия не создается. Проверьте:
- `NEXTAUTH_SECRET` в Vercel
- Блокировку cookies в браузере

---

## 🔍 Шаг 6: Проверьте сессию

В консоли браузера выполните:

```javascript
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => {
    console.log('Текущая сессия:', data);
    if (data.user) {
      console.log('✅ Вы авторизованы:', data.user.email);
    } else {
      console.log('❌ Вы не авторизованы');
    }
  });
```

---

## 🎯 Быстрая диагностика

Выполните этот код в консоли браузера:

```javascript
async function diagnoseLogin() {
  const email = 'ваш-email@gmail.com';
  const password = 'ваш-пароль';
  
  console.log('🔍 Диагностика входа...');
  
  // 1. Проверяем пароль
  const passwordTest = await fetch('/api/test-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());
  
  console.log('1. Проверка пароля:', passwordTest);
  
  // 2. Проверяем сессию
  const session = await fetch('/api/auth/session')
    .then(r => r.json());
  
  console.log('2. Текущая сессия:', session);
  
  // 3. Проверяем cookies
  const cookies = document.cookie;
  console.log('3. Cookies:', cookies);
  
  return { passwordTest, session, cookies };
}

// Запустите:
diagnoseLogin().then(console.log);
```

---

## ✅ Решения в зависимости от проблемы:

### Проблема: "Foydalanuvchi topilmadi"

```sql
-- Создайте пользователя через форму регистрации или:
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'ваш-email@gmail.com',
  'Admin',
  '$2a$10$...',  -- хеш пароля
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

### Проблема: "Noto'g'ri parol"

```sql
-- Пересоздайте пароль (хеш на https://bcrypt-generator.com/)
UPDATE "User" 
SET password = '$2a$10$...'  -- новый хеш
WHERE email = 'ваш-email@gmail.com';
```

### Проблема: NextAuth не работает

1. Проверьте `NEXTAUTH_SECRET` в Vercel
2. Проверьте `NEXTAUTH_URL` в Vercel
3. Очистите cookies и попробуйте снова

---

## 🚀 Самый простой способ: Создать нового пользователя

1. Откройте: **https://namelonlar.vercel.app/auth/register**
2. Зарегистрируйтесь
3. Установите роль ADMIN:
   ```sql
   UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'новый-email@gmail.com';
   ```
4. Войдите с новыми данными

