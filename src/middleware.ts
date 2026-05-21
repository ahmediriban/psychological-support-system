import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

// next-intl middleware handles locale detection and routing
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /<locale>/dashboard and all sub-paths.
  // We only check cookie existence here — Edge runtime cannot use Prisma/pg.
  // Full session validation (DB lookup) happens in the layout server component.
  const isDashboardRoute = /^\/[^/]+\/(dashboard)/.test(pathname);

  if (isDashboardRoute) {
    // better-auth uses "better-auth.session_token" in dev (HTTP)
    // and "__Secure-better-auth.session_token" in production (HTTPS).
    const hasSession = request.cookies.getAll().some(
      (c) => c.name.includes("better-auth.session_token")
    );
    if (!hasSession) {
      const url = request.nextUrl.clone();
      // Preserve locale prefix when redirecting
      const locale = pathname.split("/")[1] ?? "ar";
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals, API routes, and static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
