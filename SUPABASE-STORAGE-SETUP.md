# 📦 Настройка Supabase Storage для загрузки изображений

## Шаг 1: Создайте Storage Bucket в Supabase

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в **Storage** (в левом меню)
3. Нажмите **"Create a new bucket"**
4. Настройки:
   - **Name**: `images`
   - **Public bucket**: ✅ Включите (чтобы изображения были доступны публично)
   - Нажмите **"Create bucket"**

## Шаг 2: Настройте политики доступа (Policies)

1. В Storage → **images** bucket → **Policies**
2. Нажмите **"New Policy"**
3. Выберите **"For full customization"**
4. Название: `Allow authenticated uploads`
5. SQL:

```sql
-- Политика для загрузки (INSERT)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Политика для чтения (SELECT) - публичный доступ
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');
```

Или используйте упрощенный вариант через UI:
- **Policy name**: `Public Access`
- **Allowed operation**: SELECT
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'images'`

## Шаг 3: Получите необходимые ключи

1. В Supabase Dashboard → **Settings** → **API**
2. Найдите:
   - **Project URL** → это `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (секретный ключ) → это `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **НЕ используйте `anon` key** - нужен именно `service_role` для серверных операций

## Шаг 4: Добавьте переменные окружения в Vercel

В Vercel Dashboard → Settings → Environment Variables добавьте:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Важно:** 
- `NEXT_PUBLIC_SUPABASE_URL` должен начинаться с `NEXT_PUBLIC_` чтобы быть доступным на клиенте
- `SUPABASE_SERVICE_ROLE_KEY` - секретный ключ, НЕ публикуйте его

## Шаг 5: Установите зависимости

```bash
npm install @supabase/supabase-js uuid
npm install --save-dev @types/uuid
```

## Шаг 6: Проверьте работу

После деплоя попробуйте загрузить изображение при создании объявления. Если все настроено правильно, изображение должно загрузиться и отобразиться.

---

## 🔒 Безопасность

- ✅ Используйте `service_role` key только на сервере (в Server Actions)
- ✅ Не публикуйте `SUPABASE_SERVICE_ROLE_KEY` в клиентский код
- ✅ Настройте политики доступа правильно
- ✅ Ограничьте размер файлов (уже настроено: макс 5MB)

---

## ❓ Проблемы?

### Ошибка "Missing NEXT_PUBLIC_SUPABASE_URL"
- Проверьте, что переменная добавлена в Vercel
- Убедитесь, что имя начинается с `NEXT_PUBLIC_`

### Ошибка "Upload failed"
- Проверьте, что bucket `images` создан
- Проверьте политики доступа
- Проверьте, что `SUPABASE_SERVICE_ROLE_KEY` правильный

### Изображения не отображаются
- Проверьте, что bucket публичный
- Проверьте политику SELECT для public
- Проверьте `next.config.js` - должен быть hostname `**.supabase.co`

