# 🔍 Отладка ошибки Server Components

## Ошибка:
```
Error: An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details.
```

## Возможные причины:

### 1. Проблема с подключением к базе данных
- DATABASE_URL неправильный или не настроен
- База данных недоступна
- Проблемы с Connection Pooling

### 2. Ошибка в коде компонентов
- Необработанные исключения в Server Components
- Проблемы с async функциями
- Ошибки при работе с Prisma

### 3. Отсутствующие переменные окружения
- NEXTAUTH_SECRET не настроен
- Другие обязательные переменные отсутствуют

## Как найти детали ошибки:

### Шаг 1: Проверьте логи Vercel

1. Vercel Dashboard → ваш проект
2. Перейдите в **Deployments**
3. Найдите последний deployment
4. Нажмите на него
5. Перейдите на вкладку **"Functions"** или **"Logs"**
6. Найдите ошибки (красным цветом)

### Шаг 2: Проверьте переменные окружения

Убедитесь, что все переменные настроены:
- ✅ `DATABASE_URL` - правильный Connection Pooling URL
- ✅ `NEXTAUTH_URL` - URL вашего сайта
- ✅ `NEXTAUTH_SECRET` - секретный ключ
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - для Storage (если используется)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - для Storage (если используется)

### Шаг 3: Проверьте подключение к базе

Попробуйте подключиться к базе данных локально:
```bash
# Установите переменные окружения
export DATABASE_URL="postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Проверьте подключение
npx prisma db pull
```

### Шаг 4: Включите детальные логи

Временно добавьте в код для отладки (только для разработки):

```typescript
// В lib/data/categories.ts или других файлах
try {
  // ваш код
} catch (error) {
  console.error("Detailed error:", error);
  throw error; // перебросить для Next.js
}
```

## Быстрое решение:

### Вариант 1: Проверьте DATABASE_URL

Убедитесь, что в Vercel добавлен правильный URL:
```
postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Вариант 2: Добавьте обработку ошибок

Убедитесь, что все функции обработки данных имеют try-catch блоки.

### Вариант 3: Проверьте миграции

Убедитесь, что миграции базы данных выполнены:
```bash
npx prisma migrate deploy
```

## Что делать дальше:

1. **Проверьте логи Vercel** - там будет детальная информация об ошибке
2. **Скопируйте полный текст ошибки** из логов
3. **Проверьте переменные окружения** в Vercel
4. **Убедитесь, что база данных доступна** в Supabase

---

## 📝 Пришлите мне:

1. Полный текст ошибки из логов Vercel (Functions/Logs)
2. Список настроенных переменных окружения (без значений паролей)
3. Скриншот ошибки, если есть

Тогда я смогу точно определить проблему и исправить её.

