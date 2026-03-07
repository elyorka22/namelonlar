# Namangan Elonlar - E'lonlar Platformasi

To'liq funksional e'lonlar platformasi, OLX / Avito / Facebook Marketplace darajasida.

## 🚀 Tez boshlash

### Mahalliy ishga tushirish

1. **Dependencies o'rnatish:**
```bash
npm install
```

2. **Environment variables sozlash:**
```bash
cp .env.example .env
```

`.env` faylini to'ldiring:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

3. **Bazani sozlash:**
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. **Loyihani ishga tushirish:**
```bash
npm run dev
```

Loyiha [http://localhost:3000](http://localhost:3000) da ochiladi.

## 📦 Dasturlash

### Texnologiyalar

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js (Email, Google)
- **Image Upload:** Cloudinary
- **Icons:** Lucide React

### Asosiy funksiyalar

✅ Bosh sahifa qidiruv va kategoriyalar bilan  
✅ E'lonlar tizimi  
✅ E'lon sahifasi galereya bilan  
✅ E'lon joylashtirish bir necha rasmlar bilan  
✅ Foydalanuvchi profili  
✅ Sevimlilar tizimi  
✅ Chat foydalanuvchilar orasida  
✅ Admin panel moderatsiya uchun  
✅ Pullik funksiyalar (VIP, TOP, ko'tarish)  
✅ Qidiruv va filtrlash  
✅ SEO optimizatsiya  

## 🌐 Deploy

### Vercel + Supabase

1. **Supabase loyiha yaratish:**
   - [supabase.com](https://supabase.com) ga kiring
   - Yangi loyiha yarating
   - Connection string oling

2. **Vercel ga deploy:**
   - [vercel.com](https://vercel.com) ga kiring
   - GitHub repozitoriyani ulang
   - Environment variables qo'shing (yuqoridagi `.env` dagi barcha o'zgaruvchilar)

3. **Migratsiyalarni ishga tushirish:**
```bash
vercel env pull
npx prisma migrate deploy
npm run db:seed
```

Batafsil ma'lumot: [DEPLOYMENT-SUPABASE.md](./DEPLOYMENT-SUPABASE.md)

## 📁 Loyiha strukturası

```
├── app/                    # Next.js sahifalar va API routes
│   ├── api/               # API endpoints
│   ├── admin/             # Admin panel
│   ├── auth/              # Autentifikatsiya
│   ├── listing/           # E'lonlar
│   └── profile/           # Profil
├── components/            # React komponentlar
├── lib/                   # Utility funksiyalar
│   ├── data/             # Ma'lumotlar bilan ishlash
│   └── prisma.ts         # Prisma client
├── prisma/                # Prisma schema va migratsiyalar
└── types/                 # TypeScript tiplar
```

## 🔧 Foydali buyruqlar

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
npm run db:generate  # Prisma Client generate
npm run db:push      # Schema ni bazaga qo'llash
npm run db:migrate   # Migratsiya yaratish
npm run db:seed      # Boshlang'ich ma'lumotlar
npm run db:studio    # Prisma Studio ochish
```

## 📝 License

MIT
