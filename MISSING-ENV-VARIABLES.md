# ⚠️ Отсутствующие переменные окружения

## ✅ Что уже есть:

1. ✅ `DATABASE_URL` - обновлен только что
2. ✅ `NEXT_PUBLIC_SUPABASE_URL` - добавлен 20 минут назад
3. ✅ `SUPABASE_SERVICE_ROLE_KEY` - добавлен 21 минуту назад
4. ✅ `GOOGLE_CLIENT_ID` - добавлен 7 часов назад
5. ✅ `GOOGLE_CLIENT_SECRET` - добавлен 7 часов назад

## ❌ Что ОТСУТСТВУЕТ (критично!):

### 1. NEXTAUTH_URL
**Обязательно!** Без этого NextAuth не будет работать.

**Значение:**
```
https://namelonlar.vercel.app
```
Или ваш кастомный домен, если настроен.

### 2. NEXTAUTH_SECRET
**Обязательно!** Секретный ключ для шифрования сессий.

**Как получить:**
- Онлайн: https://generate-secret.vercel.app/32
- Или через терминал: `openssl rand -base64 32`

**Длина:** минимум 32 символа

---

## 📝 Что нужно сделать:

### Шаг 1: Добавьте NEXTAUTH_URL

1. В Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Нажмите **"Add Environment Variable"**
3. Заполните:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://namelonlar.vercel.app` (или ваш URL)
   - **Environment**: Все (Production, Preview, Development)
4. Нажмите **Save**

### Шаг 2: Добавьте NEXTAUTH_SECRET

1. Сгенерируйте секретный ключ:
   - Перейдите на https://generate-secret.vercel.app/32
   - Или выполните: `openssl rand -base64 32`
2. В Vercel Dashboard → **Environment Variables**
3. Нажмите **"Add Environment Variable"**
4. Заполните:
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: сгенерированный ключ (минимум 32 символа)
   - **Environment**: Все
5. Нажмите **Save**

### Шаг 3: Проверьте DATABASE_URL

Убедитесь, что `DATABASE_URL` использует Connection Pooling (порт 6543):

**Правильный формат:**
```
postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Неправильный формат (порт 5432):**
```
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### Шаг 4: Перезапустите деплой

После добавления переменных:
1. Перейдите в **Deployments**
2. Найдите последний deployment
3. Нажмите **"Redeploy"**

---

## ✅ Итоговый список переменных:

После добавления у вас должно быть:

1. ✅ `DATABASE_URL` - Connection Pooling URL
2. ✅ `NEXTAUTH_URL` - URL вашего сайта
3. ✅ `NEXTAUTH_SECRET` - секретный ключ (32+ символов)
4. ✅ `NEXT_PUBLIC_SUPABASE_URL` - для Storage
5. ✅ `SUPABASE_SERVICE_ROLE_KEY` - для Storage
6. ⚠️ `GOOGLE_CLIENT_ID` - опционально (для Google входа)
7. ⚠️ `GOOGLE_CLIENT_SECRET` - опционально (для Google входа)

---

## 🔍 Как проверить NEXTAUTH_URL:

1. Откройте ваш сайт в браузере
2. Скопируйте URL из адресной строки
3. Это и есть ваш `NEXTAUTH_URL`

Примеры:
- `https://namelonlar.vercel.app`
- `https://your-custom-domain.com`

---

## ⚠️ Важно:

- `NEXTAUTH_URL` и `NEXTAUTH_SECRET` **обязательны** для работы сайта
- Без них аутентификация не будет работать
- Это может вызывать ошибки "An error occurred in the Server Components render"

