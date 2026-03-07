# 🔍 Где найти раздел Database в Supabase

## ❌ НЕ в Settings (шестеренка)

Database - это **отдельный раздел** в главном меню слева, а не внутри Settings.

## ✅ Правильный путь

### Шаг 1: Вернитесь на главную страницу проекта

1. В левом меню найдите иконку **Database** (иконка базы данных) или
2. Нажмите на название проекта вверху, чтобы вернуться на главную

### Шаг 2: Найдите раздел Database в левом меню

В левом боковом меню (sidebar) вы увидите иконки/разделы:

```
🏠 Home
🗄️ Database  ← ЗДЕСЬ!
👥 Authentication
🔧 Edge Functions
📊 Storage
⚙️ Settings (шестеренка)
```

### Шаг 3: Нажмите на Database

1. Нажмите на иконку **Database** (🗄️) в левом меню
2. Откроется страница Database

### Шаг 4: Внутри Database найдите Connection string

На странице Database вы увидите несколько вкладок/разделов:
- **Tables** - таблицы
- **Functions** - функции
- **Migrations** - миграции
- **Connection string** или **Connection info** ← ЗДЕСЬ!

Или вверху страницы Database может быть кнопка/ссылка **"Connection string"** или **"Connection info"**.

---

## 🔄 Альтернативный способ: Через URL

Если не можете найти через меню, попробуйте открыть напрямую:

1. В адресной строке браузера замените текущий URL на:
   ```
   https://supabase.com/dashboard/project/ohzuxcilqyanybqqmitw/settings/database
   ```

2. Или попробуйте:
   ```
   https://supabase.com/dashboard/project/ohzuxcilqyanybqqmitw/database
   ```

---

## 📍 Точное расположение Connection String

После того как откроете Database, Connection String обычно находится:

### Вариант 1: Вкладка "Connection string"
- Вверху страницы Database может быть вкладка **"Connection string"**
- Нажмите на неё

### Вариант 2: В Settings → Database
1. Откройте **Settings** (шестеренка)
2. В меню Settings слева найдите **"Database"** (не "General")
3. Там будет раздел **"Connection string"**

### Вариант 3: В Connection info
1. На странице Database найдите раздел **"Connection info"**
2. Там будут разные режимы подключения
3. Выберите **"Connection pooling"** или **"Transaction mode"**
4. Скопируйте Connection String

---

## 🎯 Быстрый способ через Settings

Если в Settings есть раздел Database:

1. **Settings** (шестеренка) ← вы уже здесь
2. В левом меню Settings найдите **"Database"** (не "General")
3. Нажмите на **"Database"**
4. Там будет раздел **"Connection string"** или **"Connection info"**

---

## 📸 Что искать

Connection String выглядит так:
```
postgresql://postgres.ohzuxcilqyanybqqmitw:ПАРОЛЬ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Ищите:
- Поле с текстом, начинающимся с `postgresql://`
- Вкладки/кнопки: "Connection pooling", "Transaction mode", "Session mode"
- Кнопку "Copy" рядом с Connection String

---

## ✅ После того как найдете

1. Выберите режим **"Connection pooling"** или **"Transaction mode"**
2. Скопируйте Connection String
3. Обновите `DATABASE_URL` в Vercel
4. Сделайте Redeploy

