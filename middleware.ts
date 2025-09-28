import { NextRequest, NextResponse } from "next/server";

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || 
            request.headers.get("x-real-ip") || 
            "anonymous";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  const userRequests = rateLimit.get(ip) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < windowMs);

  if (request.nextUrl.pathname.startsWith("/api/")) {
    let limit = 100; // Default limit for most API endpoints
    
    if (request.nextUrl.pathname.includes("/auth/")) {
      limit = 5; // Stricter limit for auth endpoints
    } else if (request.nextUrl.pathname.includes("/projects/create")) {
      limit = 10; // Limit project creation
    } else if (request.nextUrl.pathname.includes("/votes/")) {
      limit = 30; // Moderate limit for voting
    }

    if (recentRequests.length >= limit) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);
  }

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};