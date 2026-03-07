# 🚀 Deploy на Vercel + Supabase

Проект готов к деплою! Следуйте этим шагам:

## Шаг 1: Создайте проект на Supabase

1. Зайдите на [supabase.com](https://supabase.com)
2. Нажмите "New Project"
3. Заполните:
   - **Name:** namangan-elonlar
   - **Database Password:** создайте надежный пароль (сохраните его!)
   - **Region:** выберите ближайший регион
4. Нажмите "Create new project"
5. Дождитесь создания проекта (2-3 минуты)

## Шаг 2: Получите Connection String

1. В Supabase Dashboard → **Settings** → **Database**
2. Найдите секцию **Connection string**
3. Выберите **URI** (не Session mode)
4. Скопируйте строку подключения

**Важно для Vercel:** Используйте **Connection Pooling** для лучшей производительности:

1. В том же разделе найдите **Connection Pooling**
2. Используйте порт **6543** вместо 5432
3. Connection string будет выглядеть так:
```
postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Шаг 3: Деплой на Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. Подключите GitHub репозиторий: `elyorka22/namelonlar`
4. Vercel автоматически определит Next.js проект
5. Нажмите **"Deploy"**

## Шаг 4: Настройте Environment Variables

После первого деплоя, в Vercel Dashboard:

1. Перейдите в **Settings** → **Environment Variables**
2. Добавьте следующие переменные:

```
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=сгенерируйте-случайную-строку-32-символа
GOOGLE_CLIENT_ID=ваш-google-client-id
GOOGLE_CLIENT_SECRET=ваш-google-client-secret
CLOUDINARY_CLOUD_NAME=ваш-cloudinary-name
CLOUDINARY_API_KEY=ваш-cloudinary-key
CLOUDINARY_API_SECRET=ваш-cloudinary-secret
```

**Для генерации NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Шаг 5: Запустите миграции

После настройки переменных окружения:

### Вариант A: Через Vercel CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Подключитесь к проекту
vercel link

# Получите переменные окружения
vercel env pull .env.local

# Запустите миграции
npx prisma migrate deploy
```

### Вариант B: Через Vercel Dashboard

1. В Vercel Dashboard → **Deployments**
2. Найдите последний deployment
3. Откройте **Functions** → **View Function Logs**
4. Или используйте Vercel CLI для выполнения команд

### Вариант C: Через Supabase SQL Editor

1. В Supabase Dashboard → **SQL Editor**
2. Создайте миграции вручную или
3. Используйте `prisma db push` для создания схемы

## Шаг 6: Заполните начальные данные

```bash
# Локально с подключением к Supabase
DATABASE_URL="your-supabase-connection-string" npm run db:seed
```

Или через Supabase SQL Editor выполните SQL из `prisma/seed.ts`.

## Шаг 7: Проверьте деплой

1. Откройте ваш сайт: `https://your-project.vercel.app`
2. Проверьте, что все работает
3. Попробуйте создать тестовый аккаунт

## 🔧 Troubleshooting

### Ошибка подключения к БД

- Проверьте, что `DATABASE_URL` правильный
- Убедитесь, что используете pooled connection (порт 6543)
- Проверьте, что пароль правильный

### Ошибка миграций

- Убедитесь, что Prisma Client сгенерирован: `npx prisma generate`
- Проверьте, что миграции запущены: `npx prisma migrate deploy`

### Ошибка сборки

- Проверьте логи в Vercel Dashboard
- Убедитесь, что все зависимости установлены
- Проверьте, что `vercel.json` правильный

## 📊 Мониторинг

- **Vercel Dashboard:** статистика деплоев, логи, аналитика
- **Supabase Dashboard:** статистика БД, запросы, использование

## 🎉 Готово!

Ваш проект должен быть доступен по адресу:
`https://your-project.vercel.app`

---

**Поддержка:**
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

