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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/listing/${listing.id}`}
          className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-primary-300"
        >
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-3xl">📦</span>
              </div>
            )}
            {listing.isVip && (
              <div className="absolute top-1.5 left-1.5 bg-primary-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                VIP
              </div>
            )}
            {listing.isTop && (
              <div className="absolute top-1.5 right-1.5 bg-yellow-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                TOP
              </div>
            )}
          </div>
          <div className="p-2 md:p-3">
            <h3 className="font-medium text-gray-900 mb-1.5 line-clamp-2 text-sm md:text-base group-hover:text-primary-600 transition-colors">
              {listing.title}
            </h3>
            {listing.price !== null && (
              <p className="text-lg md:text-xl font-bold text-primary-600 mb-1.5">
                {formatPrice(listing.price, listing.currency)}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {listing.location && (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <MapPin size={12} className="flex-shrink-0" />
                  <span className="truncate">{listing.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Eye size={12} />
                <span>{listing.views}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

