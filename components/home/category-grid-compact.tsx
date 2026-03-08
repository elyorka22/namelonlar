"use client";

import Link from "next/link";
import { Category } from "@prisma/client";

interface CategoryGridCompactProps {
  categories: (Category & { children: Category[] })[];
}

const categoryIcons: Record<string, string> = {
  nedvizhimost: "🏠",
  avtomobili: "🚗",
  elektronika: "📱",
  rabota: "💼",
  uslugi: "🔧",
  arenda: "🏢",
  optom: "📦",
  dom: "🏡",
  zhivotnye: "🐕",
  hobbi: "🎮",
  transport: "🚲",
};

// Default categories to always show
const defaultCategories = [
  { id: "1", name: "Ko'chmas mulk", slug: "nedvizhimost" },
  { id: "2", name: "Avtomobillar", slug: "avtomobili" },
  { id: "3", name: "Elektronika", slug: "elektronika" },
  { id: "4", name: "Ish", slug: "rabota" },
  { id: "5", name: "Xizmatlar", slug: "uslugi" },
  { id: "6", name: "Ijaraga olish", slug: "arenda" },
  { id: "7", name: "Optom", slug: "optom" },
];

export function CategoryGridCompact({ categories }: CategoryGridCompactProps) {
  // Always use categories from props if available, otherwise use default categories
  const displayCategories = categories.length > 0 
    ? categories.slice(0, 8) 
    : defaultCategories.slice(0, 8);

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3">
      {displayCategories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group flex flex-col items-center justify-center bg-white rounded-xl p-3 md:p-4 hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-primary-300 hover:shadow-sm"
        >
          <div className="text-3xl md:text-4xl mb-2 text-center">
            {categoryIcons[category.slug] || "📦"}
          </div>
          <h3 className="text-center font-medium text-xs md:text-sm text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {category.name}
          </h3>
        </Link>
      ))}
    </div>
  );
}

