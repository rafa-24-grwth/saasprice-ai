import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'

// Force dynamic rendering for all pages to prevent Supabase SSR errors during build
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'SaaSPrice.AI - Institutional-grade SaaS pricing clarity',
  description: 'Compare normalized SaaS pricing with confidence scores, freshness stamps, and full methodology. Know the cost. Show your work.',
  keywords: ['SaaS pricing', 'software pricing comparison', 'B2B pricing', 'pricing intelligence'],
  authors: [{ name: 'SaaSPrice.AI' }],
  openGraph: {
    title: 'SaaSPrice.AI - Institutional-grade SaaS pricing clarity',
    description: 'Compare normalized SaaS pricing with confidence scores and full methodology',
    type: 'website',
    locale: 'en_US',
    siteName: 'SaaSPrice.AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaSPrice.AI',
    description: 'Institutional-grade SaaS pricing clarity',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0E27' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Inter font with variable weights for premium typography */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-sp-surface-0 text-sp-text-primary antialiased">
        <Providers>
          {/* Premium fade-in animation on load */}
          <div className="animate-fadeIn">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}