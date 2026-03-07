import { Suspense } from "react";
import { SearchBar } from "@/components/home/search-bar";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { ListingGrid } from "@/components/listings/listing-grid";
import { BannerSection } from "@/components/home/banner-section";
import { getCategories } from "@/lib/data/categories";
import { getFeaturedListings, getNewListings } from "@/lib/data/listings";

export default async function HomePage() {
  const [categories, featuredListings, newListings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
    getNewListings(12),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-600 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Namangan Elonlar
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Sotib oling, soting, xizmatlarni toping
            </p>
            <Suspense fallback={<div className="h-16" />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Kategoriyalar</h2>
          <CategoryCarousel categories={categories} />
        </div>
      </section>

      {/* VIP/Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              VIP E'lonlar
            </h2>
            <ListingGrid listings={featuredListings} />
          </div>
        </section>
      )}

      {/* Banners */}
      <BannerSection position="homepage" />

      {/* New Listings */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Yangi e'lonlar
          </h2>
          <ListingGrid listings={newListings} />
        </div>
      </section>
    </div>
  );
}

