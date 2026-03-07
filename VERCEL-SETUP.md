# ⚠️ Важно: Настройка переменных окружения в Vercel

## Проблема при деплое

Если вы видите ошибку:
```
Error: Environment variable not found: DATABASE_URL
```

Это означает, что переменные окружения еще не настроены в Vercel.

## Решение

### Шаг 1: Добавьте переменные окружения ДО первого деплоя

1. В Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Добавьте все необходимые переменные:

```
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key-32-chars
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Шаг 2: Перезапустите деплой

После добавления переменных:
1. Перейдите в **Deployments**
2. Найдите последний deployment
3. Нажмите **"Redeploy"**

### Шаг 3: Запустите миграции (после успешного деплоя)

После того как сайт успешно задеплоится:

```bash
# Локально с Vercel CLI
vercel env pull
npx prisma migrate deploy
npm run db:seed
```

Или через Supabase SQL Editor выполните миграции вручную.

## Альтернатива: Используйте Vercel Postgres

Если хотите упростить настройку:

1. В Vercel Dashboard → **Storage** → **Create Database**
2. Выберите **Postgres**
3. Vercel автоматически создаст переменную `POSTGRES_URL`
4. В Environment Variables добавьте:
   ```
   DATABASE_URL=$POSTGRES_URL
   ```

---

**После настройки переменных окружения, деплой должен пройти успешно!**

