# AI bilan e'lon to'ldirish (DeepSeek)

"Yordamchi AI bilan" tugmasi ishlashi uchun DeepSeek API kaliti kerak.

## Lokal (kompyuterdagi loyiha)

1. [DeepSeek Platform](https://platform.deepseek.com/) da hisob oching va API kalit oling.
2. Loyiha ildizida `.env.local` fayl yarating (yoki mavjud faylga qo'shing):

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

3. Kalitdan keyin bo'sh joy yoki yangi qator qoldirmang. Faylni saqlang.
4. Dev serverni qayta ishga tushiring: terminalda `Ctrl+C`, keyin `npm run dev`.

## Vercel (sayt onlaynda)

1. [Vercel Dashboard](https://vercel.com) → loyihangizni tanlang.
2. **Settings** → **Environment Variables**.
3. **Name:** `DEEPSEEK_API_KEY`, **Value:** `sk-xxxxxxxxxxxxxxxx` (kalitingiz).
4. **Save** va loyihani qayta deploy qiling (Deployments → ... → Redeploy).

Agar kalit sozlanmasa, "To'ldirish" tugmasi xato ko'rsatadi.
