import { type NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login", "/auth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("bitbus_token")?.value;

  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isPublic && token) {
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (!payload.is_admin) {
        return NextResponse.redirect(
          new URL("/login?error=not_admin", request.url),
        );
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname === "/login" && token) {
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (payload.is_admin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // invalid token, let them stay on login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon).*)"],
};
