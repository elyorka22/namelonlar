# ⚠️ ВАЖНО: Проверьте миграции базы данных!

## Проблема

Ошибка "An error occurred in the Server Components render" часто возникает, когда:
- ❌ Таблицы в базе данных не созданы (миграции не выполнены)
- ❌ DATABASE_URL неправильный
- ❌ База данных недоступна

## Решение: Выполните миграции

### Шаг 1: Проверьте, что DATABASE_URL правильный в Vercel

Убедитесь, что в Vercel добавлен правильный Connection Pooling URL:
```
postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Шаг 2: Выполните миграции

**Вариант A: Через Vercel CLI (рекомендуется)**

```bash
# Установите Vercel CLI
npm i -g vercel

# Подключитесь к проекту
vercel link

# Скачайте переменные окружения
vercel env pull .env.local

# Выполните миграции
npx prisma migrate deploy
```

**Вариант B: Через Supabase SQL Editor**

1. Откройте Supabase Dashboard → ваш проект
2. Перейдите в **SQL Editor**
3. Создайте таблицы вручную (см. ниже)

**Вариант C: Через Prisma Studio (локально)**

```bash
# Скачайте переменные окружения из Vercel
vercel env pull .env.local

# Откройте Prisma Studio
npx prisma studio
```

### Шаг 3: Создайте миграции (если еще не созданы)

Если у вас нет папки `prisma/migrations/`, создайте миграции:

```bash
# Локально
npx prisma migrate dev --name init
```

Это создаст SQL файлы в `prisma/migrations/`.

### Шаг 4: Запушьте миграции в Git

```bash
git add prisma/migrations/
git commit -m "Add database migrations"
git push
```

---

## 🔍 Как проверить, что миграции выполнены

1. Supabase Dashboard → **Table Editor**
2. Должны быть видны таблицы:
   - `User`
   - `Listing`
   - `Category`
   - `Banner`
   - и другие

Если таблиц нет - миграции не выполнены!

---

## ⚡ Быстрое решение

Если нужно быстро запустить сайт:

1. **Создайте миграции локально:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Запушьте в Git:**
   ```bash
   git add prisma/migrations/
   git commit -m "Add migrations"
   git push
   ```

3. **Выполните миграции на сервере:**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

Или выполните SQL из миграций в Supabase SQL Editor.

---

## ❓ Все еще не работает?

1. Проверьте логи Vercel (Deployments → последний deployment → Logs)
2. Убедитесь, что DATABASE_URL правильный
3. Проверьте, что база данных запущена в Supabase
4. Убедитесь, что миграции выполнены

