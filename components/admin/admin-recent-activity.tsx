import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";
import { FileText, User, FolderTree } from "lucide-react";

export async function AdminRecentActivity() {
  type ListingWithUser = Awaited<ReturnType<typeof prisma.listing.findMany<{
    take: 5;
    orderBy: { createdAt: "desc" };
    include: { user: { select: { name: true; email: true } } };
  }>>>;
  let recentListings: ListingWithUser = [];
  let recentUsers: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  let recentCategories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  try {
    const [listings, users, categories] = await Promise.all([
    prisma.listing.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);
    recentListings = listings;
    recentUsers = users;
    recentCategories = categories;
  } catch (err) {
    console.error("[AdminRecentActivity]", err);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        So'nggi faoliyat
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileText size={18} />
            Yangi e'lonlar
          </h3>
          <div className="space-y-2">
            {recentListings.map((listing) => (
              <div
                key={listing.id}
                className="text-sm text-gray-600 border-l-2 border-primary-500 pl-3"
              >
                <p className="font-medium text-gray-900">{listing.title}</p>
                <p className="text-xs text-gray-500">
                  {listing.user.name || listing.user.email} •{" "}
                  {formatRelativeTime(listing.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <User size={18} />
            Yangi foydalanuvchilar
          </h3>
          <div className="space-y-2">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="text-sm text-gray-600 border-l-2 border-blue-500 pl-3"
              >
                <p className="font-medium text-gray-900">
                  {user.name || "Foydalanuvchi"}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email} • {formatRelativeTime(user.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FolderTree size={18} />
            Yangi kategoriyalar
          </h3>
          <div className="space-y-2">
            {recentCategories.map((category) => (
              <div
                key={category.id}
                className="text-sm text-gray-600 border-l-2 border-purple-500 pl-3"
              >
                <p className="font-medium text-gray-900">{category.name}</p>
                <p className="text-xs text-gray-500">
                  {formatRelativeTime(category.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

