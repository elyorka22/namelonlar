import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(request: NextRequest) {
  const apiKey = (process.env.DEEPSEEK_API_KEY ?? "").trim();
  if (!apiKey || apiKey.length < 10) {
    return NextResponse.json(
      {
        error:
          "DeepSeek API kaliti sozlanmagan. Lokal: .env.local da DEEPSEEK_API_KEY=sk-... qo'shing va serverni qayta ishga tushiring. Vercel: Loyiha sozlamalari → Environment Variables da DEEPSEEK_API_KEY qo'shing.",
      },
      { status: 503 }
    );
  }

  let body: { description?: string; categories?: { id: string; name: string; slug: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  const categories = Array.isArray(body.categories) ? body.categories : [];
  if (!description) {
    return NextResponse.json({ error: "Matn bo'sh" }, { status: 400 });
  }

  const categoryList = categories
    .map((c) => `${c.name} (id: ${c.id}, slug: ${c.slug})`)
    .join("\n");

  const systemPrompt = `Siz e'lonlar sayti uchun ma'lumotlarni to'ldiradigan yordamchisiz. Foydalanuvchi nima sotmoqchi yoki xizmat ko'rsatmoqchi ekanini yozadi. Siz faqat quyidagi JSON formatida javob qaytarasiz, boshqa matn yozmang:
{"title": "qisqa sarlavha (5-100 belgi)", "description": "batafsil tavsif (20-500 belgi)", "price": son yoki null, "categorySlug": "berilgan kategoriyalardan biri slug", "city": "shahar yoki bo'sh", "location": "manzil yoki bo'sh"}
Qoida: categorySlug faqat berilgan kategoriyalar ro'yxatidagi slug lardan biri bo'lishi kerak. Narx so'mda (UZS). Agar narx aniq bo'lmasa null qoldiring.`;

  const userPrompt = `Kategoriyalar (slug dan birini tanlang):\n${categoryList}\n\nFoydalanuvchi yozgani: ${description}`;

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[generate-with-ai] DeepSeek error:", res.status, errText);
      return NextResponse.json(
        { error: "AI xizmati javob bermadi. Keyinroq urinib ko'ring." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "AI dan noto'g'ri javob" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(content) as {
      title?: string;
      description?: string;
      price?: number | null;
      categorySlug?: string;
      city?: string;
      location?: string;
    };

    const categorySlug =
      typeof parsed.categorySlug === "string" ? parsed.categorySlug.trim() : "";
    const found = categories.find(
      (c) => c.slug === categorySlug || c.name === categorySlug
    );
    const categoryId = found ? found.id : categories[0]?.id ?? "";

    return NextResponse.json({
      title: typeof parsed.title === "string" ? parsed.title.slice(0, 200) : "",
      description:
        typeof parsed.description === "string"
          ? parsed.description.slice(0, 5000)
          : "",
      price:
        typeof parsed.price === "number" && parsed.price >= 0
          ? parsed.price
          : null,
      categoryId,
      city: typeof parsed.city === "string" ? parsed.city.slice(0, 100) : "",
      location:
        typeof parsed.location === "string" ? parsed.location.slice(0, 200) : "",
    });
  } catch (e) {
    console.error("[generate-with-ai]", e);
    return NextResponse.json(
      { error: "Xatolik yuz berdi. Keyinroq urinib ko'ring." },
      { status: 500 }
    );
  }
}
