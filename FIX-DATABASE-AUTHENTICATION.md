# 🔐 Исправление ошибки "FATAL: Tenant or user not found"

## Проблема
Формат DATABASE_URL правильный, но подключение не работает из-за ошибки аутентификации.

## ✅ Решение: Получите новый Connection String

### Шаг 1: Откройте Supabase Dashboard

1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект `ohzuxcilqyanybqqmitw`

### Шаг 2: Проверьте статус проекта

1. Убедитесь, что проект **активен** (не приостановлен)
2. Если проект приостановлен - активируйте его

### Шаг 3: Получите новый Connection String

1. В Supabase Dashboard → ваш проект
2. Перейдите в **Settings** → **Database**
3. Найдите раздел **Connection Pooling**
4. Выберите **Transaction mode**
5. Скопируйте **Connection String**

**Формат должен быть:**
```
postgresql://postgres.ohzuxcilqyanybqqmitw:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Шаг 4: Обновите DATABASE_URL в Vercel

1. Откройте **Vercel Dashboard** → ваш проект → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Нажмите **Edit**
4. **Удалите старый URL полностью**
5. Вставьте **новый Connection String** (из шага 3)
6. **ВАЖНО:** Убедитесь, что выбраны **все окружения**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
7. Нажмите **Save**

### Шаг 5: Сделайте Redeploy

**КРИТИЧНО:** После обновления переменных окружения нужен **Redeploy**!

1. В Vercel → **Deployments**
2. Найдите последний deployment
3. Нажмите **...** → **Redeploy**
4. Дождитесь завершения деплоя (обычно 1-2 минуты)

### Шаг 6: Проверьте подключение

После деплоя откройте:
```
https://namelonlar.vercel.app/api/test-db-connection
```

Должно показать:
```json
{
  "connectionTest": {
    "status": "success",
    "message": "Подключение к базе данных успешно"
  }
}
```

---

## 🔍 Альтернатива: Сбросьте пароль базы данных

Если получение нового Connection String не помогло:

### Шаг 1: Сбросьте пароль базы данных

1. В Supabase → **Settings** → **Database**
2. Найдите **Database password**
3. Нажмите **Reset database password**
4. Скопируйте новый пароль (он показывается только один раз!)

### Шаг 2: Обновите DATABASE_URL

1. В Vercel → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Замените пароль в URL на новый (из шага 1)
4. Сохраните
5. Сделайте **Redeploy**

---

## ⚠️ Важные моменты

1. **Пароль показывается только один раз** - сохраните его!
2. **URL должен быть для всех окружений** (Production, Preview, Development)
3. **После изменения переменных нужен Redeploy**
4. **Используйте Connection Pooling URL** (порт 6543, не 5432)

---

## 📝 Проверка после исправления

После обновления и redeploy проверьте:

1. `/api/test-db-connection` - должно показать успешное подключение
2. Попробуйте войти через форму входа
3. Проверьте логи Vercel на наличие ошибок

