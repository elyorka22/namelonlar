# 🔧 Исправление ошибки redirect_uri_mismatch

## Ошибка:
```
error?authError=redirect_uri_mismatch
```

## Проблема:
Google пытается перенаправить на:
```
https://namelonlar-eb8u26d84-elyors-projects-9ae97d55.vercel.app/api/auth/callback/google
```

Это **preview URL** Vercel, а не production URL. В Google Cloud Console добавлен только production URL.

---

## ✅ Решение:

### Вариант 1: Добавить Preview URL в Google Cloud Console (рекомендуется)

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект
3. **APIs & Services** → **Credentials**
4. Найдите ваш **OAuth 2.0 Client ID** и откройте его
5. В секции **"Authorized redirect URIs"** добавьте **ОБА** URL:

**Production URL:**
```
https://namelonlar.vercel.app/api/auth/callback/google
```

**Preview URL (с wildcard):**
```
https://namelonlar-*.vercel.app/api/auth/callback/google
```

Или конкретные preview URLs, если знаете их.

**Важно:** Google не поддерживает wildcards (`*`) напрямую, поэтому нужно добавить конкретные URL или использовать другой подход.

### Вариант 2: Использовать только Production URL (проще)

1. В Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Найдите `NEXTAUTH_URL`
3. Убедитесь, что значение:
   ```
   https://namelonlar.vercel.app
   ```
   (без слеша в конце, точный production URL)

4. В Google Cloud Console добавьте только production URL:
   ```
   https://namelonlar.vercel.app/api/auth/callback/google
   ```

5. Перезапустите деплой в Vercel

### Вариант 3: Добавить несколько конкретных Preview URLs

Если вы знаете конкретные preview URLs, добавьте их все в Google Cloud Console:

```
https://namelonlar.vercel.app/api/auth/callback/google
https://namelonlar-eb8u26d84-elyors-projects-9ae97d55.vercel.app/api/auth/callback/google
```

И так далее для каждого preview deployment.

---

## 🔍 Проверка настроек:

### В Google Cloud Console должно быть:

**Authorized JavaScript origins:**
```
https://namelonlar.vercel.app
```

**Authorized redirect URIs:**
```
https://namelonlar.vercel.app/api/auth/callback/google
```

Если используете preview deployments, добавьте их тоже.

### В Vercel Environment Variables должно быть:

```
NEXTAUTH_URL=https://namelonlar.vercel.app
```

**Важно:** 
- Без слеша в конце
- Точный URL вашего production сайта
- Используйте `https://`, не `http://`

---

## ⚡ Быстрое решение:

1. **Узнайте точный production URL:**
   - Откройте ваш сайт в браузере
   - Скопируйте URL из адресной строки
   - Это и есть ваш production URL

2. **Обновите NEXTAUTH_URL в Vercel:**
   - Settings → Environment Variables
   - Найдите `NEXTAUTH_URL`
   - Установите точный production URL (без слеша)

3. **Добавьте Redirect URI в Google:**
   - Google Cloud Console → Credentials → ваш OAuth Client
   - Authorized redirect URIs → добавьте:
     ```
     {ваш-production-URL}/api/auth/callback/google
     ```
   - Например: `https://namelonlar.vercel.app/api/auth/callback/google`

4. **Сохраните и перезапустите:**
   - Сохраните в Google Cloud Console
   - Перезапустите деплой в Vercel (Redeploy)

---

## 📝 Пример правильных настроек:

### Google Cloud Console:

**Authorized JavaScript origins:**
```
https://namelonlar.vercel.app
```

**Authorized redirect URIs:**
```
https://namelonlar.vercel.app/api/auth/callback/google
```

### Vercel Environment Variables:

```
NEXTAUTH_URL=https://namelonlar.vercel.app
GOOGLE_CLIENT_ID=766693503610-56mrkedndl1puqsjv3nqotkafn5iii2d.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ваш-secret
```

---

## ⚠️ Важно:

- `NEXTAUTH_URL` должен точно совпадать с production URL
- Redirect URI в Google должен быть `{NEXTAUTH_URL}/api/auth/callback/google`
- После изменений подождите 1-2 минуты перед тестированием
- Перезапустите деплой в Vercel после изменения переменных

---

## 🧪 Тестирование:

После исправления:
1. Откройте сайт
2. Нажмите "Войти через Google"
3. Разрешите доступ
4. Должно перенаправить на главную страницу (авторизованным)

Если все еще не работает, проверьте:
- Логи Vercel (Functions → Logs)
- Консоль браузера (F12) на ошибки
- Что изменения в Google Console сохранены

