"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-gray-600 mb-4">
          Ma&apos;lumotlarni yuklashda xatolik. Sahifani yangilab ko&apos;ring yoki
          bosh sahifaga o&apos;ting.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Qayta urinib ko&apos;rish
          </button>
          <Link
            href="/admin"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Admin bosh sahifa
          </Link>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Saytga
          </Link>
        </div>
      </div>
    </div>
  );
}
