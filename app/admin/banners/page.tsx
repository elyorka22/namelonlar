import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { CreateBannerForm } from "@/components/admin/create-banner-form";

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bannerlar boshqaruvi</h1>
        <CreateBannerForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="relative h-48 bg-gray-100">
              {banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
              )}
              {!banner.isActive && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">Nofaol</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{banner.title}</h3>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p>Pozitsiya: {banner.position}</p>
                <p>Bosqichlar: {banner.clicks}</p>
                <p>
                  Holat:{" "}
                  <span
                    className={`font-semibold ${
                      banner.isActive ? "text-green-600" : "text-red-800"
                    }`}
                  >
                    {banner.isActive ? "Faol" : "Nofaol"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex-1 p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  title="Tahrirlash"
                >
                  <Edit size={16} />
                  <span>Tahrirlash</span>
                </button>
                <button
                  className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                  title="O'chirish"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">Hozircha bannerlar yo'q</p>
          <CreateBannerForm />
        </div>
      )}
    </div>
  );
}

