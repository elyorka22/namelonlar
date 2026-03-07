import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";
import { Lock, User } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProfileSettingsPage() {
  const currentUser = await getCurrentUser();
  console.log("[PROFILE-SETTINGS] getCurrentUser result:", currentUser ? { id: currentUser.id, email: currentUser.email } : "null");
  
  if (!currentUser?.id) {
    console.log("[PROFILE-SETTINGS] No user found, redirecting to signin");
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true, // Проверяем, есть ли пароль
    },
  });

  if (!user) {
    redirect("/auth/signin");
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

