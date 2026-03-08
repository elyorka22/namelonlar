import { AdminLayoutClient } from "@/components/admin/admin-layout-client";

export const dynamic = "force-dynamic";

/**
 * Проверка доступа только на клиенте через /api/auth/me (cookies уходят с запросом).
 * Серверный redirect убран — редирект делает клиент при 401.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
