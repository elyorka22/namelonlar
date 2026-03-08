import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderTree, 
  Image, 
  Settings,
  BarChart3
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    redirect("/auth/signin");
  }

  let user = null;
  if (currentUser.email) {
    user = await prisma.user.findUnique({
      where: { email: currentUser.email },
      select: { role: true },
    });
  }
  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true },
    });
  }

  if (user?.role !== "ADMIN" && user?.role !== "MODERATOR") {
    redirect("/");
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Boshqaruv paneli" },
    { href: "/admin/listings", icon: FileText, label: "E'lonlar" },
    { href: "/admin/users", icon: Users, label: "Foydalanuvchilar" },
    { href: "/admin/categories", icon: FolderTree, label: "Kategoriyalar" },
    { href: "/admin/banners", icon: Image, label: "Bannerlar" },
    { href: "/admin/settings", icon: Settings, label: "Sozlamalar" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-2">
              <LayoutDashboard className="text-primary-600" size={24} />
              <span className="text-xl font-bold text-gray-900">
                Admin Panel
              </span>
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Saytga qaytish
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

