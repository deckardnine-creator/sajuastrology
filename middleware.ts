// SEO Phase 2.6: Inject x-url header so getServerLocale() can read ?lang=
// ----------------------------------------------------------------------
// Without this, headers().get("x-url") returns null on Vercel because
// Next.js 16 does NOT auto-populate x-url/x-invoke-path/x-matched-path.
// Result: all locale variants serve identical HTML with default locale.
//
// This middleware runs on every request, reads request.nextUrl, and sets
// x-url header to the full path+query string. getServerLocale() then
// parses ?lang= correctly and returns the right Locale.
//
// Zero impact on:
//   - Existing routes / page logic / API behavior
//   - Client-side LanguageProvider
//   - Flutter WebView (?lang= still works as before)
//   - Static assets (excluded by matcher)
// ----------------------------------------------------------------------
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  // Inject the full path+query so getServerLocale() can parse ?lang=
  const url = request.nextUrl.pathname + request.nextUrl.search;
  requestHeaders.set('x-url', url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Match all paths except:
  //   - _next/static (Next.js static files)
  //   - _next/image (image optimization)
  //   - favicon.ico, robots.txt, sitemap.xml (static SEO files)
  //   - api/* (API routes don't need locale detection)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:txt|xml|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf)).*)',
  ],
};