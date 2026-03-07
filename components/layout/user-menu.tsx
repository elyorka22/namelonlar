"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Settings, Heart, FileText, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  // Проверяем, валиден ли URL изображения
  const hasValidImage = user.image && !imageError && user.image.startsWith("http");
  const imageUrl = hasValidImage ? user.image : "";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-gray-200"
        title={user.name || user.email || "Profil"}
      >
        {hasValidImage && imageUrl ? (
          <Image
            src={imageUrl}
            alt={user.name || "User"}
            width={36}
            height={36}
            className="rounded-full object-cover"
            onError={() => setImageError(true)}
            unoptimized={imageUrl.includes("googleusercontent.com")}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <ChevronDown size={16} className="text-gray-600 hidden md:block" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="py-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} className="text-gray-600" />
                <span>Profil</span>
              </Link>
              <Link
                href="/profile/listings"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FileText size={18} className="text-gray-600" />
                <span>Mening e'lonlarim</span>
              </Link>
              <Link
                href="/profile/favorites"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Heart size={18} className="text-gray-600" />
                <span>Sevimlilar</span>
              </Link>
              <Link
                href="/profile/settings"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings size={18} className="text-gray-600" />
                <span>Sozlamalar</span>
              </Link>
              <button
                onClick={async () => {
                  setIsOpen(false);
                  const supabase = createClient();
                  // Выход из Supabase (для Google OAuth)
                  await supabase.auth.signOut();
                  // Выход из NextAuth (для email/password)
                  await nextAuthSignOut({ redirect: false });
                  // Перезагружаем страницу
                  router.push("/");
                  router.refresh();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors text-left text-red-600"
              >
                <LogOut size={18} />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

