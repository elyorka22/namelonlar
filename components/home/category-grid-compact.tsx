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
  zapchasti: "🔩",
  odezhda: "👕",
  dom: "🏡",
  zhivotnye: "🐕",
  hobbi: "🎮",
  transport: "🚲",
};

export function CategoryGridCompact({ categories }: CategoryGridCompactProps) {
  if (categories.length === 0) {
    return null;
  }

  // Берем первые 8 категорий для компактной сетки
  const displayCategories = categories.slice(0, 8);

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

