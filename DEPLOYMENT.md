# Руководство по деплою

## Рекомендуемая архитектура

### ✅ Вариант 1: Vercel + Vercel Postgres (РЕКОМЕНДУЕТСЯ)

**Преимущества:**
- ✅ Vercel идеально подходит для Next.js
- ✅ API routes работают как serverless functions
- ✅ Vercel Postgres бесплатный tier (256 MB)
- ✅ Простая интеграция, одна платформа
- ✅ Автоматические деплои из Git
- ✅ Минимальные изменения в коде

**Что нужно:**
1. Деплой на Vercel (подключить GitHub репозиторий)
2. Добавить Vercel Postgres в проекте
3. Настроить переменные окружения
4. Запустить миграции Prisma

**Стоимость:** Бесплатно для старта, затем от $20/месяц

---

### ✅ Вариант 2: Vercel + Supabase PostgreSQL

**Преимущества:**
- ✅ Бесплатный tier (500 MB БД)
- ✅ Отличная производительность
- ✅ Встроенная аутентификация (можно использовать вместо NextAuth)
- ✅ Real-time подписки
- ✅ Хорошая документация

**Что нужно:**
1. Создать проект на Supabase
2. Получить connection string
3. Настроить в Vercel переменные окружения
4. Запустить миграции

**Стоимость:** Бесплатно до 500 MB

---

### ⚠️ Вариант 3: Vercel + Railway PostgreSQL

**Преимущества:**
- ✅ Отдельный сервис для БД
- ✅ Больше контроля
- ✅ Хорошая производительность

**Недостатки:**
- ⚠️ Дополнительный сервис (больше сложности)
- ⚠️ Дополнительные расходы
- ⚠️ Не обязательно для старта

**Стоимость:** От $5/месяц

---

### ❌ НЕ РЕКОМЕНДУЕТСЯ: Vercel + Firestore

**Проблемы:**
- ❌ Проект использует Prisma ORM с PostgreSQL
- ❌ Firestore - это NoSQL база данных
- ❌ Prisma не поддерживает Firestore
- ❌ Нужно полностью переписать:
  - Все запросы к БД (lib/data/*)
  - Схему данных
  - Логику работы с данными
  - Это очень большая работа (несколько дней)

**Вывод:** Firestore потребует полной переработки проекта. Не рекомендуется.

---

## Инструкция по деплою на Vercel + Vercel Postgres

### Шаг 1: Подготовка проекта

1. Убедитесь, что проект готов к деплою:
```bash
npm run build
```

2. Создайте файл `vercel.json` (опционально):
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

### Шаг 2: Деплой на Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Vercel автоматически определит Next.js проект

### Шаг 3: Настройка Vercel Postgres

1. В настройках проекта Vercel → Storage → Create Database
2. Выберите Postgres
3. Vercel автоматически создаст переменную `POSTGRES_URL`

### Шаг 4: Настройка переменных окружения

В Vercel → Settings → Environment Variables добавьте:

```
DATABASE_URL=$POSTGRES_URL
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Шаг 5: Запуск миграций

После первого деплоя, запустите миграции:

**Вариант A: Через Vercel CLI**
```bash
vercel env pull
npx prisma migrate deploy
```

**Вариант B: Через Vercel Dashboard**
- Используйте Vercel Postgres CLI или
- Добавьте скрипт в package.json для автоматического запуска миграций

### Шаг 6: Заполнение начальных данных

```bash
npm run db:seed
```

---

## Альтернатива: Supabase

Если хотите использовать Supabase:

1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите connection string из Settings → Database
3. Используйте его как `DATABASE_URL` в Vercel
4. Запустите миграции Prisma

---

## Вывод

**Для вашего проекта достаточно:**
- ✅ **Vercel** - для хостинга Next.js приложения и API routes
- ✅ **PostgreSQL** - для базы данных (Vercel Postgres или Supabase)

**Railway НЕ обязателен**, но может быть полезен если:
- Нужен отдельный сервис для БД
- Хотите больше контроля
- Планируете масштабирование

**Firestore НЕ рекомендуется** - потребует полной переработки проекта.

---

## Рекомендация

**Используйте: Vercel + Vercel Postgres**

Это самый простой и эффективный вариант для вашего проекта:
- Минимальные изменения в коде
- Бесплатный tier для старта
- Отличная интеграция
- Автоматические деплои
- Масштабируемость

