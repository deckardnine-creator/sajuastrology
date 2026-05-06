/** @type {import('next').NextConfig} */

// ════════════════════════════════════════════════════════════════════
// v6.18.3 — Hardening pass before "deep-tech" credibility scrutiny.
//
// Threat model addressed (chandler 2026-05-06):
//   "Once we have authority, someone will open Chrome DevTools, scrape
//    the bundle, and try to publish 'they're just a vibe-coded wrapper'
//    takedowns. We need to make every basic forensic angle return
//    boring, professional results."
//
// Layers added in this pass (all browser-observable, all defensive):
//
//   1. productionBrowserSourceMaps: false (explicit)
//      Even though Next.js 16 already omits .map files from the
//      production bundle by default, declaring it explicitly:
//      (a) protects against accidental regression in a future upgrade,
//      (b) makes our intent obvious in code review,
//      (c) signals to securityheaders.com / Mozilla Observatory that
//          we made a conscious choice.
//
//   2. compiler.removeConsole — strip console.log/debug/info in prod,
//      keep error/warn for genuine runtime diagnostics. Reduces
//      information leakage from forgotten dev logs.
//
//   3. poweredByHeader: false — remove the "X-Powered-By: Next.js"
//      header. We don't gain anything from advertising the framework
//      to passive scanners.
//
//   4. Strict-Transport-Security (HSTS) — 2 years, includeSubDomains,
//      preload-eligible. Locks browsers to HTTPS for sajuastrology.com
//      and every subdomain we may add (api., admin., etc.) for the
//      next two years. Required for HSTS preload list submission.
//
//   5. X-Content-Type-Options: nosniff
//      Prevents the browser from MIME-sniffing a response into
//      something it shouldn't (the classic .txt-served-as-script.js
//      attack).
//
//   6. X-Frame-Options: SAMEORIGIN
//      Blocks our pages from being framed by third-party sites
//      (clickjacking defense). SAMEORIGIN — not DENY — because the
//      Flutter WebView technically runs in a chromeless browser
//      context that some Android OEMs report as a frame; SAMEORIGIN
//      is universally Flutter-safe while still blocking the actual
//      attack vector.
//
//   7. Referrer-Policy: strict-origin-when-cross-origin
//      Modern default. Sends full URL to same-origin requests, only
//      origin to cross-origin HTTPS, nothing on HTTPS→HTTP downgrade.
//      Prevents leaking ?lang= / ?signin=1 / share-slug paths to
//      embedded analytics or third-party links.
//
//   8. Permissions-Policy
//      Disables every browser permission we don't use — camera,
//      microphone, geolocation, accelerometer, payment-handler,
//      usb, midi, etc. — and disables FLoC / Topics. Means a
//      compromised script (or a hijacked third-party widget) can't
//      silently turn on the user's camera or query GPS. Explicit
//      disable list is more durable than relying on the browser's
//      default-off behavior because some defaults flip over time.
//
//   9. X-DNS-Prefetch-Control: on
//      We already use multiple third-party origins (Supabase, PayPal,
//      Creem, Google Auth, Apple Auth, Mixpanel, Firebase). Allowing
//      the browser to pre-resolve their DNS knocks 50–100ms off the
//      first request to each on slow mobile.
//
// Intentionally NOT added in this pass (separate phase, post-KYB):
//   - Content-Security-Policy: a strict CSP would have to whitelist
//     every Google / Apple / PayPal / Creem / Mixpanel / Firebase /
//     GA4 / Vercel Analytics origin AND inline-eval rules from the
//     Flutter WebView shell. One mistake bricks the site. Plan: add
//     CSP in Report-Only mode after KYB approval, monitor violations
//     for a week, then promote to enforcing.
//   - IP-based rate limiting in middleware: Vercel serverless is
//     stateless, so any in-memory rate-limit map is ineffective
//     across invocations. Effective rate limiting requires Upstash
//     Redis or Vercel KV (added env vars + dependency); deferred to
//     a separate hardening pass. We already have DB-based per-name
//     5-min/3-call limit on /api/reading/generate (the most expensive
//     endpoint), which is the actual cost-abuse vector.
//   - Bot UA detection: high false-positive risk, deferred.
// ════════════════════════════════════════════════════════════════════

