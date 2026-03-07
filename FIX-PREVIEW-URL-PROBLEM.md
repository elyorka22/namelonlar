# 🔧 Решение проблемы с Preview URLs

## Проблема:

Preview URLs в Vercel меняются при каждом deployment:
- Старый: `namelonlar-eb8u26d84-elyors-projects-9ae97d55.vercel.app`
- Новый: `namelonlar-6v621idjv-elyors-projects-9ae97d55.vercel.app`

Google OAuth требует точного совпадения URL, поэтому каждый раз нужно добавлять новый preview URL.

## ✅ Решение: Использовать только Production URL

### Шаг 1: Установите NEXTAUTH_URL на Production

1. Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Найдите `NEXTAUTH_URL`
3. Установите значение:
   ```
   https://namelonlar.vercel.app
   ```
   (production URL, без слеша)
4. **Важно:** Выберите **Environment: Production** (не Preview, не Development)
5. Нажмите **Save**

### Шаг 2: В Google Cloud Console оставьте только Production URLs

1. Google Cloud Console → **Credentials** → ваш OAuth Client
2. В **"Authorized redirect URIs"** оставьте только:
   ```
   http://localhost:3000/api/auth/callback/google
   https://namelonlar.vercel.app/api/auth/callback/google
   ```
3. Удалите все preview URLs (если есть)
4. В **"Authorized JavaScript origins"** оставьте только:
   ```
   http://localhost:3000
   https://namelonlar.vercel.app
   ```
5. Нажмите **Save**

### Шаг 3: Тестируйте только на Production

- Используйте основной URL: `https://namelonlar.vercel.app`
- Не используйте preview deployments для тестирования OAuth
- Preview deployments можно использовать для других функций, но OAuth будет работать только на production

---

## 🔍 Альтернатива: Добавить текущий Preview URL

Если нужно тестировать на preview deployment:

1. Узнайте текущий preview URL:
   - Vercel Dashboard → **Deployments**
   - Найдите preview deployment (не production)
   - Скопируйте его URL

2. Добавьте в Google Cloud Console:
   - **Authorized redirect URIs**: `https://ваш-preview-url.vercel.app/api/auth/callback/google`
   - **Authorized JavaScript origins**: `https://ваш-preview-url.vercel.app`

3. **Помните:** При следующем deployment preview URL изменится, и нужно будет добавить новый

---

## 📝 Рекомендация:

**Используйте только Production URL для OAuth:**
- ✅ Проще в настройке
- ✅ Не нужно постоянно обновлять URLs
- ✅ Стабильная работа
- ✅ Один раз настроили - работает всегда

Preview deployments используйте для тестирования других функций, но для OAuth используйте production.

