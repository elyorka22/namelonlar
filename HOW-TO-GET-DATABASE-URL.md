# 🔍 Как найти DATABASE_URL в Supabase

## Шаг 1: Откройте правильный раздел

1. В Supabase Dashboard откройте ваш проект
2. В левом меню найдите **"Settings"** (шестеренка ⚙️)
3. Нажмите на **"Settings"**
4. В подменю выберите **"Database"** (НЕ "Connection pooling"!)

## Шаг 2: Найдите Connection string

1. Прокрутите страницу вниз до секции **"Connection string"**
2. Вы увидите несколько вкладок:
   - **URI** (обычный формат)
   - **JDBC** (для Java)
   - **Connection pooling** ← **ВЫБЕРИТЕ ЭТУ!**

## Шаг 3: Выберите Connection pooling

1. Нажмите на вкладку **"Connection pooling"**
2. Выберите режим: **"Transaction"** или **"Session"** (оба работают)
3. Скопируйте строку подключения

## Шаг 4: Формат URL

Скопированная строка будет выглядеть примерно так:

```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

⚠️ **ВАЖНО:** 
- Замените `[YOUR-PASSWORD]` на ваш реальный пароль базы данных
- Если пароль содержит специальные символы, замените их на URL-encoded версию:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
  - `+` → `%2B`
  - `=` → `%3D`
  - `?` → `%3F`

## Шаг 5: Альтернативный способ (если не видите Connection string)

Если вы не видите секцию "Connection string", попробуйте:

1. **Settings** → **API**
2. Найдите секцию **"Project URL"** и **"anon key"**
3. Но для DATABASE_URL нужен именно **Database** раздел

## Шаг 6: Если пароль забыт

Если вы не помните пароль базы данных:

1. В разделе **Settings** → **Database**
2. Найдите секцию **"Reset database password"**
3. Нажмите **"Reset password"**
4. ⚠️ **Внимание:** Это разорвет все существующие подключения!
5. После сброса используйте новый пароль в URL

## 📝 Пример полного процесса

1. Supabase Dashboard → ваш проект
2. **Settings** (⚙️ в левом меню)
3. **Database** (в подменю Settings)
4. Прокрутите до **"Connection string"**
5. Вкладка **"Connection pooling"**
6. Режим: **Transaction**
7. Скопируйте строку
8. Замените `[YOUR-PASSWORD]` на ваш пароль
9. Добавьте в Vercel как `DATABASE_URL`

---

## ❓ Все еще не видите?

Если вы находитесь в разделе Connection pooling (как на скриншоте), но не видите Connection string:

1. Вернитесь назад к **Settings** → **Database**
2. Connection string находится **выше** секции Connection pooling
3. Или попробуйте другой браузер/очистите кеш

---

## 🔗 Прямая ссылка

После входа в Supabase, перейдите по адресу:
```
https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/settings/database
```

Замените `[YOUR-PROJECT-ID]` на ID вашего проекта.