// Centralized security header set. Listed FIRST in headers() so that
// path-specific cache rules layer on top. Next.js merges header arrays
// per matched source, so /api/:path* will still get its no-store cache
// header AND inherit the security headers below.
const SECURITY_HEADERS = [
  {
    // 2 years — meets HSTS preload list requirement. includeSubDomains
    // ensures any future api.sajuastrology.com / admin.sajuastrology.com
    // is also forced to HTTPS from day one.
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // SAMEORIGIN over DENY — see header (6) comment above for Flutter
    // WebView rationale. Real cross-site framing attempts are blocked.
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Explicit deny list for browser-side capabilities we don't use.
    // Format: feature=(allowlist), with empty allowlist meaning off.
    // browsing-topics=() opts out of Chrome's Topics API.
    // Features kept self-allowed: fullscreen (reading view), payment
    // (Creem/PayPal checkout), publickey-credentials-get (Apple/Google
    // OAuth WebAuthn), web-share (share sheet on mobile).
    key: 'Permissions-Policy',
    value: [
      'accelerometer=()',
      'autoplay=()',
      'browsing-topics=()',
      'camera=()',
      'clipboard-read=()',
      'cross-origin-isolated=()',
      'display-capture=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'hid=()',
      'idle-detection=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=(self)',
      'picture-in-picture=()',
      'publickey-credentials-get=(self)',
      'screen-wake-lock=()',
      'serial=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=(self)',
      'xr-spatial-tracking=()',
    ].join(', '),
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig = {
  // v6.18.3 — Explicitly disable production browser source maps. Next.js
  // 16 already omits .map files from the prod bundle by default, but
  // declaring it here makes the intent obvious and protects against a
  // future upgrade flipping the default. Server-side .map files are
  // not affected (Next runtime needs them for stack traces); only the
  // client bundle that gets served to the public is map-less.
  productionBrowserSourceMaps: false,

  // Strip console.* calls in production builds for non-error severity.
  // Reduces information leakage if a developer left a debug log behind,
  // and modestly shrinks the bundle. error/warn are retained because
  // we use them for genuine runtime diagnostics that we want to surface
  // in browser DevTools (e.g. the v6.18 fetch-attempt warnings).
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },

  // v6.18.3 — Tighten the X-Powered-By disclosure. Next.js sends
  // "X-Powered-By: Next.js" by default, which leaks the framework to
  // every passive scanner. We don't gain anything from advertising it.
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['framer-motion', 'lucide-react'],
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      // ─────────────────────────────────────────────────────────────
      // v6.18.3 — Global security headers, applied to everything.
      // Listed FIRST so subsequent path-specific entries can layer
      // their own Cache-Control on top without losing the security
      // baseline. Next.js merges arrays of headers per matching
      // source, so /api/:path* will still get its no-store cache
      // header AND inherit the security headers below.
      // ─────────────────────────────────────────────────────────────
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },

      // Static Next.js assets — 1 year immutable cache
      // _next/static/ is fingerprinted so safe to cache aggressively
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Public static files (images in /public, etc.) — 1 hour browser cache, 1 day CDN
      {
        source: '/:path*.(jpg|jpeg|png|webp|svg|gif|ico|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // API routes — never cache (dynamic data)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      // Main app tab URLs — 5 min browser, 10 min CDN, 1 hr stale-while-revalidate
      // This is the core fix for tab switching speed in the Flutter WebView.
      // WebView will serve cached HTML instantly on revisit while revalidating in background.
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/calculate',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/compatibility',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/consultation',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/dashboard',
        headers: [
          // Dashboard contains user-specific content — shorter cache
          {
            key: 'Cache-Control',
            value: 'private, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/letter',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/pricing',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/what-is-saju',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
          },
        ],
      },
      // Dynamic reading result pages — user-generated content, short private cache
      {
        source: '/reading/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/compatibility/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
}

export default nextConfig
