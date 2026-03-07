# Деплой на Vercel + Supabase

## ✅ Рекомендуемая архитектура: Vercel + Supabase

**Это идеальная комбинация для вашего проекта!**

### Преимущества:
- ✅ Vercel - лучший хостинг для Next.js
- ✅ Supabase - отличный PostgreSQL (бесплатный tier 500 MB)
- ✅ Простая интеграция
- ✅ Хорошая производительность
- ✅ Масштабируемость

### ⚠️ Railway НЕ нужен

Если вы используете **Supabase для PostgreSQL**, то Railway избыточен:
- Supabase уже предоставляет PostgreSQL
- Railway будет дублировать функциональность
- Дополнительные расходы без необходимости

**Railway может быть полезен только если:**
- Нужен отдельный сервис для чего-то специфического
- Хотите больше контроля над БД
- Но для вашего проекта это не требуется

---

## Пошаговая инструкция деплоя

### Шаг 1: Создание проекта на Supabase

1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Выберите регион (ближайший к вашим пользователям)
4. Дождитесь создания проекта (2-3 минуты)

### Шаг 2: Получение connection string

1. В Supabase Dashboard → Settings → Database
2. Найдите секцию "Connection string"
3. Выберите "URI" и скопируйте строку подключения
4. Формат: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

### Шаг 3: Настройка Prisma для Supabase

Supabase использует PostgreSQL, поэтому Prisma работает без изменений!

Просто используйте connection string от Supabase как `DATABASE_URL`.

### Шаг 4: Деплой на Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Vercel автоматически определит Next.js проект

### Шаг 5: Настройка переменных окружения в Vercel

В Vercel → Settings → Environment Variables добавьте:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

**Важно:** Замените `[PASSWORD]` и `[PROJECT]` на реальные значения из Supabase.

### Шаг 6: Запуск миграций

После первого деплоя, запустите миграции:

**Вариант A: Через Vercel CLI**
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

**Вариант B: Через Supabase Dashboard**
1. Supabase → SQL Editor
2. Выполните SQL команды из миграций Prisma

**Вариант C: Автоматически через Vercel**
Добавьте в `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Шаг 7: Заполнение начальных данных

```bash
# Локально с подключением к Supabase
DATABASE_URL="your-supabase-url" npm run db:seed
```

Или через Supabase SQL Editor выполните SQL из `prisma/seed.ts`.

---

## Настройка Supabase для продакшена

### 1. Настройка Connection Pooling

Supabase рекомендует использовать connection pooling для serverless функций:

1. В Supabase Dashboard → Settings → Database
2. Найдите "Connection Pooling"
3. Используйте порт 6543 вместо 5432
4. Connection string будет: `postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

**Для Vercel используйте pooled connection:**
```
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. Настройка Row Level Security (опционально)

Supabase поддерживает RLS, но для вашего проекта это не обязательно, так как вы используете Prisma и NextAuth.

### 3. Резервное копирование

Supabase автоматически создает резервные копии:
- Бесплатный tier: ежедневные бэкапы (7 дней)
- Pro tier: более частые бэкапы

---

## Стоимость

### Supabase (Бесплатный tier):
- ✅ 500 MB база данных
- ✅ 2 GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Достаточно для старта

### Vercel (Бесплатный tier):
- ✅ 100 GB bandwidth
- ✅ Serverless functions
- ✅ Автоматические деплои
- ✅ Достаточно для старта

**Итого: $0/месяц для старта!**

---

## Альтернативы

### Если нужен Railway вместо Supabase:

Railway также предоставляет PostgreSQL:
- Стоимость: от $5/месяц
- Больше контроля
- Но Supabase бесплатный и проще

### Если нужен Vercel Postgres:

Vercel также предоставляет PostgreSQL:
- Бесплатный tier: 256 MB
- Проще интеграция (одна платформа)
- Но Supabase дает больше (500 MB бесплатно)

---

## Вывод

**✅ Vercel + Supabase - идеальная комбинация!**

- Vercel для хостинга Next.js
- Supabase для PostgreSQL БД
- Railway НЕ нужен (избыточен)

**Это всё, что нужно для вашего проекта!**

