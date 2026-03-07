# 🔍 Где найти Connection String в Supabase

## ❌ НЕ в разделе Connection Pooling

Connection Pooling - это настройки пула соединений, а не сам Connection String.

## ✅ Правильное место: Settings → Database → Connection string

### Шаг 1: Откройте Database Settings

1. Откройте **Supabase Dashboard**: https://supabase.com/dashboard
2. Выберите проект **ohzuxcilqyanybqqmitw**
3. Перейдите в **Settings** (иконка шестеренки слева)
4. Выберите **Database** в меню слева

### Шаг 2: Найдите раздел "Connection string"

В разделе **Database** вы увидите несколько вкладок/секций:
- **Connection info** - здесь Connection String
- **Connection pooling** - это настройки пула (не то, что нужно)
- **Database password** - пароль базы данных

### Шаг 3: Выберите Connection Pooling mode

В разделе **Connection string** или **Connection info** вы увидите:

1. **Connection string** - здесь несколько вариантов:
   - **URI** - прямой URL (порт 5432) - НЕ используйте для Vercel
   - **JDBC** - для Java
   - **Connection Pooling** - это то, что нужно! ✅

2. Выберите вкладку/опцию **Connection Pooling** или **Transaction mode**

3. Скопируйте Connection String

### Шаг 4: Формат Connection String

Connection String должен выглядеть так:
```
postgresql://postgres.ohzuxcilqyanybqqmitw:ВАШ_ПАРОЛЬ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Проверьте:**
- ✅ Начинается с `postgresql://postgres.ohzuxcilqyanybqqmitw:`
- ✅ Содержит `pooler.supabase.com` (не `db.xxx.supabase.co`)
- ✅ Порт `6543` (не `5432`)
- ✅ Есть `?pgbouncer=true` в конце

---

## 🔄 Альтернативный способ: Через Connection Info

Если не можете найти Connection Pooling:

1. **Settings** → **Database**
2. Найдите раздел **Connection info** или **Connection string**
3. Там должны быть вкладки:
   - **Direct connection** (URI) - НЕ используйте
   - **Connection pooling** (URI) - используйте этот ✅
   - **Session mode** - альтернатива
   - **Transaction mode** - рекомендуется ✅

4. Выберите **Transaction mode**
5. Скопируйте Connection String

---

## 📸 Визуальная подсказка

В Supabase Dashboard структура обычно такая:

```
Settings
├── General
├── Database ← ЗДЕСЬ
│   ├── Connection info ← Connection String здесь
│   │   ├── Direct connection (URI) - порт 5432
│   │   ├── Connection pooling (URI) - порт 6543 ✅
│   │   ├── Session mode
│   │   └── Transaction mode ✅
│   ├── Connection pooling ← Настройки пула (не Connection String)
│   └── Database password
├── API
└── ...
```

---

## 🆘 Если все еще не можете найти

### Вариант 1: Используйте Connection Info

1. **Settings** → **Database** → **Connection info**
2. Найдите поле с текстом, начинающимся с `postgresql://`
3. Убедитесь, что выбран режим **Connection pooling** или **Transaction mode**
4. Скопируйте URL

### Вариант 2: Соберите вручную

Если у вас есть пароль базы данных, вы можете собрать URL вручную:

Формат:
```
postgresql://postgres.ohzuxcilqyanybqqmitw:ВАШ_ПАРОЛЬ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Где:
- `ohzuxcilqyanybqqmitw` - ваш project ref
- `ВАШ_ПАРОЛЬ` - пароль из Settings → Database → Database password
- `ap-southeast-1` - ваш регион
- `6543` - порт для Connection Pooling
- `?pgbouncer=true` - обязательно в конце

### Вариант 3: Через Supabase CLI

Если у вас установлен Supabase CLI:
```bash
supabase db connection-string --pooler
```

---

## ✅ После получения Connection String

1. Скопируйте Connection String
2. Откройте **Vercel** → **Settings** → **Environment Variables**
3. Найдите `DATABASE_URL`
4. Замените на новый Connection Pooling URL
5. Убедитесь, что выбраны все окружения (Production, Preview, Development)
6. Сохраните
7. Сделайте **Redeploy**

---

## 🔍 Проверка правильности URL

После обновления проверьте:
```
https://namelonlar.vercel.app/api/test-db-connection
```

Должно показать:
- `hasPooler: true`
- `hasPort6543: true`
- `connectionTest.status: "success"`

