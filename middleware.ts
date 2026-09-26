import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "./lib/auth";

const PUBLIC_PATHS = ["/admin/login", "/api/admin/auth/login", "/api/admin/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;
  const payload = token ? await verifyAdminToken(token) : null;

  if (!payload) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};