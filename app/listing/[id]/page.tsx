import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getListingById, getSimilarListings } from "@/lib/data/listings";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { MapPin, Eye, Share2, Heart, MessageCircle, Phone, Mail } from "lucide-react";
import { ListingActions } from "@/components/listings/listing-actions";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { SimilarListings } from "@/components/listings/similar-listings";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ListingPage({ params }: PageProps) {
  const listing = await getListingById(params.id);

  if (!listing) {
    notFound();
  }

  const similarListings = await getSimilarListings(
    listing.id,
    listing.categoryId
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Breadcrumbs */}
            <nav className="text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-primary-600">
                Bosh sahifa
              </Link>
              {" / "}
              <Link
                href={`/category/${listing.category.slug}`}
                className="hover:text-primary-600"
              >
                {listing.category.name}
              </Link>
              {" / "}
              <span className="text-gray-900">{listing.title}</span>
            </nav>

            {/* Gallery */}
            <ListingGallery images={listing.images} title={listing.title} />

            {/* Title and Price */}
            <div className="bg-white rounded-xl p-6 mt-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>
                  {listing.price !== null && (
                    <p className="text-4xl font-bold text-primary-600">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                  )}
                </div>
                <ListingActions listingId={listing.id} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
                {listing.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{listing.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span>{listing.views} ko'rish</span>
                </div>
                <span>{formatRelativeTime(listing.createdAt)}</span>
                {(listing.isVip || listing.isTop) && (
                  <div className="flex gap-2">
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
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 mt-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tavsif
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Similar Listings */}
            {similarListings.length > 0 && (
              <div className="mt-8">
                <SimilarListings listings={similarListings} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Sotuvchi
              </h3>
              <div className="flex items-center gap-4 mb-6">
                {listing.user.image ? (
                  <Image
                    src={listing.user.image}
                    alt={listing.user.name || "User"}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
                    {listing.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {listing.user.businessName ||
                      listing.user.name ||
                      "Пользователь"}
                  </p>
                  {listing.user.isBusiness && (
                    <p className="text-sm text-gray-500">Бизнес профиль</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {listing.contactPhone && (
                  <a
                    href={`tel:${listing.contactPhone}`}
                    className="flex items-center gap-3 w-full bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors justify-center"
                  >
                    <Phone size={20} />
                    <span>Qo'ng'iroq qilish</span>
                  </a>
                )}
                {listing.contactTelegram && (
                  <a
                    href={`https://t.me/${listing.contactTelegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors justify-center"
                  >
                    <MessageCircle size={20} />
                    <span>Telegram orqali yozish</span>
                  </a>
                )}
                {listing.contactEmail && (
                  <a
                    href={`mailto:${listing.contactEmail}`}
                    className="flex items-center gap-3 w-full bg-gray-100 text-gray-900 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors justify-center"
                  >
                    <Mail size={20} />
                    <span>Email orqali yozish</span>
                  </a>
                )}
                <Link
                  href={`/chat?user=${listing.userId}&listing=${listing.id}`}
                  className="flex items-center gap-3 w-full bg-gray-100 text-gray-900 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors justify-center"
                >
                  <MessageCircle size={20} />
                  <span>Chatni boshlash</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

