import { NextRequest, NextResponse } from "next/server";

// ✅ Public routes
const publicRoutes = ["/login", "/about", "/contact"];

// ✅ Paths that should bypass middleware (static files, Next.js internals, API routes)
const ignoredPaths = [
  "/_next",
  "/favicon.ico",
  "/images",
  "/api",
  "/images",
  "/images/",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for ignored paths
  if (ignoredPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("user");

  // Public routes
  if (publicRoutes.includes(pathname)) {
    if (pathname === "/login" && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
