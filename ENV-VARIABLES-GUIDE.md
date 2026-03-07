# 📋 Где взять переменные окружения

Подробное руководство по получению всех необходимых переменных окружения для деплоя.

---

## 1. DATABASE_URL (Supabase)

### Шаги:

1. **Создайте проект в Supabase:**
   - Перейдите на https://supabase.com
   - Войдите или зарегистрируйтесь
   - Нажмите **"New Project"**
   - Заполните:
     - **Name**: `namelonlar` (или любое имя)
     - **Database Password**: создайте надежный пароль (сохраните его!)
     - **Region**: выберите ближайший регион
   - Нажмите **"Create new project"**
   - Подождите 2-3 минуты, пока проект создается

2. **Получите Connection String:**
   - В Supabase Dashboard → ваш проект
   - Перейдите в **Settings** (шестеренка слева) → **Database**
   - Прокрутите до секции **"Connection string"**
   - Выберите вкладку **"Connection pooling"** (важно!)
   - Скопируйте строку, которая выглядит так:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - **Замените `[YOUR-PASSWORD]`** на пароль, который вы создали при создании проекта
   - Это и есть ваш `DATABASE_URL`

### Пример:
```
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:MySecurePassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 2. NEXTAUTH_URL

### Для продакшена:
```
NEXTAUTH_URL=https://your-project-name.vercel.app
```

**Где взять:**
- После первого деплоя в Vercel вы получите URL вида: `https://namelonlar.vercel.app`
- Или вы можете настроить кастомный домен в Vercel Settings → Domains

### Для разработки (локально):
```
NEXTAUTH_URL=http://localhost:3000
```

---

## 3. NEXTAUTH_SECRET

### Генерация секретного ключа:

**Вариант 1: Онлайн генератор**
- Перейдите на https://generate-secret.vercel.app/32
- Скопируйте сгенерированный ключ

**Вариант 2: Через командную строку**
```bash
openssl rand -base64 32
```

**Вариант 3: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Пример:
```
NEXTAUTH_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

⚠️ **Важно:** Длина должна быть минимум 32 символа!

---

## 4. GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET

### Шаги:

1. **Перейдите в Google Cloud Console:**
   - https://console.cloud.google.com/
   - Войдите с вашим Google аккаунтом

2. **Создайте проект:**
   - Нажмите на выпадающий список проектов вверху
   - Нажмите **"New Project"**
   - Введите имя: `namelonlar` (или любое)
   - Нажмите **"Create"**

3. **Включите Google+ API:**
   - В меню слева → **APIs & Services** → **Library**
   - Найдите **"Google+ API"** или **"Google Identity"**
   - Нажмите **"Enable"**

4. **Создайте OAuth 2.0 credentials:**
   - **APIs & Services** → **Credentials**
   - Нажмите **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - Если попросит настроить OAuth consent screen:
     - **User Type**: External
     - **App name**: Namangan Elonlar
     - **User support email**: ваш email
     - **Developer contact**: ваш email
     - Нажмите **"Save and Continue"** (можно пропустить остальные шаги)
   - **Application type**: Web application
   - **Name**: Namangan Elonlar Web
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:3000
     https://your-project.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-project.vercel.app/api/auth/callback/google
     ```
   - Нажмите **"Create"**

5. **Скопируйте credentials:**
   - Вы увидите **Client ID** → это `GOOGLE_CLIENT_ID`
   - Вы увидите **Client secret** → это `GOOGLE_CLIENT_SECRET`

### Пример:
```
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

## 5. CLOUDINARY переменные (для загрузки изображений)

### Шаги:

1. **Создайте аккаунт в Cloudinary:**
   - Перейдите на https://cloudinary.com
   - Нажмите **"Sign Up For Free"**
   - Зарегистрируйтесь (можно через Google/GitHub)

2. **Получите API credentials:**
   - После регистрации вы попадете в Dashboard
   - В правом верхнем углу нажмите на ваш email → **"Account Details"**
   - Или перейдите: https://console.cloudinary.com/settings/account
   - В секции **"Account Details"** вы найдете:
     - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
     - **API Key** → `CLOUDINARY_API_KEY`
     - **API Secret** → `CLOUDINARY_API_SECRET` (нажмите "Reveal" чтобы показать)

### Пример:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## 📝 Итоговый список переменных для Vercel

Скопируйте этот список и заполните значениями:

```
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-generated-secret-32-chars-minimum
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

---

## 🚀 Как добавить в Vercel

1. Перейдите в Vercel Dashboard → ваш проект
2. **Settings** → **Environment Variables**
3. Нажмите **"Add New"**
4. Введите **Key** (например, `DATABASE_URL`)
5. Введите **Value** (ваше значение)
6. Выберите **Environment**: Production, Preview, Development (или все)
7. Нажмите **"Save"**
8. Повторите для всех переменных

---

## ⚠️ Важные замечания

1. **DATABASE_URL**: Используйте Connection pooling версию из Supabase (порт 6543)
2. **NEXTAUTH_SECRET**: Должен быть минимум 32 символа, используйте безопасный генератор
3. **GOOGLE_CLIENT_ID**: Добавьте все ваши домены в Authorized redirect URIs
4. **CLOUDINARY_API_SECRET**: Держите в секрете, не коммитьте в Git!

---

## 🔒 Безопасность

- ✅ Никогда не коммитьте `.env` файлы в Git
- ✅ Используйте разные секреты для Production и Development
- ✅ Регулярно обновляйте пароли и секреты
- ✅ Используйте Vercel Environment Variables, а не `.env` файлы в продакшене

---

## ❓ Проблемы?

### DATABASE_URL не работает:
- Проверьте, что используете Connection pooling версию (порт 6543)
- Убедитесь, что заменили `[YOUR-PASSWORD]` на реальный пароль
- Проверьте, что проект в Supabase полностью создан

### Google OAuth не работает:
- Проверьте, что добавили правильные redirect URIs
- Убедитесь, что OAuth consent screen настроен
- Проверьте, что Google+ API включен

### Cloudinary не загружает изображения:
- Проверьте, что все три переменные добавлены
- Убедитесь, что API Secret скопирован полностью (может быть длинным)

