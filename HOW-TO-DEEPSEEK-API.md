# AI bilan e'lon to'ldirish (DeepSeek)

"Yordamchi AI bilan" tugmasi ishlashi uchun DeepSeek API kaliti kerak.

## Sozlash

1. [DeepSeek Platform](https://platform.deepseek.com/) da hisob oching va API kalit oling.
2. Loyiha ildizida `.env.local` faylida o'zgaruvchi qo'shing:

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

3. Dev serverni qayta ishga tushiring (`npm run dev`).

Agar `DEEPSEEK_API_KEY` bo'lmasa, "To'ldirish" tugmasi 503 xatosini beradi va foydalanuvchiga xabar chiqadi.
