import { prisma } from "@/lib/prisma";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminListings } from "@/components/admin/admin-listings";
import { AdminUsers } from "@/components/admin/admin-users";
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity";

export const dynamic = "force-dynamic";

const defaultStats = [0, 0, 0, 0, 0, 0] as const;

export default async function AdminPage() {
  let stats = defaultStats;
  try {
    stats = await prisma.$transaction([
      prisma.listing.count(),
      prisma.user.count(),
      prisma.listing.count({ where: { status: "MODERATION" } }),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.category.count(),
      prisma.listing.count({ where: { isVip: true } }),
    ]);
  } catch (err) {
    console.error("[admin/page] Stats error:", err);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Boshqaruv paneli
      </h1>

      <AdminStats
        totalListings={stats[0]}
        totalUsers={stats[1]}
        pendingModeration={stats[2]}
        activeListings={stats[3]}
        totalCategories={stats[4]}
        vipListings={stats[5]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AdminListings />
        <AdminUsers />
      </div>

      <div className="mt-6">
        <AdminRecentActivity />
      </div>
    </div>
  );
}

