import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge check for session cookie presence (FE-H-3 defense in depth).
 * Real authorization is enforced by the API PermissionsGuard (API-C-1).
 * canAccessPath / AuthGuard remain UX-only on the client.
 */
const PUBLIC_PREFIXES = [
  "/login",
  "/_next",
  "/favicon",
  "/api",
];

const ACCESS_COOKIE =
  process.env.ACCESS_TOKEN_COOKIE_NAME?.trim() || "accessToken";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return NextResponse.next();
  }

  // Static assets
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  const hasAccessCookie = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);
  if (!hasAccessCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    if (pathname !== "/" && pathname !== "/login") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
