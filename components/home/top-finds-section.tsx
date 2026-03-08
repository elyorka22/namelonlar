"use client";

import Link from "next/link";
import Image from "next/image";
import { Listing } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface TopFindsSectionProps {
  listings: (Listing & {
    user: {
      id: string;
      name: string | null;
      image: string | null;
      isBusiness: boolean;
      businessName: string | null;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    };
  })[];
}

export function TopFindsSection({ listings }: TopFindsSectionProps) {
  if (listings.length === 0) {
    return null;
  }

  // Берем первые 4 объявления для горизонтального скролла
  const displayListings = listings.slice(0, 4);

  return (
    <section className="bg-primary-600 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg md:text-xl flex items-center gap-2">
            Top topilmalar
            <ChevronRight size={20} className="text-white/80" />
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {displayListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 w-[140px] md:w-[180px]"
            >
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 140px, 180px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-3xl">📦</span>
                  </div>
                )}
                {listing.isVip && (
                  <div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                    VIP
                  </div>
                )}
              </div>
              <div className="p-2 md:p-3">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-xs md:text-sm group-hover:text-primary-600 transition-colors">
                  {listing.title}
                </h3>
                {listing.price !== null && (
                  <p className="text-base md:text-lg font-bold text-primary-600">
                    {formatPrice(listing.price, listing.currency)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  );
}

