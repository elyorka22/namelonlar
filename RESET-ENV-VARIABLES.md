# 🔄 Сброс переменных окружения

Список переменных, которые нужно удалить и создать заново для исправления проблемы с базой данных.

---

## 🔴 КРИТИЧНЫЕ переменные (обязательно пересоздать)

### 1. DATABASE_URL ⚠️ ГЛАВНАЯ ПРОБЛЕМА

**Удалите и создайте заново:**

1. В Vercel → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Нажмите **Delete** (удалите)
4. Нажмите **Add New**
5. **Key**: `DATABASE_URL`
6. **Value**: Получите новый Connection String из Supabase:
   - Supabase Dashboard → ваш проект → **Settings** → **Database**
   - Найдите **Connection Pooling** → **Transaction mode**
   - Скопируйте Connection String
   - Формат: `postgresql://postgres.xxx:password@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true`
7. **Environment**: Выберите **ВСЕ** (Production, Preview, Development)
8. Нажмите **Save**

---

### 2. NEXTAUTH_SECRET

**Удалите и создайте заново:**

1. Удалите `NEXTAUTH_SECRET`
2. Сгенерируйте новый секрет:
   - Онлайн: https://generate-secret.vercel.app/32
   - Или: `openssl rand -base64 32`
3. Создайте новую переменную:
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: сгенерированный секрет (минимум 32 символа)
   - **Environment**: Все (Production, Preview, Development)

---

### 3. NEXTAUTH_URL

**Удалите и создайте заново:**

1. Удалите `NEXTAUTH_URL`
2. Создайте новую переменную:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://namelonlar.vercel.app` (ваш production URL)
   - **Environment**: Все (Production, Preview, Development)

---

## 🟡 Важные переменные (проверьте)

### 4. NEXT_PUBLIC_SUPABASE_URL

**Проверьте и обновите если нужно:**

1. В Supabase → **Settings** → **API**
2. Найдите **Project URL**
3. Скопируйте URL
4. В Vercel проверьте `NEXT_PUBLIC_SUPABASE_URL`
5. Если отличается, обновите

---

### 5. NEXT_PUBLIC_SUPABASE_ANON_KEY

**Проверьте и обновите если нужно:**

1. В Supabase → **Settings** → **API**
2. Найдите **anon public** key
3. Скопируйте ключ
4. В Vercel проверьте `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Если отличается, обновите

---

### 6. SUPABASE_SERVICE_ROLE_KEY

**Проверьте и обновите если нужно:**

1. В Supabase → **Settings** → **API**
2. Найдите **service_role** key (⚠️ секретный!)
3. Скопируйте ключ
4. В Vercel проверьте `SUPABASE_SERVICE_ROLE_KEY`
5. Если отличается, обновите

---

## 🟢 Опциональные переменные (можно оставить)

### 7. GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET

Эти переменные используются для Google OAuth через NextAuth, но сейчас используется Supabase Auth. Можно оставить или удалить.

---

## 📋 Полный список для пересоздания

### Шаг 1: Удалите эти переменные

1. `DATABASE_URL` ⚠️
2. `NEXTAUTH_SECRET` ⚠️
3. `NEXTAUTH_URL` ⚠️

### Шаг 2: Получите новые значения

#### DATABASE_URL:
1. Supabase Dashboard → ваш проект → **Settings** → **Database**
2. **Connection Pooling** → **Transaction mode**
3. Скопируйте Connection String
4. Убедитесь, что пароль правильный

#### NEXTAUTH_SECRET:
1. Сгенерируйте: https://generate-secret.vercel.app/32
2. Или: `openssl rand -base64 32`

#### NEXTAUTH_URL:
```
https://namelonlar.vercel.app
```

### Шаг 3: Создайте заново в Vercel

1. Vercel → **Settings** → **Environment Variables**
2. Для каждой переменной:
   - Нажмите **Add New**
   - Введите **Key** и **Value**
   - Выберите **ВСЕ окружения** (Production, Preview, Development)
   - Нажмите **Save**

### Шаг 4: Сделайте Redeploy

**КРИТИЧНО:** После обновления переменных нужен **Redeploy**!

1. Vercel → **Deployments**
2. Нажмите **...** → **Redeploy**

---

## ✅ Проверка после пересоздания

После redeploy выполните в консоли браузера:

```javascript
// Проверка DATABASE_URL
fetch('/api/check-db')
  .then(r => r.json())
  .then(data => {
    console.log('DATABASE_URL:', data);
    if (data.status && data.status.includes('✅')) {
      console.log('✅ DATABASE_URL правильный!');
    }
  });

// Проверка подключения
fetch('/api/test-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'esalimov15@gmail.com',
    password: 'ваш-пароль'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Тест подключения:', data);
  if (!data.error) {
    console.log('✅ Подключение работает!');
  }
});
```

---

## ⚠️ Важно

1. **Всегда выбирайте ВСЕ окружения** (Production, Preview, Development)
2. **После изменения переменных нужен Redeploy**
3. **Проверяйте пароль в DATABASE_URL** - он должен совпадать с паролем в Supabase
4. **Используйте Connection Pooling URL** (порт 6543, не 5432)

---

## 🎯 Порядок действий

1. ✅ Удалите `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
2. ✅ Получите новые значения из Supabase
3. ✅ Создайте переменные заново в Vercel
4. ✅ Убедитесь, что выбраны все окружения
5. ✅ Сделайте Redeploy
6. ✅ Проверьте через API

