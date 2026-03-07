# 🧪 Тестирование хеша пароля

Если вход все еще не работает, давайте проверим хеш пароля локально.

## Шаг 1: Проверьте хеш пароля локально

В терминале проекта выполните:

```bash
cd "/Users/admin/namangan elonlar"
node -e "const bcrypt = require('bcryptjs'); const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'; bcrypt.compare('admin123', hash).then(result => console.log('Match:', result));"
```

Замените:
- `'admin123'` - на ваш пароль
- `'$2a$10$...'` - на хеш из базы данных

Если выводит `Match: true`, значит хеш правильный.

## Шаг 2: Сгенерируйте новый хеш

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('ваш-пароль', 10).then(h => console.log('Hash:', h));"
```

Скопируйте хеш и обновите в базе данных.

## Шаг 3: Обновите пароль в базе

```sql
UPDATE "User" 
SET 
    password = 'ваш-новый-хеш',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'ваш-email@gmail.com';
```

