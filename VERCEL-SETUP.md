# ⚠️ КРИТИЧЕСКИ ВАЖНО: Настройка переменных окружения в Vercel

## Проблема при деплое

Если вы видите ошибку:
```
Error: Environment variable not found: DATABASE_URL.
Error code: P1012
```

Это означает, что переменные окружения **НЕ настроены** в Vercel **ДО** первого деплоя.

## ⚠️ ВАЖНО: Порядок действий

**НЕ ДЕПЛОЙТЕ проект до настройки переменных окружения!**

### Шаг 1: Добавьте переменные окружения ПЕРЕД деплоем

1. В Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Добавьте **ВСЕ** необходимые переменные:

```
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key-32-chars-minimum
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

**Где взять DATABASE_URL из Supabase:**
1. Supabase Dashboard → ваш проект → **Settings** → **Database**
2. Скопируйте **Connection string** (используйте **Connection pooling** версию)
3. Формат: `postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`

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

### Шаг 2: Создайте миграции локально

Перед деплоем создайте миграции:

```bash
# Локально
npx prisma migrate dev --name init
```

Это создаст папку `prisma/migrations/` с SQL файлами.

### Шаг 3: Запушьте изменения в Git

```bash
git add prisma/migrations/
git commit -m "Add database migrations"
git push
```

### Шаг 4: Теперь деплойте в Vercel

После настройки переменных окружения:
1. Vercel автоматически задеплоит проект при push в Git
2. Или вручную: **Deployments** → **Redeploy**

### Шаг 5: Запустите миграции (после успешного деплоя)

После того как сайт успешно задеплоится, выполните миграции:

**Вариант 1: Через Vercel CLI (рекомендуется)**
```bash
# Установите Vercel CLI
npm i -g vercel

# Подключитесь к проекту
vercel link

# Скачайте переменные окружения
vercel env pull .env.local

# Запустите миграции
npx prisma migrate deploy
```

**Вариант 2: Через Supabase SQL Editor**
1. Supabase Dashboard → **SQL Editor**
2. Откройте файлы из `prisma/migrations/*/migration.sql`
3. Выполните SQL команды вручную

**Вариант 3: Через Prisma Studio (локально)**
```bash
vercel env pull .env.local
npx prisma db push
npm run db:seed
```

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

