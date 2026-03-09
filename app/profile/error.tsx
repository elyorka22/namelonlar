"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PROFILE-ERROR] Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle size={64} className="mx-auto text-red-700 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Xatolik yuz berdi
        </h1>
        <p className="text-gray-600 mb-8">
          Profil sahifasini yuklashda muammo yuz berdi. Iltimos, qayta urinib ko'ring.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Qayta urinib ko'rish
          </button>
          <Link
            href="/profile"
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Profilga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}

