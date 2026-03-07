import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";

export async function AdminUsers() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          listings: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        So'nggi foydalanuvchilar
      </h2>
      {users.length === 0 ? (
        <p className="text-gray-500">Foydalanuvchilar yo'q</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {user.name || "Ismsiz"}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-red-100 text-red-700"
                      : user.role === "MODERATOR"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                <span>{user._count.listings} e'lon</span>
                <span>{formatRelativeTime(user.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

