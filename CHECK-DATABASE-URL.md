# ✅ Проверка DATABASE_URL в Vercel

Ваш DATABASE_URL правильный:
```
postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 🔍 Шаг 1: Проверьте, что DATABASE_URL установлен в Vercel

1. Откройте **Vercel Dashboard** → ваш проект → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Убедитесь, что значение точно такое:
   ```
   postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. Проверьте, что выбраны **все окружения**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## 🔍 Шаг 2: Если DATABASE_URL не установлен или неправильный

1. В Vercel → **Settings** → **Environment Variables**
2. Если `DATABASE_URL` нет, нажмите **Add New**
3. Если есть, нажмите **Edit**
4. Вставьте значение:
   ```
   postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Выберите **все окружения** (Production, Preview, Development)
6. Нажмите **Save**

---

## 🔍 Шаг 3: Сделайте Redeploy

После обновления переменных окружения:

1. В Vercel → **Deployments**
2. Найдите последний deployment
3. Нажмите **...** → **Redeploy**
4. Или создайте новый commit и push (это автоматически запустит новый деплой)

---

## 🔍 Шаг 4: Проверьте логи после деплоя

1. В Vercel → **Deployments** → последний deployment → **Logs**
2. Ищите ошибки подключения к базе данных
3. Если видите "FATAL: Tenant or user not found", проверьте:
   - Правильность пароля в URL
   - Активен ли проект Supabase
   - Правильность региона

---

## 🔍 Шаг 5: Проверьте проект Supabase

1. Откройте **Supabase Dashboard**
2. Убедитесь, что проект активен (не приостановлен)
3. Проверьте, что база данных доступна:
   - Settings → Database → Connection Pooling
   - Должен быть виден Connection String

---

## ⚠️ Важные моменты

1. **Пароль в URL**: Убедитесь, что пароль `C0ihENxh3kcJZSWI` правильный
2. **Регион**: `ap-southeast-1` должен совпадать с регионом вашего проекта
3. **ID проекта**: `ohzuxcilqyanybqqmitw` должен совпадать с ID вашего проекта

---

## 🐛 Если все еще не работает

### Проверьте пароль

1. В Supabase → **Settings** → **Database**
2. Найдите **Database password**
3. Если пароль другой, обновите `DATABASE_URL` в Vercel

### Проверьте регион

1. В Supabase → **Settings** → **General**
2. Найдите **Region**
3. Убедитесь, что в URL правильный регион:
   - `ap-southeast-1` для Southeast Asia (Singapore)
   - Другие регионы имеют другие коды

### Проверьте ID проекта

1. В Supabase Dashboard URL должен быть: `https://supabase.com/dashboard/project/ohzuxcilqyanybqqmitw`
2. Если ID другой, обновите `DATABASE_URL`

---

## ✅ После исправления

1. Сделайте **Redeploy** в Vercel
2. Попробуйте войти снова
3. Ошибка должна исчезнуть

