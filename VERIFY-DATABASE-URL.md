# 🔍 Проверка DATABASE_URL в Vercel

Если все еще получаете ошибку "FATAL: Tenant or user not found", выполните эти проверки:

---

## 🔍 Шаг 1: Проверьте DATABASE_URL через API

После деплоя откройте консоль браузера (F12) и выполните:

```javascript
fetch('/api/check-db')
  .then(r => r.json())
  .then(data => {
    console.log('Проверка DATABASE_URL:', data);
    
    if (!data.hasDatabaseUrl) {
      console.error('❌ DATABASE_URL не установлен в Vercel!');
    } else if (!data.details.isCorrectFormat) {
      console.error('❌ Неправильный формат DATABASE_URL:', data.status);
      console.log('Детали:', data.details);
    } else {
      console.log('✅ DATABASE_URL правильный:', data.status);
    }
  });
```

Это покажет, установлен ли DATABASE_URL и правильный ли его формат.

---

## 🔍 Шаг 2: Проверьте в Vercel Dashboard

1. Откройте **Vercel Dashboard** → ваш проект → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Убедитесь, что:
   - ✅ Переменная существует
   - ✅ Значение правильное (Connection Pooling URL)
   - ✅ Выбраны **все окружения** (Production, Preview, Development)

---

## 🔍 Шаг 3: Проверьте, что переменная применена

**Важно:** После установки/изменения переменных окружения нужен **Redeploy**!

1. В Vercel → **Deployments**
2. Найдите последний deployment
3. Проверьте, когда он был создан:
   - Если он был создан **ДО** установки DATABASE_URL, нужен **Redeploy**
   - Если он был создан **ПОСЛЕ** установки DATABASE_URL, переменная должна быть применена

---

## 🔍 Шаг 4: Сделайте Redeploy

1. В Vercel → **Deployments**
2. Найдите последний deployment
3. Нажмите **...** → **Redeploy**
4. Или создайте пустой commit:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

---

## 🔍 Шаг 5: Проверьте пароль в Supabase

Ошибка "Tenant or user not found" может означать неправильный пароль.

1. Откройте **Supabase Dashboard** → ваш проект
2. Перейдите в **Settings** → **Database**
3. Найдите **Database password**
4. Если пароль другой, обновите `DATABASE_URL` в Vercel:
   ```
   postgresql://postgres.ohzuxcilqyanybqqmitw:НОВЫЙ_ПАРОЛЬ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Сделайте **Redeploy**

---

## 🔍 Шаг 6: Проверьте проект Supabase

1. Откройте **Supabase Dashboard**
2. Убедитесь, что проект **активен** (не приостановлен)
3. Проверьте, что база данных доступна:
   - Settings → Database → Connection Pooling
   - Должен быть виден Connection String

---

## 🔍 Шаг 7: Проверьте логи в Vercel

1. В Vercel → **Deployments** → последний deployment → **Logs**
2. Ищите ошибки подключения к базе данных
3. Если видите "FATAL: Tenant or user not found", проверьте:
   - Правильность пароля
   - Активность проекта Supabase
   - Правильность региона

---

## ✅ Правильный формат DATABASE_URL

```
postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Где:
- `ohzuxcilqyanybqqmitw` - ID вашего проекта
- `C0ihENxh3kcJZSWI` - пароль базы данных
- `ap-southeast-1` - регион (Southeast Asia)
- `6543` - порт Connection Pooling
- `?pgbouncer=true` - обязательный параметр

---

## 🐛 Если все еще не работает

### Вариант 1: Сбросьте пароль базы данных

1. В Supabase → **Settings** → **Database**
2. Найдите **Database password**
3. Нажмите **Reset database password**
4. Скопируйте новый пароль
5. Обновите `DATABASE_URL` в Vercel с новым паролем
6. Сделайте **Redeploy**

### Вариант 2: Получите новый Connection String

1. В Supabase → **Settings** → **Database** → **Connection Pooling**
2. Скопируйте **Connection String** (Transaction mode)
3. Обновите `DATABASE_URL` в Vercel
4. Сделайте **Redeploy**

---

## ⚠️ Важно

- **Всегда используйте Connection Pooling URL** (порт 6543) для Vercel
- **После изменения переменных окружения нужен Redeploy**
- **Пароль должен быть правильным** (проверьте в Supabase)

