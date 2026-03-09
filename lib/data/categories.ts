import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Ko'chmas mulk", slug: "nedvizhimost", description: "Kvartiralar, uylar, uchastkalar" },
  { name: "Avtomobillar", slug: "avtomobili", description: "Yengil, yuk mashinalari, mototsikllar" },
  { name: "Elektronika", slug: "elektronika", description: "Telefonlar, kompyuterlar, texnika" },
  { name: "Ish", slug: "rabota", description: "Vakansiyalar va rezyume" },
  { name: "Xizmatlar", slug: "uslugi", description: "Turli xil xizmatlar" },
  { name: "Ijaraga olish", slug: "arenda", description: "Kvartira va transport ijarasi" },
];

function mockCategories() {
  return DEFAULT_CATEGORIES.map((c, i) => ({
    id: String(i + 1),
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: null,
    parentId: null,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function getCategories() {
  try {
    if (!process.env.DATABASE_URL) {
      return mockCategories();
    }
    let categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: { take: 8 } },
      take: 12,
    });
    if (categories.length === 0) {
      for (const c of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
          where: { slug: c.slug },
          create: { name: c.name, slug: c.slug, description: c.description },
          update: {},
        });
      }
      categories = await prisma.category.findMany({
        where: { parentId: null },
        include: { children: { take: 8 } },
        take: 12,
      });
    }
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return mockCategories();
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    if (!process.env.DATABASE_URL) {
      const fallback = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
      if (!fallback) return null;
      return {
        id: slug,
        name: fallback.name,
        slug: fallback.slug,
        description: fallback.description,
        icon: null,
        parentId: null,
        parent: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }
    let category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
      },
    });
    if (!category) {
      const def = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
      if (def) {
        await prisma.category.upsert({
          where: { slug: def.slug },
          create: { name: def.name, slug: def.slug, description: def.description },
          update: {},
        });
        category = await prisma.category.findUnique({
          where: { slug },
          include: { children: true, parent: true },
        });
      }
    }
    return category ?? null;
  } catch (error) {
    console.error("Error fetching category:", error);
    const fallback = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
    if (!fallback) return null;
    return {
      id: slug,
      name: fallback.name,
      slug: fallback.slug,
      description: fallback.description,
      icon: null,
      parentId: null,
      parent: null,
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }
}

