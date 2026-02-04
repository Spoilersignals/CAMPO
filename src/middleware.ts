import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  
  // Paths that should always be accessible
  const publicPaths = [
    "/maintenance",
    "/api",
    "/_next",
    "/favicon.ico",
    "/images",
    "/icons",
  ];
  
  const pathname = request.nextUrl.pathname;
  
  // Allow public paths
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isMaintenanceMode && !isPublicPath) {
    // Redirect to maintenance page
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }
  
  // If not in maintenance mode but trying to access maintenance page, redirect to home
  if (!isMaintenanceMode && pathname === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
