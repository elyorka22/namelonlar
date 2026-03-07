# 🧪 Тестирование пароля через API

Если формат пароля правильный в Supabase, но вход не работает, используйте этот тестовый endpoint для диагностики.

---

## 🔍 Шаг 1: Проверьте пароль через API

После деплоя на Vercel, откройте консоль браузера (F12) на сайте и выполните:

```javascript
fetch('/api/test-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'ваш-email@gmail.com',
    password: 'ваш-пароль'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Результат проверки:', data);
  
  // Проверяем результаты
  if (data.found) {
    console.log('✅ Пользователь найден');
    console.log('Email в базе:', data.user.email);
    console.log('Роль:', data.user.role);
    
    if (data.hasPassword) {
      console.log('Формат пароля:', data.passwordFormat.status);
      console.log('Пароль правильный:', data.passwordValidation.valid);
      
      if (data.passwordValidation.valid.includes('✅')) {
        console.log('✅ ПАРОЛЬ ПРАВИЛЬНЫЙ! Проблема в другом месте.');
      } else {
        console.log('❌ Пароль не совпадает');
        console.log('Варианты проверки:', data.testVariations);
      }
    } else {
      console.log('❌ У пользователя нет пароля');
    }
  } else {
    console.log('❌ Пользователь не найден');
    console.log('Искали email:', data.searchedEmail);
  }
});
```

---

## 📊 Что покажет результат:

### ✅ Если все правильно:

```json
{
  "found": true,
  "hasPassword": true,
  "passwordFormat": {
    "isBcrypt": true,
    "length": 60,
    "status": "✅ Правильный формат"
  },
  "passwordValidation": {
    "valid": "✅ Пароль правильный"
  },
  "user": {
    "email": "ваш-email@gmail.com",
    "role": "ADMIN"
  }
}
```

### ❌ Если пароль не совпадает:

```json
{
  "passwordValidation": {
    "valid": "❌ Пароль неверный"
  },
  "testVariations": {
    "original": false,
    "trimmed": false,
    "withSpaces": false
  }
}
```

---

## 🔧 Решения в зависимости от результата:

### Если "Пользователь не найден":

1. Проверьте email в базе:
   ```sql
   SELECT email FROM "User" WHERE LOWER(email) = LOWER('ваш-email@gmail.com');
   ```

2. Нормализуйте email:
   ```sql
   UPDATE "User" 
   SET email = LOWER(TRIM(email))
   WHERE email = 'ваш-email@gmail.com';
   ```

### Если "Пароль неверный":

1. **Пересоздайте пароль:**
   - Откройте: https://bcrypt-generator.com/
   - Введите ваш пароль
   - Скопируйте хеш
   - Обновите в базе:
     ```sql
     UPDATE "User" 
     SET password = '$2a$10$...'  -- ваш хеш
     WHERE email = 'ваш-email@gmail.com';
     ```

2. **Проверьте, что вводите правильный пароль:**
   - Убедитесь, что нет лишних пробелов
   - Проверьте регистр (если пароль чувствителен к регистру)
   - Попробуйте создать новый пароль через форму регистрации

### Если "Пароль правильный", но вход не работает:

Проблема может быть в:
1. **NEXTAUTH_SECRET** не установлен в Vercel
2. **Кэш браузера** - очистите cookies
3. **Сессия не создается** - проверьте логи в Vercel

---

## 🎯 Полный тест:

Выполните этот код в консоли браузера для полной диагностики:

```javascript
async function testLogin() {
  const email = 'ваш-email@gmail.com';
  const password = 'ваш-пароль';
  
  console.log('🔍 Тестирование входа...');
  console.log('Email:', email);
  console.log('Password length:', password.length);
  
  // 1. Проверяем пароль
  const passwordTest = await fetch('/api/test-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());
  
  console.log('📊 Результат проверки пароля:', passwordTest);
  
  // 2. Проверяем сессию
  const session = await fetch('/api/auth/session')
    .then(r => r.json());
  
  console.log('📊 Текущая сессия:', session);
  
  // 3. Пробуем войти
  const signInResult = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      email,
      password,
      redirect: 'false',
      json: 'true'
    })
  }).then(r => r.json());
  
  console.log('📊 Результат входа:', signInResult);
  
  return { passwordTest, session, signInResult };
}

// Запустите:
testLogin().then(console.log);
```

---

## ⚠️ Важно:

- Этот endpoint только для диагностики
- Не используйте его в production без защиты
- После диагностики удалите или защитите endpoint

