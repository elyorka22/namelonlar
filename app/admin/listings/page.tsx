import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Eye, Check, X, Trash2, Search } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { ListingStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const status = searchParams.status as ListingStatus | undefined;
  const search = searchParams.search;

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
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
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">E'lonlar boshqaruvi</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <form method="get" className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Qidirish..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/listings"
              className={`px-4 py-2 rounded-lg transition-colors ${
                !status
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Barchasi
            </Link>
            <Link
              href="/admin/listings?status=MODERATION"
              className={`px-4 py-2 rounded-lg transition-colors ${
                status === "MODERATION"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Moderatsiya
            </Link>
            <Link
              href="/admin/listings?status=ACTIVE"
              className={`px-4 py-2 rounded-lg transition-colors ${
                status === "ACTIVE"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Faol
            </Link>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E'lon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Foydalanuvchi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategoriya
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ko'rishlar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harakatlar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/listing/${listing.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(listing.createdAt)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {listing.user.name || listing.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {listing.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      {listing.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {listing.status === "MODERATION" && (
                        <>
                          <form action={`/api/admin/listings/${listing.id}/approve`}>
                            <button
                              type="submit"
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              title="Tasdiqlash"
                            >
                              <Check size={16} />
                            </button>
                          </form>
                          <form action={`/api/admin/listings/${listing.id}/reject`}>
                            <button
                              type="submit"
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Rad etish"
                            >
                              <X size={16} />
                            </button>
                          </form>
                        </>
                      )}
                      <Link
                        href={`/listing/${listing.id}`}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Ko'rish"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

