import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { SignInModal } from '@/components/auth/sign-in-modal'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
})

const BASE_URL = 'https://sajuastrology.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'SajuAstrology — Decode Your Cosmic Blueprint',
    template: '%s | SajuAstrology',
  },
  description: 'Your birth date holds a 5,000-year-old code. Discover your destiny through Saju, the ancient Korean Four Pillars system. Get personalized readings from 518,400 unique cosmic profiles.',

  keywords: ['saju', 'korean astrology', 'four pillars', 'destiny', 'horoscope', 'birth chart', '사주', '사주팔자', 'bazi', 'four pillars of destiny'],

  authors: [{ name: 'SajuAstrology', url: BASE_URL }],
  creator: 'SajuAstrology',
  publisher: 'Rimfactory',

  // ── Favicon / Icons ───────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },

  // ── Open Graph (카카오톡, Facebook, 슬랙 등) ────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'SajuAstrology',
    title: 'SajuAstrology — Your Birth Date Holds a 5,000-Year-Old Code',
    description: 'Western astrology gives you 1 of 12 types. Saju gives you 1 of 518,400 unique cosmic profiles. Decode your destiny in 30 seconds.',
    images: [
      {
        url: '/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'SajuAstrology — Decode Your Cosmic Blueprint',
      },
    ],
  },

  // ── Twitter / X 카드 ──────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'SajuAstrology — Your Birth Date Holds a 5,000-Year-Old Code',
    description: 'Western astrology gives you 1 of 12 types. Saju gives you 1 of 518,400 unique cosmic profiles.',
    images: ['/og-image.jpeg'],
    creator: '@sajuastrology',
  },

  // ── Robots ────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Verification (나중에 Google Search Console 연결 시) ───
  // verification: {
  //   google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  // },
}

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <SignInModal />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
