/** @type {import('next').NextConfig} */
const nextConfig = {
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
