# 🔍 Где найти Connection String в Supabase

## ✅ Connection String НЕ в Database Settings

Connection String находится на **главной странице Database**, а не в Settings.

## 📍 Правильный путь

### Шаг 1: Вернитесь на главную страницу Database

1. Вверху страницы найдите кнопку **"Connect"** (она видна на вашем экране)
2. Или вернитесь назад: нажмите на **"Database"** в левом меню (не Settings → Database)

### Шаг 2: На главной странице Database

На главной странице Database (не в Settings) вы увидите:

1. **Вкладки вверху:**
   - Tables
   - Functions
   - Migrations
   - **Connection string** или **Connection info** ← ЗДЕСЬ!

2. **Или раздел "Connection info":**
   - Может быть карточка/блок с названием "Connection info"
   - Там будут разные режимы подключения

3. **Или кнопка "Connect" вверху:**
   - Нажмите на кнопку **"Connect"** (она видна на вашем экране)
   - Откроется модальное окно или страница с Connection String

### Шаг 3: Выберите Connection Pooling

Когда найдете Connection String, вы увидите несколько вариантов:

- **Direct connection** (URI) - порт 5432 - НЕ используйте
- **Connection pooling** (URI) - порт 6543 ✅ - используйте этот
- **Session mode** - альтернатива
- **Transaction mode** - рекомендуется ✅

Выберите **"Connection pooling"** или **"Transaction mode"** и скопируйте Connection String.

---

## 🔄 Альтернативный способ: Через кнопку "Connect"

1. На странице, где вы сейчас находитесь, вверху есть кнопка **"Connect"**
2. Нажмите на неё
3. Откроется модальное окно или страница с Connection String
4. Выберите режим **"Connection pooling"** или **"Transaction mode"**
5. Скопируйте Connection String

---

## 📝 Формат Connection String

Connection String должен выглядеть так:
```
postgresql://postgres.ohzuxcilqyanybqqmitw:ПАРОЛЬ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Проверьте:**
- ✅ Содержит `pooler.supabase.com` (не `db.xxx.supabase.co`)
- ✅ Порт `6543` (не `5432`)
- ✅ Есть `?pgbouncer=true` в конце

---

## 🎯 Быстрый способ через URL

Попробуйте открыть напрямую:

```
https://supabase.com/dashboard/project/ohzuxcilqyanybqqmitw/database/connection-string
```

Или:

```
https://supabase.com/dashboard/project/ohzuxcilqyanybqqmitw/database
```

И там найдите вкладку/раздел "Connection string" или "Connection info".

---

## ✅ После того как найдете

1. Выберите режим **"Connection pooling"** или **"Transaction mode"**
2. Скопируйте Connection String
3. Обновите `DATABASE_URL` в Vercel
4. Сделайте Redeploy

