import Link from "next/link";
import { Search } from "lucide-react";
import { AuthButton } from "./auth-button";
import { getCurrentUser } from "@/lib/auth-helpers";
import { isAdminOrModerator } from "@/lib/auth";

// Результат зависит от сессии — не кэшировать
export const dynamic = "force-dynamic";

export async function Header() {
  const currentUser = await getCurrentUser();
  const showAdminButton = currentUser?.id
    ? await isAdminOrModerator(currentUser as import("@/lib/auth").UserWithRole)
    : false;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">
              Namangan Elonlar
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Search size={20} />
              <span>Qidirish</span>
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Kategoriyalar
            </Link>
            <AuthButton isAdmin={showAdminButton} />
          </nav>

          <div className="md:hidden">
            <AuthButton isAdmin={showAdminButton} />
          </div>
        </div>
      </div>
    </header>
  );
}

