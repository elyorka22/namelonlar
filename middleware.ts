import { NextResponse, type NextRequest } from "next/server";

/**
 * Минимальный middleware — только передаёт запрос дальше.
 * Проверка авторизации только в layout и страницах (auth-helpers).
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
