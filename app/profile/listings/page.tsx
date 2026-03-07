import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

export default async function MyListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const listings = await prisma.listing.findMany({
    where: { userId: session.user.id },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mening e'lonlarim</h1>
          <Link
            href="/listing/new"
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>Yangi e'lon</span>
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              Sizda hali e'lonlar yo'q
            </p>
            <Link
              href="/listing/new"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Birinchi e'lonni yaratish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all"
              >
                <div className="flex gap-6">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          href={`/listing/${listing.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {listing.category.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {listing.isVip && (
                          <span className="bg-primary-500 text-white px-2 py-1 rounded text-xs font-bold">
                            VIP
                          </span>
                        )}
                        {listing.isTop && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                            TOP
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            listing.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : listing.status === "MODERATION"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {listing.status}
                        </span>
                      </div>
                    </div>
                    {listing.price !== null && (
                      <p className="text-2xl font-bold text-primary-600 mb-2">
                        {formatPrice(listing.price, listing.currency)}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye size={16} />
                        <span>{listing.views} ko'rish</span>
                      </div>
                      <span>{formatRelativeTime(listing.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/listing/${listing.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Edit size={16} />
                        <span>Tahrirlash</span>
                      </Link>
                      <button className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                        <span>O'chirish</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

