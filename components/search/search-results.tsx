import { getListings } from "@/lib/data/listings";
import { ListingGrid } from "@/components/listings/listing-grid";

interface SearchResultsProps {
  searchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    city?: string;
  };
}

export async function SearchResults({ searchParams }: SearchResultsProps) {
  const listings = await getListings({
    search: searchParams.q,
    categoryId: searchParams.category,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    city: searchParams.city,
    limit: 20,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {searchParams.q
            ? `Qidiruv natijalari: "${searchParams.q}"`
            : "Barcha e'lonlar"}
        </h1>
        <p className="text-gray-600">
          Topilgan e'lonlar: {listings.length}
        </p>
      </div>
      <ListingGrid listings={listings} />
    </div>
  );
}

