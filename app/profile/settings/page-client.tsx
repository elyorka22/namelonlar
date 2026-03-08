"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";
import { Lock, User, Loader2 } from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  password: string | null;
}

export default function ProfileSettingsPageClient() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Проверяем сессию на клиенте
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!session?.user) {
          console.log("[PROFILE-SETTINGS-CLIENT] No session found, redirecting to signin");
          router.push("/auth/signin");
          return;
        }

        console.log("[PROFILE-SETTINGS-CLIENT] Session found, loading user data:", session.user.email);

        // Загружаем данные пользователя через API
        const response = await fetch("/api/profile/user", {
          method: "GET",
          credentials: "include", // Важно: отправляем cookies
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log("[PROFILE-SETTINGS-CLIENT] Unauthorized, redirecting to signin");
            router.push("/auth/signin");
            return;
          }
          throw new Error(`Failed to load user: ${response.statusText}`);
        }

        const userData = await response.json();
        console.log("[PROFILE-SETTINGS-CLIENT] User data loaded:", userData);
        setUser(userData);
      } catch (err: any) {
        console.error("[PROFILE-SETTINGS-CLIENT] Error loading user:", err);
        setError(err.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Kirish sahifasiga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasPassword = !!user.password;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sozlamalar</h1>

        <div className="space-y-6">
          {/* Профиль */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <User size={24} className="text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Profil ma'lumotlari</h2>
            </div>
            <UpdateProfileForm user={user} />
          </div>

          {/* Пароль */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} className="text-primary-600" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">Parol</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {hasPassword 
                    ? "Parolingizni o'zgartirish yoki yangi parol o'rnatish" 
                    : "Parol o'rnatish (Google orqali kirgan bo'lsangiz, parol o'rnatishingiz kerak)"}
                </p>
              </div>
            </div>
            <ChangePasswordForm hasPassword={hasPassword} />
          </div>
        </div>
      </div>
    </div>
  );
}

