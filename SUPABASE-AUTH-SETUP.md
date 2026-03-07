# ✅ Настройка Supabase Auth для Google OAuth

Это решение использует Supabase Auth для Google OAuth, что **полностью решает проблему с preview URLs** в Vercel.

## 🎯 Преимущества:

- ✅ **Не нужно добавлять каждый preview URL** в Google Cloud Console
- ✅ Supabase обрабатывает redirects на своей стороне
- ✅ Работает на всех deployments (production, preview, development)
- ✅ Простая настройка

---

## 📋 Шаг 1: Настройка Google OAuth в Supabase

1. Откройте **Supabase Dashboard** → ваш проект → **Authentication** → **Providers**
2. Найдите **Google** и включите его
3. Вам понадобятся:
   - **Client ID** (из Google Cloud Console)
   - **Client Secret** (из Google Cloud Console)

### Где взять Google OAuth credentials:

1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Найдите ваш OAuth 2.0 Client ID
3. Скопируйте **Client ID** и **Client Secret**

### ⚠️ Важно для Google Cloud Console:

В **Authorized redirect URIs** добавьте **только один URL** от Supabase:

```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

**Где найти YOUR-PROJECT-REF:**
- Supabase Dashboard → **Settings** → **API**
- Найдите **Project URL**, например: `https://xxxxx.supabase.co`
- Ваш PROJECT-REF - это `xxxxx`

**Пример:**
```
https://ohzuxcilqyanybqqmitw.supabase.co/auth/v1/callback
```

**В Authorized JavaScript origins** добавьте:
```
https://ohzuxcilqyanybqqmitw.supabase.co
```

**Важно:** Больше не нужно добавлять Vercel URLs! Supabase обрабатывает все redirects.

---

## 📋 Шаг 2: Настройка переменных окружения

### В Supabase Dashboard:

1. **Settings** → **API**
2. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (для загрузки файлов)

### В Vercel:

1. Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Добавьте/обновите:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Установите для **всех сред** (Production, Preview, Development)
4. Нажмите **Save**

---

## 📋 Шаг 3: Настройка Google Provider в Supabase

1. Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Включите провайдер
3. Вставьте:
   - **Client ID** (из Google Cloud Console)
   - **Client Secret** (из Google Cloud Console)
4. Нажмите **Save**

---

## 📋 Шаг 4: Проверка работы

1. Перезапустите deployment в Vercel
2. Откройте ваш сайт
3. Нажмите "Kirish через Google"
4. Должно работать без ошибок! ✅

---

## 🔄 Как это работает:

1. Пользователь нажимает "Kirish через Google"
2. Перенаправляется на Supabase Auth
3. Supabase перенаправляет на Google OAuth
4. После авторизации Google возвращает на Supabase
5. Supabase обрабатывает callback и создает сессию
6. Пользователь перенаправляется обратно на ваш сайт
7. Пользователь автоматически синхронизируется с Prisma

---

## ⚠️ Важные замечания:

- **Email/Password** аутентификация все еще работает через NextAuth
- **Google OAuth** теперь работает через Supabase Auth
- Пользователи автоматически синхронизируются между Supabase и Prisma
- Не нужно настраивать `NEXTAUTH_URL` для Google OAuth (только для email/password)

---

## 🐛 Решение проблем:

### Ошибка "redirect_uri_mismatch":

1. Проверьте, что в Google Cloud Console добавлен правильный Supabase callback URL
2. Формат: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
3. Убедитесь, что в Supabase Dashboard правильно настроен Google Provider

### Пользователь не создается в Prisma:

- Проверьте логи в Vercel
- Убедитесь, что `DATABASE_URL` правильно настроен
- Проверьте, что Prisma миграции выполнены

---

## ✅ Готово!

Теперь Google OAuth работает через Supabase и не требует добавления каждого preview URL в Google Cloud Console!

