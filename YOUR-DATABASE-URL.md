# ✅ Ваш правильный DATABASE_URL

## Для региона: Southeast Asia (Singapore)

### ✅ ГОТОВЫЙ URL (скопируйте и используйте):

```
postgresql://postgres.ohzuxcilqyanybqqmitw:C0ihENxh3kcJZSWI@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Этот URL уже содержит ваш пароль - просто скопируйте и вставьте в Vercel!**

## 🔐 Если пароль содержит специальные символы

Если ваш пароль содержит специальные символы, замените их на URL-encoded версию:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- `:` → `%3A`

**Пример:**
Если пароль `P@ssw0rd#123`, то используйте:
```
postgresql://postgres.ohzuxcilqyanybqqmitw:P%40ssw0rd%23123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 📝 Как добавить в Vercel:

1. Откройте Vercel Dashboard
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Найдите `DATABASE_URL` или создайте новую переменную
5. Вставьте правильный URL (с вашим паролем)
6. Нажмите **Save**
7. Перезапустите деплой (Redeploy)

## ✅ Проверка:

После обновления:
- ✅ Сайт должен загружаться без ошибок
- ✅ В логах не должно быть "Can't reach database server"
- ✅ Страницы должны отображать данные из базы

---

**Готово!** После добавления этого URL в Vercel, ваш сайт должен заработать.

