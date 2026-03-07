import { getCategories } from "@/lib/data/categories";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories();

  const categoryIcons: Record<string, string> = {
    nedvizhimost: "🏠",
    avtomobili: "🚗",
    elektronika: "📱",
    rabota: "💼",
    uslugi: "🔧",
    arenda: "🏢",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Barcha kategoriyalar
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-primary-200 text-center"
            >
              <div className="text-4xl mb-3">
                {categoryIcons[category.slug] || "📦"}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                {category.name}
              </h3>
              {category.children.length > 0 && (
                <p className="text-xs text-gray-500">
                  {category.children.length} pastki kategoriya
                </p>
              )}
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Kategoriyalar hali mavjud emas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

