import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

const displayFont = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "Hooper's Hub NYC — Find & Book Basketball Courts",
    template: "%s | Hooper's Hub NYC",
  },
  description:
    'Discover every basketball court in New York City — public parks and private gyms. See real-time crowd levels, book private courts instantly, and join pickup games.',
  keywords: ['basketball courts NYC', 'book basketball court', 'pickup games NYC', 'NYC basketball'],
  openGraph: {
    title: "Hooper's Hub NYC",
    description: "Every basketball court in NYC. One app.",
    siteName: "Hooper's Hub NYC",
    images: ['/og-image.png'],
    url: 'https://courtbook-nyc.vercel.app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hooper's Hub NYC",
    description: "Find courts. Check crowds. Book instantly. Join runs.",
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Hooper's Hub",
  },
}

export const viewport: Viewport = {
  themeColor: '#1B3A5C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
