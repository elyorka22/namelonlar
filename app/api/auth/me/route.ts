import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/auth/me — текущий пользователь.
 * 1) Токен в заголовке → запрос к Supabase Auth /user (проверка токена).
 * 2) Иначе getCurrentUser() из cookies.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (accessToken && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(SUPABASE_URL + "/auth/v1/user", {
        headers: {
          Authorization: "Bearer " + accessToken,
          apikey: SUPABASE_ANON_KEY,
        },
      });
      if (res.ok) {
        const user = await res.json();
        let role = (user.app_metadata?.role as string) || "USER";
        if (role !== "ADMIN" && role !== "MODERATOR" && user.email) {
          const prismaUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { role: true },
          });
          if (prismaUser?.role === "ADMIN" || prismaUser?.role === "MODERATOR") {
            role = prismaUser.role;
          }
        }
        return NextResponse.json({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          role: role === "ADMIN" || role === "MODERATOR" ? role : "USER",
          isAdmin: role === "ADMIN" || role === "MODERATOR",
        });
      }
    } catch {
      // не перебрасываем — пробуем cookies
    }
  }

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
