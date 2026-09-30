import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/admin/login",
  "/api/admin/auth/login",
  "/api/admin/auth/logout",
  "/staff/login",
  "/api/staff/auth/login",
  "/api/staff/auth/logout",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/staff") || pathname.startsWith("/api/staff")) {
    const employeeSession = request.cookies.get("employee_session")?.value;
    if (!employeeSession) {
      if (pathname.startsWith("/api/staff")) {
        return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
    return NextResponse.next();
  }

  const session = request.cookies.get("admin_session")?.value;
  if (session !== "authenticated") {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/staff/:path*", "/api/staff/:path*"],
};