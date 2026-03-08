import { Suspense } from "react";
import { CompactSearchBar } from "@/components/home/compact-search-bar";
import { CategoryGridCompact } from "@/components/home/category-grid-compact";
import { TopFindsSection } from "@/components/home/top-finds-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { ListingGrid } from "@/components/listings/listing-grid";
import { getCategories } from "@/lib/data/categories";
import { getFeaturedListings, getNewListings } from "@/lib/data/listings";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, featuredListings, newListings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
    getNewListings(12),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Search Bar */}
      <Suspense fallback={<div className="h-16 bg-primary-600" />}>
        <CompactSearchBar />
      </Suspense>

      {/* Top Finds Section */}
      {featuredListings.length > 0 && (
        <TopFindsSection listings={featuredListings} />
      )}

      {/* Categories Grid */}
      <section className="py-4 md:py-6 bg-white">
        <div className="container mx-auto px-4">
          <CategoryGridCompact categories={categories} />
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-4 md:py-6 bg-white">
        <div className="container mx-auto px-4">
          <PromoBanner />
        </div>
      </section>

      {/* New Listings */}
      <section className="py-6 md:py-8 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
            Yangi e'lonlar
          </h2>
          <ListingGrid listings={newListings} />
        </div>
      </section>
    </div>
  );
}

