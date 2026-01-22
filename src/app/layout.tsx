import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { FontProvider } from '@/contexts/FontContext'
import { AgeVerificationProvider } from '@/components/providers/AgeVerificationProvider'
import { BadgeNotificationProvider } from '@/components/gamification'
import { ContentProtection } from '@/components/ui/ContentProtection'
// Cookie consent disabled for now - not required in Chile
// import CookieConsent from '@/components/ui/CookieConsent'

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
  title: {
    default: 'Apapacho - Plataforma de Contenido Adulto para Creadores',
    template: '%s | Apapacho'
  },
  description: 'La mejor plataforma de contenido adulto en Chile y Latinoamérica. Monetiza tu contenido exclusivo con suscripciones, propinas y ventas. Alternativa a OnlyFans con pagos locales.',
  keywords: [
    'plataforma contenido adulto',
    'onlyfans alternativa',
    'onlyfans chile',
    'contenido exclusivo',
    'creadores adultos',
    'monetizar contenido',
    'suscripciones contenido adulto',
    'fotos exclusivas',
    'videos exclusivos',
    'plataforma creadores chile',
    'ganar dinero contenido adulto',
    'contenido premium',
    'fans pagos',
    'modelos webcam',
    'contenido para adultos chile',
    'plataforma +18'
  ],
  metadataBase: new URL('https://apapacho.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'es-CL': '/',
      'es-419': '/',
    }
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Apapacho - Plataforma de Contenido Adulto #1 en Chile',
    description: 'Monetiza tu contenido exclusivo. Suscripciones, propinas y ventas con pagos locales. La mejor alternativa a OnlyFans en Latinoamérica.',
    type: 'website',
    locale: 'es_CL',
    siteName: 'Apapacho',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Apapacho - Plataforma de Contenido Adulto',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apapacho - Plataforma de Contenido Adulto',
    description: 'Monetiza tu contenido exclusivo con la mejor plataforma de Chile',
  },
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
  category: 'adult',
  classification: 'adult content platform',
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
        
        {/* Age verification & adult content indicators */}
        <meta name="rating" content="adult" />
        <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA" />
        <meta httpEquiv="pics-label" content='(pics-1.1 "http://www.icra.org/ratingsv02.html" l gen true for "https://apapacho.vercel.app" r (nz 1 vz 1 lz 1 oz 1 cz 1) gen true for "https://*.apapacho.vercel.app" r (nz 1 vz 1 lz 1 oz 1 cz 1))' />
        
        {/* Geo targeting */}
        <meta name="geo.region" content="CL" />
        <meta name="geo.placename" content="Chile" />
        <meta name="language" content="Spanish" />
        <meta name="content-language" content="es-CL" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Apapacho",
              "alternateName": ["Apapacho Chile", "Plataforma Apapacho"],
              "url": "https://apapacho.vercel.app",
              "description": "La mejor plataforma de contenido adulto en Chile y Latinoamérica. Monetiza tu contenido exclusivo con suscripciones, propinas y ventas.",
              "inLanguage": "es-CL",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://apapacho.vercel.app/creators?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Apapacho",
                "url": "https://apapacho.vercel.app",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://apapacho.vercel.app/favicon.svg"
                }
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Apapacho",
              "url": "https://apapacho.vercel.app",
              "logo": "https://apapacho.vercel.app/favicon.svg",
              "description": "Plataforma de contenido adulto para creadores en Chile y Latinoamérica",
              "foundingDate": "2024",
              "areaServed": ["CL", "419"],
              "serviceType": ["Content Platform", "Adult Content", "Creator Economy"],
              "sameAs": []
            })
          }}
        />
        <ContentProtection />
        <FontProvider>
          <AgeVerificationProvider>
            <BadgeNotificationProvider>
              {children}
            </BadgeNotificationProvider>
          </AgeVerificationProvider>
        </FontProvider>
        {/* Cookie consent disabled for now - not required in Chile */}
      </body>
    </html>
  )
}
