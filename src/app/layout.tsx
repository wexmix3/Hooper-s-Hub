import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: "Hooper's Hub NYC — Find & Book Basketball Courts",
    template: "%s | Hooper's Hub NYC",
  },
  description:
    'Discover every basketball court in New York City — public parks and private gyms. See real-time crowd levels, book private courts instantly, and join pickup games.',
  keywords: ['basketball courts NYC', 'book basketball court', 'pickup games NYC', 'NYC basketball'],
  openGraph: {
    title: "Hooper's Hub NYC — Every Court in NYC. One App.",
    description: 'Find, book, and play basketball at any court in New York City.',
    siteName: "Hooper's Hub NYC",
    type: 'website',
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
