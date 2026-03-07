import { prisma } from "@/lib/prisma";

export async function getCategories() {
  try {
    if (!process.env.DATABASE_URL) {
      // Mock data for demo
      return [
        {
          id: "1",
          name: "Ko'chmas mulk",
          slug: "nedvizhimost",
          description: "Kvartiralar, uylar, uchastkalar",
          icon: null,
          parentId: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "Avtomobillar",
          slug: "avtomobili",
          description: "Yengil, yuk mashinalari, mototsikllar",
          icon: null,
          parentId: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "3",
          name: "Elektronika",
          slug: "elektronika",
          description: "Telefonlar, kompyuterlar, texnika",
          icon: null,
          parentId: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "4",
          name: "Ish",
          slug: "rabota",
          description: "Vakansiyalar va rezyume",
          icon: null,
          parentId: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "5",
          name: "Xizmatlar",
          slug: "uslugi",
          description: "Turli xil xizmatlar",
          icon: null,
          parentId: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "6",
          name: "Ijaraga olish",
          slug: "arenda",
          description: "Kvartira va transport ijarasi",
          icon: null,
          parentId: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          take: 8,
        },
      },
      take: 12,
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Return mock data on error
    return [
      {
        id: "1",
        name: "Ko'chmas mulk",
        slug: "nedvizhimost",
        description: "Kvartiralar, uylar, uchastkalar",
        icon: null,
        parentId: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Avtomobillar",
        slug: "avtomobili",
        description: "Yengil, yuk mashinalari, mototsikllar",
        icon: null,
        parentId: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        name: "Elektronika",
        slug: "elektronika",
        description: "Telefonlar, kompyuterlar, texnika",
        icon: null,
        parentId: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4",
        name: "Ish",
        slug: "rabota",
        description: "Vakansiyalar va rezyume",
        icon: null,
        parentId: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "5",
        name: "Xizmatlar",
        slug: "uslugi",
        description: "Turli xil xizmatlar",
        icon: null,
        parentId: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "6",
        name: "Ijaraga olish",
        slug: "arenda",
        description: "Kvartira va transport ijarasi",
        icon: null,
        parentId: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
      },
    });
    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

