# 🔐 Как работает авторизация в проекте

## 📊 Где хранятся данные пользователей

### 1. **Supabase Auth (`auth.users`)**
- **Когда используется**: Google OAuth через Supabase
- **Где**: Внутренняя таблица Supabase `auth.users`
- **Доступ**: Только через Supabase Auth API
- **Что хранится**: 
  - Email
  - ID пользователя (UUID)
  - Метаданные (имя, фото из Google)
  - Токены доступа

### 2. **Prisma Database (`public.User`)**
- **Когда используется**: Все проверки авторизации на сайте
- **Где**: Таблица `public.User` в PostgreSQL через Prisma
- **Доступ**: Через Prisma ORM
- **Что хранится**:
  - ID (cuid)
  - Email
  - Name
  - Image
  - Password (для email/password авторизации)
  - Role (USER, ADMIN, MODERATOR)
  - И другие поля из schema.prisma

## 🔄 Процесс авторизации

### Google OAuth (через Supabase)

1. **Пользователь нажимает "Войти через Google"**
   - Клиент вызывает `supabase.auth.signInWithOAuth()`
   - Перенаправление на Google

2. **Google возвращает код**
   - Перенаправление на `/auth/callback?code=...`
   - `app/auth/callback/route.ts` обрабатывает код

3. **Обмен кода на сессию**
   ```typescript
   await supabase.auth.exchangeCodeForSession(code)
   ```
   - Данные попадают в `auth.users` (Supabase)
   - Cookies устанавливаются в браузере

4. **Синхронизация с Prisma**
   ```typescript
   // app/auth/callback/route.ts
   await prisma.user.create({ email, name, image })
   ```
   - Данные копируются в `public.User` (Prisma)
   - Это нужно для работы с остальной частью приложения

5. **Проверка авторизации**
   - `getCurrentUser()` проверяет Supabase сессию
   - Затем ищет пользователя в `public.User` через Prisma
   - Возвращает данные из Prisma

### Email/Password (через NextAuth)

1. **Пользователь вводит email и пароль**
   - Форма отправляет данные в NextAuth

2. **NextAuth проверяет в Prisma**
   ```typescript
   // lib/auth.ts
   user = await prisma.user.findFirst({ where: { email } })
   await bcrypt.compare(password, user.password)
   ```
   - Ищет пользователя в `public.User`
   - Проверяет пароль (bcrypt)

3. **Создание сессии**
   - NextAuth создает JWT токен
   - Сохраняет в cookies (NextAuth формат)

4. **Проверка авторизации**
   - `getCurrentUser()` проверяет NextAuth сессию
   - Возвращает данные из Prisma

## ⚠️ Проблемы и решения

### Проблема: Пользователь авторизован, но `getCurrentUser()` не находит его

**Причина**: 
- Данные есть в `auth.users` (Supabase), но не синхронизированы в `public.User` (Prisma)
- Или cookies не передаются с клиента на сервер

**Решение**:
1. Проверьте синхронизацию в `/auth/callback/route.ts`
2. Используйте диагностический endpoint: `/api/debug-auth`
3. Проверьте логи в Vercel

### Проблема: Email/password не работает

**Причина**:
- Пользователь не создан в `public.User`
- Пароль не установлен или неправильный формат

**Решение**:
1. Создайте пользователя через SQL или форму регистрации
2. Установите пароль через `/profile/settings`
3. Проверьте формат пароля (должен быть bcrypt hash)

## 🔍 Диагностика

### Используйте `/api/debug-auth`

Откройте в браузере после авторизации:
```
https://namelonlar.vercel.app/api/debug-auth
```

Это покажет:
- ✅ Есть ли сессия в Supabase Auth
- ✅ Есть ли пользователь в Prisma
- ✅ Работает ли `getCurrentUser()`
- ✅ Синхронизированы ли данные
- ✅ Список последних пользователей

## 📝 Важные файлы

- `app/auth/callback/route.ts` - Обработка Google OAuth callback
- `lib/auth.ts` - Настройка NextAuth (email/password)
- `lib/auth-helpers.ts` - Функция `getCurrentUser()`
- `prisma/schema.prisma` - Схема таблицы `User`

## ✅ Правильный поток данных

```
Google OAuth:
Google → Supabase Auth (auth.users) → Синхронизация → Prisma (public.User) → getCurrentUser()

Email/Password:
Форма → NextAuth → Prisma (public.User) → getCurrentUser()
```

**Важно**: Все проверки авторизации должны использовать `getCurrentUser()`, который ищет в `public.User` через Prisma, а не напрямую в `auth.users`.

