"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, Share2 } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";

interface ListingActionsProps {
  listingId: string;
}

export function ListingActions({ listingId }: ListingActionsProps) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = async () => {
    if (!session) {
      window.location.href = "/auth/signin";
      return;
    }
    const result = await toggleFavorite(listingId);
    if (result.success && result.isFavorite !== undefined) {
      setIsFavorite(result.isFavorite);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Ссылка скопирована в буфер обмена");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFavorite}
        className={`p-2 rounded-lg transition-colors ${
          isFavorite
            ? "bg-red-100 text-red-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
      </button>
      <button
        onClick={handleShare}
        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <Share2 size={20} />
      </button>
    </div>
  );
}

