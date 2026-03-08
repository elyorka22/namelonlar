import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check, X, Eye } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export async function AdminListings() {
  let listings: Awaited<ReturnType<typeof prisma.listing.findMany<{
    where: { status: "MODERATION" };
    include: { user: { select: { name: true; email: true } }; category: true };
    orderBy: { createdAt: "desc" };
    take: 10;
  }>>> = [];
  try {
    listings = await prisma.listing.findMany({
    where: {
      status: "MODERATION",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
  } catch (err) {
    console.error("[AdminListings]", err);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Moderatsiyadagi e'lonlar
      </h2>
      {listings.length === 0 ? (
        <p className="text-gray-500">Moderatsiyada e'lonlar yo'q</p>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <Link
                  href={`/listing/${listing.id}`}
                  className="font-semibold text-gray-900 hover:text-primary-600"
                >
                  {listing.title}
                </Link>
                <div className="flex gap-2">
                  <form action={`/api/admin/listings/${listing.id}/approve`}>
                    <button
                      type="submit"
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                  </form>
                  <form action={`/api/admin/listings/${listing.id}/reject`}>
                    <button
                      type="submit"
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {listing.user.name || listing.user.email} • {listing.category.name}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{formatRelativeTime(listing.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>{listing.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

