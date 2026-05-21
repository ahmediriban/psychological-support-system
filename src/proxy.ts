import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { auth } from "./lib/auth/config";

// 1. next-intl middleware
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 2. Run i18n middleware first
  const response = intlMiddleware(request);

  // 3. Protect dashboard routes
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    } catch (e) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// Match both intl routes + protected routes
export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};