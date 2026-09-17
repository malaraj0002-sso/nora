import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Locale-prefixed Dashboard URLs must never become marketing routes.
 * /en/dashboard/login → 308 /dashboard/login (path after the locale is preserved).
 */
const LOCALE_DASHBOARD = /^\/(he|ar|en|ru)(\/dashboard(?:\/.*)?)$/;

function isPassthroughPath(pathname: string): boolean {
  return (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/studio' ||
    pathname.startsWith('/studio/') ||
    pathname === '/api' ||
    pathname.startsWith('/api/')
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localeDashboard = pathname.match(LOCALE_DASHBOARD);
  if (localeDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = localeDashboard[2];
    return NextResponse.redirect(url, 308);
  }

  // Isolated roots: future app/dashboard (own html/body, like Studio) and /studio
  // must not be rewritten into app/[locale]. next-intl never runs for these.
  if (isPassthroughPath(pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(he|ar|en|ru)/:path*', '/((?!api|studio|dashboard|_next|_vercel|.*\\..*).*)'],
};
