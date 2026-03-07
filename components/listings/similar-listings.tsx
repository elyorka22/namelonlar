import { ListingGrid } from "./listing-grid";
import { Listing } from "@prisma/client";

interface SimilarListingsProps {
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

export function SimilarListings({ listings }: SimilarListingsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        O'xshash e'lonlar
      </h2>
      <ListingGrid listings={listings} />
    </div>
  );
}

