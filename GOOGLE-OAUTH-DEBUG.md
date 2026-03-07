# 🔍 Детальная диагностика Google OAuth

## Проблема сохраняется после добавления URL

Если ошибка все еще повторяется, проверьте следующее:

---

## ✅ Шаг 1: Проверьте NEXTAUTH_URL в Vercel

1. Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Найдите `NEXTAUTH_URL`
3. **Убедитесь, что значение:**
   ```
   https://namelonlar.vercel.app
   ```
   - Без слеша в конце
   - Точный production URL
   - Используется `https://`, не `http://`

4. Если значение неправильное - исправьте и **сохраните**

---

## ✅ Шаг 2: Проверьте логи Vercel

1. Vercel Dashboard → ваш проект → **Deployments**
2. Найдите последний deployment
3. Перейдите на вкладку **"Functions"** или **"Logs"**
4. Найдите ошибки (красным цветом)
5. Скопируйте полный текст ошибки

**Что искать:**
- Ошибки с `redirect_uri`
- Ошибки с `NEXTAUTH_URL`
- Ошибки подключения к базе данных
- Ошибки Prisma

---

## ✅ Шаг 3: Проверьте консоль браузера

1. Откройте сайт
2. Нажмите F12 (открыть DevTools)
3. Перейдите на вкладку **Console**
4. Попробуйте войти через Google
5. Посмотрите ошибки в консоли

---

## ✅ Шаг 4: Проверьте Network запросы

1. В DevTools перейдите на вкладку **Network**
2. Попробуйте войти через Google
3. Найдите запрос к `/api/auth/callback/google`
4. Посмотрите:
   - **Status Code** (должен быть 200 или 302)
   - **Response** (что возвращает сервер)
   - **Request URL** (какой URL используется)

---

## ✅ Шаг 5: Проверьте все Preview URLs

Preview URLs в Vercel меняются при каждом deployment. Если вы тестируете на preview deployment:

1. Узнайте текущий preview URL:
   - Vercel Dashboard → **Deployments**
   - Найдите preview deployment (не production)
   - Скопируйте его URL

2. Добавьте этот URL в Google Cloud Console:
   - **Authorized JavaScript origins**: `https://ваш-preview-url.vercel.app`
   - **Authorized redirect URIs**: `https://ваш-preview-url.vercel.app/api/auth/callback/google`

---

## ✅ Шаг 6: Используйте только Production URL

Чтобы избежать проблем с preview URLs:

1. **В Vercel:**
   - Settings → Environment Variables
   - `NEXTAUTH_URL` = `https://namelonlar.vercel.app` (production)

2. **В Google Cloud Console:**
   - Оставьте только production URLs
   - Удалите preview URLs (если не нужны)

3. **Тестируйте только на production:**
   - Используйте основной URL сайта
   - Не используйте preview deployments для тестирования OAuth

---

## ✅ Шаг 7: Проверьте OAuth Consent Screen

1. Google Cloud Console → **APIs & Services** → **OAuth consent screen**
2. Убедитесь, что заполнены:
   - **App name**
   - **User support email**
   - **Developer contact email**
3. Сохраните изменения

---

## ✅ Шаг 8: Проверьте переменные окружения

Убедитесь, что в Vercel есть **ВСЕ** переменные:

```
✅ DATABASE_URL
✅ NEXTAUTH_URL
✅ NEXTAUTH_SECRET
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET
✅ NEXT_PUBLIC_SUPABASE_URL (если используется)
✅ SUPABASE_SERVICE_ROLE_KEY (если используется)
```

---

## 🔍 Диагностика через код

Добавьте временно логирование для отладки:

```typescript
// В lib/auth.ts (временно для отладки)
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set" : "Missing");
```

Проверьте логи Vercel после этого.

---

## 📝 Что проверить в первую очередь:

1. ✅ `NEXTAUTH_URL` в Vercel = точный production URL
2. ✅ Redirect URI в Google = `{NEXTAUTH_URL}/api/auth/callback/google`
3. ✅ JavaScript origin в Google = `{NEXTAUTH_URL}`
4. ✅ Все переменные окружения добавлены в Vercel
5. ✅ Изменения в Google Console сохранены
6. ✅ Прошло 2-3 минуты после сохранения в Google Console
7. ✅ Деплой перезапущен в Vercel

---

## ❓ Если все еще не работает:

Пришлите мне:
1. Точное значение `NEXTAUTH_URL` из Vercel (без паролей)
2. Полный текст ошибки из логов Vercel
3. Ошибки из консоли браузера (F12)
4. Какой URL вы используете для тестирования (production или preview)

Тогда я смогу точно определить проблему.

