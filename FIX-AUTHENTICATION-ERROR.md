# 🔐 Исправление ошибки "FATAL: Tenant or user not found"

Ошибка `authentication` означает проблему с паролем или проектом Supabase.

---

## ✅ Решение: Получите новый Connection String

### Шаг 1: Откройте Supabase Dashboard

1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект

### Шаг 2: Получите Connection String

1. В Supabase Dashboard → ваш проект
2. Перейдите в **Settings** → **Database**
3. Найдите раздел **Connection Pooling**
4. Выберите **Transaction mode**
5. Скопируйте **Connection String**

Формат должен быть:
```
postgresql://postgres.xxx:password@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Шаг 3: Обновите DATABASE_URL в Vercel

1. Откройте **Vercel Dashboard** → ваш проект → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Нажмите **Edit**
4. Вставьте новый Connection String (из шага 2)
5. **ВАЖНО:** Убедитесь, что выбраны **все окружения**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Нажмите **Save**

### Шаг 4: Сделайте Redeploy

**КРИТИЧНО:** После обновления переменных окружения нужен **Redeploy**!

1. В Vercel → **Deployments**
2. Найдите последний deployment
3. Нажмите **...** → **Redeploy**
4. Дождитесь завершения деплоя

---

## 🔍 Альтернатива: Сбросьте пароль

Если получение нового Connection String не помогло:

### Шаг 1: Сбросьте пароль базы данных

1. В Supabase → **Settings** → **Database**
2. Найдите **Database password**
3. Нажмите **Reset database password**
4. Скопируйте новый пароль

### Шаг 2: Обновите DATABASE_URL

1. В Vercel → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Замените пароль в URL:
   ```
   postgresql://postgres.ohzuxcilqyanybqqmitw:НОВЫЙ_ПАРОЛЬ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. Убедитесь, что выбраны **все окружения**
5. Нажмите **Save**

### Шаг 3: Сделайте Redeploy

1. В Vercel → **Deployments** → **Redeploy**

---

## 🔍 Проверка после обновления

После redeploy выполните в консоли браузера:

```javascript
fetch('/api/check-db')
  .then(r => r.json())
  .then(data => {
    console.log('Проверка DATABASE_URL:', data);
    if (data.status && data.status.includes('✅')) {
      console.log('✅ DATABASE_URL правильный!');
    } else {
      console.error('❌ Проблема с DATABASE_URL');
    }
  });
```

Затем попробуйте войти снова.

---

## ⚠️ Важные моменты

1. **Всегда используйте Connection Pooling URL** (порт 6543)
2. **После изменения переменных окружения нужен Redeploy**
3. **Убедитесь, что выбраны все окружения** (Production, Preview, Development)
4. **Пароль должен быть правильным** (проверьте в Supabase)

---

## 🐛 Если все еще не работает

### Проверьте проект Supabase

1. Убедитесь, что проект **активен** (не приостановлен)
2. Проверьте, что база данных доступна
3. Проверьте ID проекта в URL (должен совпадать с ID в DATABASE_URL)

### Проверьте логи в Vercel

1. Vercel → **Deployments** → последний deployment → **Logs**
2. Ищите ошибки подключения
3. Сравните с диагностической информацией

---

## 📋 Чек-лист

- [ ] Получен новый Connection String из Supabase
- [ ] DATABASE_URL обновлен в Vercel
- [ ] Выбраны все окружения (Production, Preview, Development)
- [ ] Сделан Redeploy
- [ ] Проверен через `/api/check-db`
- [ ] Попробовано войти снова

