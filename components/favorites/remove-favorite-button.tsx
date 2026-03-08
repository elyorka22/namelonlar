"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";

interface RemoveFavoriteButtonProps {
  listingId: string;
}

export function RemoveFavoriteButton({ listingId }: RemoveFavoriteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      const result = await toggleFavorite(listingId);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <Heart size={16} className="fill-current" />
      <span>{loading ? "Kutilmoqda..." : "Sevimlilardan olib tashlash"}</span>
    </button>
  );
}

