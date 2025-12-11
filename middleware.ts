import { NextRequest, NextResponse } from "next/server";

// ✅ Public routes (no auth required)
const publicRoutes = [
  "/Osteocare-Bone-Health-Survey/login",
  "/Osteocare-Bone-Health-Survey/doctor-consent-form",
  "/Osteocare-Bone-Health-Survey/patient-consent-form",
  "/Osteocare-Bone-Health-Survey/reports",
];

// ✅ Paths to ignore (static files, Next.js internals, API routes)
const ignoredPaths = ["/_next", "/favicon.ico", "/images", "/api"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for ignored paths
  if (ignoredPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("user");

  // If visiting a public route
  if (publicRoutes.includes(pathname)) {
    // Logged-in user should be redirected to root
    // if (token && pathname !== "/Osteocare-Bone-Health-Survey/reports") {
    //   return NextResponse.redirect(
    //     new URL("/Osteocare-Bone-Health-Survey/", req.url)
    //   );
    // }
    return NextResponse.next();
  }

  // Protected routes: if no token, redirect to login
  if (!token) {
    return NextResponse.redirect(
      new URL("/Osteocare-Bone-Health-Survey/login", req.url)
    );
  }

  // Authenticated users on protected routes: allow
  return NextResponse.next();
}
