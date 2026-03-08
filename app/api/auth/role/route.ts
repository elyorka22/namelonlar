import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

/**
 * GET /api/auth/role — возвращает роль текущего пользователя.
 * Используется на клиенте один раз, чтобы стабильно показывать кнопку админки без мигания.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ role: "USER", isAdmin: false });
    }
    const role = (user as { role?: string }).role ?? "USER";
    const isAdmin = role === "ADMIN" || role === "MODERATOR";
    return NextResponse.json({ role, isAdmin });
  } catch {
    return NextResponse.json({ role: "USER", isAdmin: false });
  }
}
