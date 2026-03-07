# 🔧 Исправление ошибки подключения к базе данных

Если видите ошибку "FATAL: Tenant or user not found", это проблема с подключением к Supabase.

---

## 🔍 Проблема

Ошибка означает, что:
- Неправильный `DATABASE_URL` в Vercel
- Используется прямой URL вместо Connection Pooling URL
- Неправильные учетные данные

---

## ✅ Решение

### Шаг 1: Проверьте DATABASE_URL в Vercel

1. Откройте **Vercel Dashboard** → ваш проект → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Проверьте формат:

**❌ Неправильно (прямой URL, порт 5432):**
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

**✅ Правильно (Connection Pooling URL, порт 6543):**
```
postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

### Шаг 2: Получите правильный URL из Supabase

1. Откройте **Supabase Dashboard** → ваш проект
2. Перейдите в **Settings** → **Database**
3. Найдите раздел **Connection Pooling**
4. Скопируйте **Connection String** (используйте **Transaction mode**)
5. Формат должен быть:
   ```
   postgresql://postgres.xxx:password@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

---

### Шаг 3: Обновите DATABASE_URL в Vercel

1. В Vercel → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Нажмите **Edit**
4. Вставьте правильный Connection Pooling URL
5. Убедитесь, что выбран **Production**, **Preview**, и **Development**
6. Нажмите **Save**

---

### Шаг 4: Сделайте Redeploy

1. В Vercel → **Deployments**
2. Найдите последний deployment
3. Нажмите **...** → **Redeploy**
4. Дождитесь завершения деплоя

---

## 🔍 Проверка

После обновления попробуйте войти снова. Ошибка должна исчезнуть.

---

## ⚠️ Важно

- **Всегда используйте Connection Pooling URL** (порт 6543) для Vercel
- **Прямой URL** (порт 5432) работает только из локальной сети Supabase
- Connection Pooling URL должен содержать `?pgbouncer=true`

---

## 🐛 Если все еще не работает

### Проверьте пароль в URL

1. Убедитесь, что пароль в URL правильный
2. Если пароль содержит специальные символы, они должны быть URL-encoded:
   - `@` → `%40`
   - `#` → `%23`
   - `&` → `%26`
   - и т.д.

### Проверьте регион

1. Убедитесь, что регион в URL правильный (например: `ap-southeast-1`)
2. Регион должен совпадать с регионом вашего Supabase проекта

### Проверьте имя проекта

1. В URL должно быть `postgres.xxx` где `xxx` - это часть вашего проекта
2. Например: `postgres.ohzuxcilqyanybqqmitw`

---

## 📋 Пример правильного DATABASE_URL

```
postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Где:
- `ohzuxcilqyanybqqmitw` - ID вашего проекта
- `C0ihENxh3kcJZSWI` - ваш пароль
- `ap-southeast-1` - регион
- `6543` - порт Connection Pooling
- `?pgbouncer=true` - обязательный параметр

---

## ✅ После исправления

1. Сделайте **Redeploy** в Vercel
2. Попробуйте войти снова
3. Ошибка "FATAL: Tenant or user not found" должна исчезнуть

