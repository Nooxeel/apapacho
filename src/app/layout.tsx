import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { FontProvider } from '@/contexts/FontContext'
import { AgeVerificationProvider } from '@/components/providers/AgeVerificationProvider'
import { BadgeNotificationProvider } from '@/components/gamification'
import { ContentProtection } from '@/components/ui/ContentProtection'
import CookieConsent from '@/components/ui/CookieConsent'

// Optimized: Only 2 essential fonts for performance
// Inter: Primary UI font - only load weights actually used
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '600'], // Removed 700, using 600 for bold is fine
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

// Poppins: Secondary font (headings) - minimal weights
const poppins = Poppins({
  weight: ['600'], // Only semibold for headings
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'optional', // Don't block render - use system font if not loaded
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'Apapacho - Tu Plataforma de Contenido',
  description: 'Plataforma para creadores de contenido con personalización total estilo MySpace',
  keywords: ['creadores', 'contenido', 'suscripciones', 'personalización'],
  metadataBase: new URL('https://apapacho.vercel.app'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Appapacho - Tu Plataforma de Contenido',
    description: 'Plataforma para creadores de contenido con personalización total estilo MySpace',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Preconnect for critical resources - must be first */}
        <link rel="preconnect" href="https://apapacho-backend-production.up.railway.app" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for resources used later */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0d0d1a" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <ContentProtection />
        <FontProvider>
          <AgeVerificationProvider>
            <BadgeNotificationProvider>
              {children}
            </BadgeNotificationProvider>
          </AgeVerificationProvider>
        </FontProvider>
        <CookieConsent />
      </body>
    </html>
  )
}
