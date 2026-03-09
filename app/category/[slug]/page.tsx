import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories } from "@/lib/data/categories";
import { getListings } from "@/lib/data/listings";
import { ListingGrid } from "@/components/listings/listing-grid";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  const page = Number(searchParams.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const listings = await getListings({
    categoryId: category.id,
    limit,
    offset,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-600 mb-8">{category.description}</p>
        )}

        {category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pastki kategoriyalar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(category.children as { id: string; slug: string; name: string }[]).map((child) => (
                <a
                  key={child.id}
                  href={`/category/${child.slug}`}
                  className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow text-center"
                >
                  {child.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <ListingGrid listings={listings} />

        {listings.length === limit && (
          <div className="mt-8 text-center">
            <a
              href={`/category/${params.slug}?page=${page + 1}`}
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ko'proq ko'rsatish
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

