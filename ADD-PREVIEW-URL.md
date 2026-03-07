# ✅ Добавьте Preview URL в Google Cloud Console

## Проблема:

В Google Cloud Console у вас есть:
- ✅ `https://namelonlar.vercel.app/api/auth/callback/google` (production)
- ✅ `http://localhost:3000/api/auth/callback/google` (локальная разработка)

Но **отсутствует** preview URL:
- ❌ `https://namelonlar-eb8u26d84-elyors-projects-9ae97d55.vercel.app/api/auth/callback/google`

## Решение:

### Шаг 1: Добавьте Preview URL

В Google Cloud Console, в секции **"Authorized redirect URIs"**:

1. Нажмите **"+ Add URI"**
2. Добавьте:
   ```
   https://namelonlar-eb8u26d84-elyors-projects-9ae97d55.vercel.app/api/auth/callback/google
   ```

### Шаг 2: Добавьте Preview URL в JavaScript origins

В секции **"Authorized JavaScript origins"**:

1. Нажмите **"+ Add URI"**
2. Добавьте:
   ```
   https://namelonlar-eb8u26d84-elyors-projects-9ae97d55.vercel.app
   ```

### Шаг 3: Сохраните

1. Нажмите **"Save"** внизу страницы
2. Подождите 1-2 минуты (изменения применяются не сразу)

---

## 📝 Итоговый список должен быть:

### Authorized JavaScript origins:
```
http://localhost:3000
https://namelonlar.vercel.app
https://namelonlar-eb8u26d84-elyors-projects-9ae97d55.vercel.app
```

### Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
https://namelonlar.vercel.app/api/auth/callback/google
https://namelonlar-eb8u26d84-elyors-projects-9ae97d55.vercel.app/api/auth/callback/google
```

---

## ⚠️ Важно:

- Preview URLs в Vercel меняются при каждом новом deployment
- Если хотите избежать постоянных обновлений, используйте только production URL
- Для этого установите `NEXTAUTH_URL` на production URL в Vercel

---

## 🔄 Альтернатива: Использовать только Production

Если не хотите добавлять каждый preview URL:

1. В Vercel → Settings → Environment Variables
2. Найдите `NEXTAUTH_URL`
3. Установите: `https://namelonlar.vercel.app` (production URL)
4. В Google Cloud Console оставьте только production URLs
5. Тестируйте только на production deployment

Но для preview deployments все равно нужно будет добавлять их URLs.

