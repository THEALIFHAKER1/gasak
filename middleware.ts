import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  // Allow public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/auth/") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }
  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(url);
  }

  const userRole = token.role as string;

  // Check role-based access for dashboard routes
  if (pathname.startsWith("/dashboard/admin")) {
    if (userRole !== "admin") {
      // Redirect to appropriate dashboard based on role
      if (userRole === "leader") {
        return NextResponse.redirect(new URL("/dashboard/leader", request.url));
      } else if (userRole === "member") {
        return NextResponse.redirect(new URL("/dashboard/member", request.url));
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  } else if (pathname.startsWith("/dashboard/leader")) {
    if (!["admin", "leader"].includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      if (userRole === "member") {
        return NextResponse.redirect(new URL("/dashboard/member", request.url));
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  } else if (pathname.startsWith("/dashboard/member")) {
    if (!["admin", "leader", "member"].includes(userRole)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Legacy role-based access (keeping for backward compatibility)
  if (pathname.startsWith("/admin/")) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else if (pathname.startsWith("/leader/")) {
    if (!["admin", "leader"].includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else if (pathname.startsWith("/member/")) {
    if (!["admin", "leader", "member"].includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
