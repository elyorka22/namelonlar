import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserMenu } from "./user-menu";
import { Plus, Search } from "lucide-react";

export async function Header() {
  const session = await getServerSession(authOptions);

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
            {session ? (
              <>
                <Link
                  href="/listing/new"
                  className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>E'lon joylashtirish</span>
                </Link>
                <UserMenu user={session.user} />
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Kirish
              </Link>
            )}
          </nav>

          <div className="md:hidden">
            {session ? (
              <UserMenu user={session.user} />
            ) : (
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-primary-600"
              >
                Kirish
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

