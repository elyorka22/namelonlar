import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

/**
 * GET /api/auth/me — текущий пользователь.
 * 401 если не авторизован (для проверки доступа к админке с клиента).
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (user as { role?: string }).role ?? "USER";
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role,
    isAdmin: role === "ADMIN" || role === "MODERATOR",
  });
}
