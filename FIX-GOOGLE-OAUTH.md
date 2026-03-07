# 🔧 Исправление входа через Google

## Проблема:
После нажатия "Войти через Google" и разрешения доступа, система возвращает на страницу входа вместо успешной авторизации.

## Причины:

### 1. Неправильные Redirect URIs в Google Cloud Console
Самая частая причина - callback URL не добавлен в список разрешенных.

### 2. Неправильный NEXTAUTH_URL
NEXTAUTH_URL должен точно совпадать с URL вашего сайта.

### 3. Проблемы с доменом
Google может блокировать redirect на непроверенные домены.

---

## ✅ Решение:

### Шаг 1: Проверьте NEXTAUTH_URL

В Vercel Environment Variables убедитесь, что:
- `NEXTAUTH_URL` = `https://namelonlar.vercel.app` (или ваш точный URL)
- Без слеша в конце (`/`)
- Используется `https://`, не `http://`

### Шаг 2: Обновите Redirect URIs в Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите ваш **OAuth 2.0 Client ID**
5. Нажмите на него для редактирования
6. В секции **"Authorized redirect URIs"** добавьте:

```
https://namelonlar.vercel.app/api/auth/callback/google
```

**Важно:** 
- Используйте точный URL вашего сайта
- Должен быть `/api/auth/callback/google` в конце
- Используйте `https://`, не `http://`

### Шаг 3: Добавьте все возможные варианты URL

Если у вас есть несколько доменов (preview, production), добавьте все:

```
https://namelonlar.vercel.app/api/auth/callback/google
https://namelonlar-*.vercel.app/api/auth/callback/google
```

Или конкретные preview URLs, если используете.

### Шаг 4: Проверьте Authorized JavaScript origins

В том же окне редактирования OAuth Client, в секции **"Authorized JavaScript origins"** добавьте:

```
https://namelonlar.vercel.app
```

Без `/api/auth/callback/google` - только базовый URL.

### Шаг 5: Сохраните изменения

1. Нажмите **"Save"** в Google Cloud Console
2. Подождите 1-2 минуты (изменения могут применяться не сразу)

### Шаг 6: Перезапустите деплой в Vercel

1. Vercel Dashboard → **Deployments**
2. Найдите последний deployment
3. Нажмите **"Redeploy"**

---

## 🔍 Проверка настроек:

### В Google Cloud Console должно быть:

**Authorized JavaScript origins:**
```
https://namelonlar.vercel.app
```

**Authorized redirect URIs:**
```
https://namelonlar.vercel.app/api/auth/callback/google
```

### В Vercel Environment Variables должно быть:

```
NEXTAUTH_URL=https://namelonlar.vercel.app
GOOGLE_CLIENT_ID=ваш-client-id
GOOGLE_CLIENT_SECRET=ваш-client-secret
```

---

## ⚠️ Частые ошибки:

### Ошибка 1: Redirect URI mismatch
**Симптом:** "redirect_uri_mismatch" в ошибке Google

**Решение:** Убедитесь, что redirect URI в Google Console точно совпадает с `NEXTAUTH_URL/api/auth/callback/google`

### Ошибка 2: NEXTAUTH_URL неправильный
**Симптом:** После авторизации возвращает на страницу входа

**Решение:** 
- Проверьте, что `NEXTAUTH_URL` точно совпадает с URL сайта
- Убедитесь, что нет слеша в конце
- Используйте `https://`, не `http://`

### Ошибка 3: OAuth consent screen не настроен
**Симптом:** Google показывает предупреждение о непроверенном приложении

**Решение:**
1. Google Cloud Console → **APIs & Services** → **OAuth consent screen**
2. Заполните обязательные поля:
   - App name
   - User support email
   - Developer contact email
3. Сохраните

---

## 🧪 Тестирование:

После исправления:

1. Откройте сайт
2. Нажмите "Войти через Google"
3. Разрешите доступ
4. Должно перенаправить на главную страницу (авторизованным)

Если все еще не работает:
- Проверьте логи Vercel (Functions → Logs)
- Проверьте консоль браузера (F12) на ошибки
- Убедитесь, что изменения в Google Console сохранены

---

## 📝 Быстрая проверка:

1. ✅ `NEXTAUTH_URL` = точный URL сайта (без слеша)
2. ✅ Redirect URI в Google = `{NEXTAUTH_URL}/api/auth/callback/google`
3. ✅ JavaScript origin в Google = `{NEXTAUTH_URL}` (без пути)
4. ✅ OAuth consent screen настроен
5. ✅ Изменения сохранены в Google Console
6. ✅ Деплой перезапущен в Vercel

