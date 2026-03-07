# 🔧 Решение проблем с Google OAuth через Supabase

## 🔍 Проверка текущей настройки

### Шаг 1: Проверьте переменные окружения в Vercel

Убедитесь, что в Vercel Dashboard → Settings → Environment Variables есть:

```
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Где найти:**
1. Supabase Dashboard → **Settings** → **API**
2. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Шаг 2: Настройте Google Provider в Supabase

1. Supabase Dashboard → **Authentication** → **Providers**
2. Найдите **Google** и нажмите на него
3. **Включите** провайдер (Toggle должен быть включен)
4. Вставьте:
   - **Client ID** (из Google Cloud Console)
   - **Client Secret** (из Google Cloud Console)
5. **Важно:** Оставьте **Redirect URL** пустым (Supabase автоматически использует свой)
6. Нажмите **Save**

### Шаг 3: Настройте Google Cloud Console

1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Откройте ваш OAuth 2.0 Client ID
3. В **Authorized redirect URIs** добавьте **ТОЛЬКО**:

```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

**Пример:**
```
https://ohzuxcilqyanybqqmitw.supabase.co/auth/v1/callback
```

4. В **Authorized JavaScript origins** добавьте:

```
https://ohzuxcilqyanybqqmitw.supabase.co
```

5. **УДАЛИТЕ все Vercel URLs** (они больше не нужны!)
6. Нажмите **Save**

### Шаг 4: Проверьте Site URL в Supabase

1. Supabase Dashboard → **Settings** → **Authentication** → **URL Configuration**
2. Убедитесь, что **Site URL** установлен на ваш production URL:

```
https://namelonlar.vercel.app
```

3. В **Redirect URLs** добавьте:

```
https://namelonlar.vercel.app/**
http://localhost:3000/**
```

4. Нажмите **Save**

---

## 🐛 Частые проблемы и решения

### Проблема 1: "redirect_uri_mismatch"

**Решение:**
- Убедитесь, что в Google Cloud Console добавлен правильный Supabase callback URL
- Формат: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
- Удалите все Vercel URLs из Google Cloud Console

### Проблема 2: "Invalid client" или "Client not found"

**Решение:**
- Проверьте, что Client ID и Client Secret правильно скопированы в Supabase
- Убедитесь, что Google Provider включен в Supabase Dashboard

### Проблема 3: После авторизации возвращается на страницу входа

**Решение:**
- Проверьте Redirect URLs в Supabase Settings → Authentication
- Убедитесь, что callback route работает: `/auth/callback`
- Проверьте логи в Vercel для ошибок

### Проблема 4: "Supabase is not configured"

**Решение:**
- Проверьте, что все переменные окружения установлены в Vercel
- Убедитесь, что переменные установлены для всех сред (Production, Preview, Development)
- Перезапустите deployment после добавления переменных

---

## ✅ Пошаговая проверка

1. ✅ Переменные окружения установлены в Vercel
2. ✅ Google Provider включен в Supabase
3. ✅ Client ID и Secret вставлены в Supabase
4. ✅ Supabase callback URL добавлен в Google Cloud Console
5. ✅ Site URL установлен в Supabase
6. ✅ Redirect URLs настроены в Supabase
7. ✅ Deployment перезапущен после изменений

---

## 🧪 Тестирование

1. Откройте ваш сайт: `https://namelonlar.vercel.app`
2. Нажмите "Kirish через Google"
3. Должно произойти:
   - Редирект на Google
   - Авторизация в Google
   - Редирект обратно на сайт
   - Вход выполнен успешно

---

## 📝 Логи для отладки

Если проблема остается, проверьте:

1. **Vercel Logs:**
   - Vercel Dashboard → ваш проект → **Deployments** → последний deployment → **Logs**
   - Ищите ошибки связанные с Supabase или Google OAuth

2. **Browser Console:**
   - Откройте Developer Tools (F12)
   - Перейдите на вкладку **Console**
   - Попробуйте войти и посмотрите на ошибки

3. **Network Tab:**
   - Откройте Developer Tools → **Network**
   - Попробуйте войти
   - Проверьте запросы к `/auth/callback` и Supabase

---

## 🔄 Если ничего не помогает

1. Убедитесь, что используете последнюю версию кода (проверьте GitHub)
2. Очистите кеш браузера
3. Попробуйте в режиме инкогнито
4. Проверьте, что все переменные окружения правильно скопированы (без лишних пробелов)

