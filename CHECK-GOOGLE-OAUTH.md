# ✅ Пошаговая проверка Google OAuth

Выполните эти шаги по порядку и проверьте каждый пункт:

## 🔍 Шаг 1: Проверка переменных окружения в Vercel

1. Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Убедитесь, что есть **ВСЕ** эти переменные:

```
NEXT_PUBLIC_SUPABASE_URL=https://ohzuxcilqyanybqqmitw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Важно:** Убедитесь, что переменные установлены для **ВСЕХ сред**:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

4. Если переменных нет или они неправильные:
   - Supabase Dashboard → **Settings** → **API**
   - Скопируйте правильные значения
   - Добавьте/обновите в Vercel
   - **Перезапустите deployment**

---

## 🔍 Шаг 2: Проверка Google Provider в Supabase

1. Supabase Dashboard → **Authentication** → **Providers**
2. Найдите **Google** и откройте его
3. Проверьте:
   - ✅ **Toggle включен** (провайдер активен)
   - ✅ **Client ID** заполнен (из Google Cloud Console)
   - ✅ **Client Secret** заполнен (из Google Cloud Console)
4. Если что-то не заполнено:
   - Google Cloud Console → **APIs & Services** → **Credentials**
   - Скопируйте Client ID и Client Secret
   - Вставьте в Supabase
   - Нажмите **Save**

---

## 🔍 Шаг 3: Проверка Google Cloud Console

1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Откройте ваш OAuth 2.0 Client ID
3. Проверьте **Authorized redirect URIs**:
   - Должен быть **ТОЛЬКО ОДИН** URL:
   ```
   https://ohzuxcilqyanybqqmitw.supabase.co/auth/v1/callback
   ```
   - **УДАЛИТЕ все Vercel URLs** (если есть)
4. Проверьте **Authorized JavaScript origins**:
   - Должен быть:
   ```
   https://ohzuxcilqyanybqqmitw.supabase.co
   ```
5. Нажмите **Save**

---

## 🔍 Шаг 4: Проверка Site URL в Supabase

1. Supabase Dashboard → **Settings** → **Authentication** → **URL Configuration**
2. Проверьте **Site URL**:
   - Должен быть: `https://namelonlar.vercel.app`
3. Проверьте **Redirect URLs**:
   - Должны быть:
   ```
   https://namelonlar.vercel.app/**
   http://localhost:3000/**
   ```
4. Нажмите **Save**

---

## 🔍 Шаг 5: Проверка в браузере

1. Откройте ваш сайт: `https://namelonlar.vercel.app`
2. Откройте **Developer Tools** (F12)
3. Перейдите на вкладку **Console**
4. Нажмите "Kirish через Google"
5. Посмотрите на ошибки в консоли

**Если видите ошибку:**
- Скопируйте текст ошибки
- Проверьте, на каком шаге она возникает

---

## 🐛 Частые ошибки и решения

### Ошибка: "Supabase is not configured"
**Решение:** Проверьте переменные окружения в Vercel (Шаг 1)

### Ошибка: "redirect_uri_mismatch"
**Решение:** 
- Проверьте Google Cloud Console (Шаг 3)
- Убедитесь, что добавлен правильный Supabase callback URL
- Формат: `https://ohzuxcilqyanybqqmitw.supabase.co/auth/v1/callback`

### Ошибка: "Invalid client" или "Client not found"
**Решение:**
- Проверьте Google Provider в Supabase (Шаг 2)
- Убедитесь, что Client ID и Secret правильно скопированы

### После авторизации возвращается на страницу входа
**Решение:**
- Проверьте Site URL и Redirect URLs в Supabase (Шаг 4)
- Проверьте callback route: `/auth/callback`
- Проверьте логи в Vercel

### Ничего не происходит при нажатии кнопки
**Решение:**
- Откройте консоль браузера (F12)
- Посмотрите на ошибки
- Проверьте, что переменные окружения установлены

---

## ✅ После исправления

1. **Перезапустите deployment в Vercel:**
   - Vercel Dashboard → **Deployments**
   - Найдите последний deployment
   - Нажмите **"Redeploy"**

2. **Очистите кеш браузера:**
   - Нажмите Ctrl+Shift+Delete (Windows) или Cmd+Shift+Delete (Mac)
   - Или попробуйте в режиме инкогнито

3. **Попробуйте снова:**
   - Откройте сайт
   - Нажмите "Kirish через Google"
   - Должно работать! ✅

---

## 📞 Если проблема остается

1. Проверьте логи в Vercel:
   - Vercel Dashboard → ваш проект → **Deployments** → последний deployment → **Logs**
   - Ищите ошибки связанные с Supabase или Google OAuth

2. Проверьте Network tab в браузере:
   - Developer Tools → **Network**
   - Попробуйте войти
   - Проверьте запросы к `/auth/callback` и Supabase

3. Убедитесь, что используете последнюю версию кода:
   - Проверьте GitHub репозиторий
   - Убедитесь, что последний commit задеплоен

