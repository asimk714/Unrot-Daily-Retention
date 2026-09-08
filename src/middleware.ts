import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("unrot_session");
  const isAuthenticated = !!sessionCookie?.value;

  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isProtectedRoute =
    pathname === "/home" ||
    pathname.startsWith("/home/") ||
    pathname === "/plan" ||
    pathname.startsWith("/plan/") ||
    pathname.startsWith("/learn") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/");

  // Authenticated user trying to access login/signup -> redirect to /home
  if (isAuthenticated && isAuthRoute) {
    const homeUrl = new URL("/home", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Unauthenticated user trying to access protected routes -> redirect to /login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/home/:path*",
    "/home",
    "/plan/:path*",
    "/plan",
    "/learn/:path*",
    "/onboarding/:path*",
    "/onboarding",
  ],
};