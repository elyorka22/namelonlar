import Link from "next/link";
import Image from "next/image";
import { Listing } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { MapPin, Eye } from "lucide-react";

interface ListingGridProps {
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

export function ListingGrid({ listings }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">E'lonlar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/listing/${listing.id}`}
          className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 border border-gray-100"
        >
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-4xl">📦</span>
              </div>
            )}
            {listing.isVip && (
              <div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded text-xs font-bold">
                VIP
              </div>
            )}
            {listing.isTop && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                TOP
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {listing.title}
            </h3>
            {listing.price !== null && (
              <p className="text-2xl font-bold text-primary-600 mb-2">
                {formatPrice(listing.price, listing.currency)}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {listing.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span className="truncate">{listing.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{listing.views}</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                {listing.category.name}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

