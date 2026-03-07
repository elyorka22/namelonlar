# 🔧 Исправление DATABASE_URL для Supabase

## Проблема

Если вы видите ошибку:
```
Can't reach database server at db.xxx.supabase.co:5432
```

Это означает, что используется **прямой URL базы данных** вместо **Connection Pooling URL**.

## Решение

### Шаг 1: Получите правильный Connection Pooling URL

1. Откройте Supabase Dashboard → ваш проект
2. Перейдите в **Settings** → **Database**
3. Прокрутите до секции **"Connection string"**
4. Выберите вкладку **"Connection pooling"** (важно!)
5. Выберите режим: **Transaction** или **Session**
6. Скопируйте строку подключения

### Шаг 2: Формат правильного URL

**Неправильно (прямой):**
```
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

**Правильно (Connection Pooling):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Ключевые отличия:**
- ✅ Используется `pooler.supabase.com` вместо `db.xxx.supabase.co`
- ✅ Порт **6543** вместо 5432
- ✅ Добавлен `?pgbouncer=true`
- ✅ Формат: `postgres.[PROJECT-REF]` вместо просто `postgres`

### Шаг 3: Обновите переменную в Vercel

1. Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Замените на Connection Pooling URL из Supabase
4. Нажмите **Save**
5. Перезапустите деплой (Redeploy)

---

## ⚠️ Важно

- **НЕ используйте** прямой URL (порт 5432) для продакшена
- **Используйте** Connection Pooling URL (порт 6543) для Vercel
- Прямой URL работает только для локальной разработки с ограничениями

---

## 🔍 Как проверить

После обновления URL, проверьте логи Vercel:
- ✅ Не должно быть ошибок "Can't reach database server"
- ✅ Сайт должен загружаться без ошибок
- ✅ Страницы должны отображать данные из базы

---

## 📝 Пример правильного URL

```
postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Где:
- `abcdefghijklmnop` - ваш Project Reference ID
- `MyPassword123` - ваш пароль базы данных
- `us-east-1` - ваш регион

