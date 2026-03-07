import Link from "next/link";
import { Category } from "@prisma/client";

interface CategoryGridProps {
  categories: (Category & { children: Category[] })[];
}

const categoryIcons: Record<string, string> = {
  nedvizhimost: "🏠",
  avtomobili: "🚗",
  elektronika: "📱",
  rabota: "💼",
  uslugi: "🔧",
  arenda: "🏢",
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-primary-200"
        >
          <div className="text-4xl mb-3 text-center">
            {categoryIcons[category.slug] || "📦"}
          </div>
          <h3 className="text-center font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {category.name}
          </h3>
          {category.children.length > 0 && (
            <p className="text-xs text-gray-500 text-center mt-1">
              {category.children.length} подкатегорий
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}

