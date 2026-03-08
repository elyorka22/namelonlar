import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Settings, FileText, Heart, MessageCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  // Используем новую быструю проверку авторизации
  const currentUser = await getCurrentUser();
  
  if (!currentUser?.id) {
    console.log("[PROFILE] No user found, redirecting to signin");
    redirect("/auth/signin");
  }

  // Пробуем получить пользователя из Prisma, но если его нет - используем данные из Supabase
  let user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      listings: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      favorites: {
        take: 5,
        include: {
          listing: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          listings: true,
          favorites: true,
        },
      },
    },
  });

  // Если пользователя нет в Prisma, используем данные из Supabase
  // Синхронизация произойдет асинхронно через middleware или getCurrentUser
  if (!user) {
    // Создаем минимальный объект пользователя из данных Supabase
    user = {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      image: currentUser.image,
      listings: [],
      favorites: [],
      _count: {
        listings: 0,
        favorites: 0,
      },
    } as any;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={96}
                height={96}
                className="rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-3xl">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.name || "Пользователь"}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              {user.isBusiness && (
                <div className="mt-2">
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Biznes profil
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">
                {user._count.listings}
              </p>
              <p className="text-sm text-gray-600">E'lonlar</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">
                {user._count.favorites}
              </p>
              <p className="text-sm text-gray-600">Sevimlilar</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Xabarlar</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Ko'rishlar</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText size={24} />
                Mening e'lonlarim
              </h2>
              <Link
                href="/profile/listings"
                className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
              >
                Barchasi →
              </Link>
            </div>
            {user.listings.length > 0 ? (
              <div className="space-y-4">
                {user.listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {listing.status} • {listing.views} ko'rish
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Sizda hali e'lonlar yo'q</p>
                <Link
                  href="/listing/new"
                  className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  E'lon yaratish
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart size={24} />
                Sevimlilar
              </h2>
              <Link
                href="/profile/favorites"
                className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
              >
                Barchasi →
              </Link>
            </div>
            {user.favorites.length > 0 ? (
              <div className="space-y-4">
                {user.favorites.map((favorite) => (
                  <Link
                    key={favorite.id}
                    href={`/listing/${favorite.listing.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {favorite.listing.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {favorite.listing.views} ko'rish
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Sevimli e'lonlar yo'q</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/profile/settings"
            className="flex items-center gap-2 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all"
          >
            <Settings size={24} className="text-gray-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Sozlamalar</h3>
              <p className="text-sm text-gray-600">
                Profil va sozlamalarni boshqarish
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

