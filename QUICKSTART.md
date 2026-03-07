# Быстрый старт

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Настройка базы данных

1. Создайте PostgreSQL базу данных:
```bash
createdb namangan_elonlar
```

2. Настройте `.env` файл:
```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/namangan_elonlar?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="сгенерируйте-случайную-строку-здесь"
```

Для генерации `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

3. Примените миграции:
```bash
npm run db:push
```

4. Заполните начальными данными (категории):
```bash
npm run db:seed
```

## Шаг 3: Настройка Cloudinary (для загрузки изображений)

1. Зарегистрируйтесь на [Cloudinary](https://cloudinary.com)
2. Добавьте в `.env`:
```env
CLOUDINARY_CLOUD_NAME="ваш-cloud-name"
CLOUDINARY_API_KEY="ваш-api-key"
CLOUDINARY_API_SECRET="ваш-api-secret"
```

## Шаг 4: Настройка Google OAuth (опционально)

1. Создайте проект в [Google Cloud Console](https://console.cloud.google.com)
2. Включите Google+ API
3. Создайте OAuth 2.0 credentials
4. Добавьте в `.env`:
```env
GOOGLE_CLIENT_ID="ваш-client-id"
GOOGLE_CLIENT_SECRET="ваш-client-secret"
```

## Шаг 5: Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Шаг 6: Создание первого админа

Запустите Prisma Studio:
```bash
npm run db:studio
```

Или используйте SQL:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'ваш-email@example.com';
```

## Тестирование

Запустите тесты Playwright:
```bash
npm test
```

Или с UI:
```bash
npm run test:ui
```

## Структура проекта

- `app/` - Next.js страницы и API routes
- `components/` - React компоненты
- `lib/` - Утилиты и конфигурация
- `prisma/` - Схема базы данных и миграции
- `tests/` - Playwright тесты

## Основные команды

```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен версии
npm run lint         # Проверка кода
npm run db:generate  # Генерация Prisma Client
npm run db:push      # Применить изменения схемы
npm run db:studio    # Открыть Prisma Studio
npm test             # Запустить тесты
```

## Полезные ссылки

- [Next.js документация](https://nextjs.org/docs)
- [Prisma документация](https://www.prisma.io/docs)
- [NextAuth.js документация](https://next-auth.js.org)
- [TailwindCSS документация](https://tailwindcss.com/docs)

