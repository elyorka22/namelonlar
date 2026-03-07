# 🚀 Быстрый старт: Supabase Auth для Google OAuth

## ✅ Что изменилось:

Google OAuth теперь работает через **Supabase Auth**, что полностью решает проблему с preview URLs в Vercel.

---

## 📋 Что нужно сделать:

### 1. Найти ваш Supabase Project URL

1. Supabase Dashboard → **Settings** → **API**
2. Найдите **Project URL**, например: `https://ohzuxcilqyanybqqmitw.supabase.co`
3. Запомните часть `ohzuxcilqyanybqqmitw` - это ваш PROJECT-REF

### 2. Настроить Google Cloud Console

1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Откройте ваш OAuth 2.0 Client ID
3. В **Authorized redirect URIs** добавьте **только один URL**:

```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

**Пример для вашего проекта:**
```
https://ohzuxcilqyanybqqmitw.supabase.co/auth/v1/callback
```

4. В **Authorized JavaScript origins** добавьте:

```
https://ohzuxcilqyanybqqmitw.supabase.co
```

5. **Удалите все Vercel URLs** (больше не нужны!)
6. Нажмите **Save**

### 3. Настроить Supabase Dashboard

1. Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Включите провайдер
3. Вставьте:
   - **Client ID** (из Google Cloud Console)
   - **Client Secret** (из Google Cloud Console)
4. Нажмите **Save**

### 4. Добавить переменные окружения в Vercel

1. Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Убедитесь, что есть:

```
NEXT_PUBLIC_SUPABASE_URL=https://ohzuxcilqyanybqqmitw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Установите для **всех сред** (Production, Preview, Development)
4. Нажмите **Save**

**Где найти ключи:**
- Supabase Dashboard → **Settings** → **API**
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Перезапустить deployment

1. Vercel Dashboard → **Deployments**
2. Найдите последний deployment
3. Нажмите **"Redeploy"**

---

## ✅ Готово!

Теперь Google OAuth работает через Supabase и **не требует добавления каждого preview URL** в Google Cloud Console!

---

## 🔍 Проверка:

1. Откройте ваш сайт
2. Нажмите "Kirish через Google"
3. Должно работать без ошибок! ✅

---

## 📚 Подробная инструкция:

См. `SUPABASE-AUTH-SETUP.md` для детальной информации.

