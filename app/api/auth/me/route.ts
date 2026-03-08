import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/me — текущий пользователь.
 * Принимает токен из заголовка (клиент передаёт, если cookies не доходят) или из cookies.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const refreshToken = request.headers.get("x-supabase-refresh-token");

  if (accessToken) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );
      const { data: { session }, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });
      if (!error && session?.user) {
        let role = (session.user.app_metadata?.role as string) || "USER";
        if (role !== "ADMIN" && role !== "MODERATOR" && session.user.email) {
          const prismaUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
          });
          if (prismaUser?.role === "ADMIN" || prismaUser?.role === "MODERATOR") {
            role = prismaUser.role;
          }
        }
        return NextResponse.json({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          role: role === "ADMIN" || role === "MODERATOR" ? role : "USER",
          isAdmin: role === "ADMIN" || role === "MODERATOR",
        });
      }
    } catch {
      // Токен не подошёл — пробуем cookies
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
