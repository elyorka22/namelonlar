# 🔧 Устранение проблем с подключением к базе данных

Если DATABASE_URL настроен, пользователь есть в базе, но все еще получаете ошибку "FATAL: Tenant or user not found", проверьте следующее:

---

## 🔍 Шаг 1: Проверьте логи в Vercel

1. Откройте **Vercel Dashboard** → ваш проект → **Deployments**
2. Найдите последний deployment
3. Нажмите на него → **Logs**
4. Ищите ошибки с `Database error` или `FATAL`

Это покажет точную причину ошибки.

---

## 🔍 Шаг 2: Проверьте, что DATABASE_URL применен

**Важно:** После установки переменных окружения нужен **Redeploy**!

1. В Vercel → **Deployments**
2. Проверьте время последнего deployment:
   - Если он был создан **ДО** установки DATABASE_URL → нужен **Redeploy**
   - Если он был создан **ПОСЛЕ** установки DATABASE_URL → переменная должна быть применена

3. Сделайте **Redeploy**:
   - Нажмите **...** → **Redeploy**
   - Или создайте пустой commit:
     ```bash
     git commit --allow-empty -m "Trigger redeploy"
     git push
     ```

---

## 🔍 Шаг 3: Проверьте все окружения

DATABASE_URL должен быть установлен для **всех окружений**:

1. В Vercel → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Убедитесь, что выбраны:
   - ✅ **Production**
   - ✅ **Preview** (важно для тестирования!)
   - ✅ **Development**

Если `DATABASE_URL` установлен только для Production, но вы тестируете на Preview URL, он не будет работать!

---

## 🔍 Шаг 4: Проверьте пароль в Supabase

Ошибка "Tenant or user not found" часто означает неправильный пароль.

1. Откройте **Supabase Dashboard** → ваш проект
2. Перейдите в **Settings** → **Database**
3. Найдите **Database password**
4. Сравните с паролем в DATABASE_URL:
   ```
   postgresql://postgres.xxx:ПАРОЛЬ@...
   ```

### Если пароль другой:

**Вариант A: Обновите DATABASE_URL**
1. Скопируйте правильный пароль из Supabase
2. Обновите `DATABASE_URL` в Vercel с новым паролем
3. Сделайте **Redeploy**

**Вариант B: Сбросьте пароль**
1. В Supabase → **Settings** → **Database**
2. Нажмите **Reset database password**
3. Скопируйте новый пароль
4. Обновите `DATABASE_URL` в Vercel
5. Сделайте **Redeploy**

---

## 🔍 Шаг 5: Проверьте проект Supabase

1. Откройте **Supabase Dashboard**
2. Убедитесь, что проект **активен** (не приостановлен)
3. Проверьте статус базы данных:
   - Settings → Database → должна быть видна информация о базе

---

## 🔍 Шаг 6: Проверьте Connection Pooling

1. В Supabase → **Settings** → **Database** → **Connection Pooling**
2. Убедитесь, что Connection Pooling **включен**
3. Скопируйте **Connection String** (Transaction mode)
4. Сравните с вашим DATABASE_URL:
   - Должен быть одинаковый формат
   - Должен быть порт 6543
   - Должен быть `?pgbouncer=true`

---

## 🔍 Шаг 7: Проверьте через API

После деплоя откройте консоль браузера и выполните:

```javascript
fetch('/api/test-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'esalimov15@gmail.com',
    password: 'ваш-пароль'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Результат:', data);
  
  if (data.diagnostic) {
    console.log('Тип ошибки:', data.diagnostic.errorType);
    console.log('Предложения:', data.diagnostic.suggestions);
  }
  
  if (data.dbUrlFormat) {
    console.log('Формат DATABASE_URL:', data.dbUrlFormat);
    if (!data.dbUrlFormat.hasPooler || !data.dbUrlFormat.hasPgbouncer || !data.dbUrlFormat.hasPort6543) {
      console.error('❌ Неправильный формат DATABASE_URL!');
    }
  }
});
```

Это покажет детальную информацию об ошибке.

---

## 🔍 Шаг 8: Проверьте IP адреса (если используется IP whitelist)

Если в Supabase включен IP whitelist:

1. В Supabase → **Settings** → **Database** → **Connection Pooling**
2. Проверьте, нет ли ограничений по IP
3. Если есть, добавьте IP адреса Vercel или отключите whitelist

---

## ✅ Чек-лист

- [ ] DATABASE_URL установлен в Vercel
- [ ] DATABASE_URL установлен для всех окружений (Production, Preview, Development)
- [ ] Сделан Redeploy после установки DATABASE_URL
- [ ] Пароль в DATABASE_URL правильный (проверено в Supabase)
- [ ] Проект Supabase активен
- [ ] Connection Pooling включен
- [ ] Используется правильный формат URL (pooler.supabase.com:6543?pgbouncer=true)
- [ ] Проверены логи в Vercel

---

## 🐛 Если все еще не работает

1. **Сбросьте пароль базы данных:**
   - Supabase → Settings → Database → Reset database password
   - Обновите DATABASE_URL в Vercel
   - Сделайте Redeploy

2. **Получите новый Connection String:**
   - Supabase → Settings → Database → Connection Pooling
   - Скопируйте Connection String (Transaction mode)
   - Обновите DATABASE_URL в Vercel
   - Сделайте Redeploy

3. **Проверьте логи в Vercel:**
   - Найдите точную ошибку
   - Сравните с диагностической информацией из API

---

## 📞 Дополнительная диагностика

Выполните в консоли браузера:

```javascript
// Проверка DATABASE_URL
fetch('/api/check-db')
  .then(r => r.json())
  .then(data => {
    console.log('DATABASE_URL проверка:', data);
    if (!data.hasDatabaseUrl) {
      console.error('❌ DATABASE_URL не установлен!');
    } else if (!data.details.isCorrectFormat) {
      console.error('❌ Неправильный формат:', data.status);
    } else {
      console.log('✅ DATABASE_URL правильный');
    }
  });
```

