import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye } from "lucide-react";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { RemoveFavoriteButton } from "@/components/favorites/remove-favorite-button";

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  // Используем единую систему авторизации
  let currentUser;
  try {
    currentUser = await requireAuth();
  } catch (error) {
    redirect("/auth/signin");
  }

  // Получаем любимые объявления пользователя с обработкой ошибок
  let favorites: Array<{
    id: string;
    userId: string;
    listingId: string;
    createdAt: Date;
    listing: {
      id: string;
      title: string;
      description: string;
      price: number | null;
      currency: string;
      images: string[];
      views: number;
      status: string;
      isVip: boolean;
      isTop: boolean;
      createdAt: Date;
      category: {
        id: string;
        name: string;
      };
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
    };
  }> = [];
  try {
    favorites = await prisma.favorite.findMany({
      where: { userId: currentUser.id },
      include: {
        listing: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[PROFILE-FAVORITES] Error fetching favorites:", error);
    // Продолжаем с пустым массивом
    favorites = [];
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sevimlilar</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              Sizda hali sevimli e'lonlar yo'q
            </p>
            <Link
              href="/"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              E'lonlar bo'limiga o'tish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all"
              >
                <div className="flex gap-6">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {favorite.listing.images && favorite.listing.images.length > 0 ? (
                      <Image
                        src={favorite.listing.images[0]}
                        alt={favorite.listing.title}
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
                          href={`/listing/${favorite.listing.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {favorite.listing.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {favorite.listing.category.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {favorite.listing.isVip && (
                          <span className="bg-primary-500 text-white px-2 py-1 rounded text-xs font-bold">
                            VIP
                          </span>
                        )}
                        {favorite.listing.isTop && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                            TOP
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            favorite.listing.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : favorite.listing.status === "MODERATION"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {favorite.listing.status}
                        </span>
                      </div>
                    </div>
                    {favorite.listing.price !== null && (
                      <p className="text-2xl font-bold text-primary-600 mb-2">
                        {formatPrice(favorite.listing.price, favorite.listing.currency)}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye size={16} />
                        <span>{favorite.listing.views} ko'rish</span>
                      </div>
                      <span>{formatRelativeTime(favorite.listing.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/listing/${favorite.listing.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <span>Ko'rish</span>
                      </Link>
                      <RemoveFavoriteButton listingId={favorite.listing.id} />
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

