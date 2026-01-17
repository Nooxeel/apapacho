import type { Metadata } from 'next'
import { Inter, Poppins, Cinzel } from 'next/font/google'
import './globals.css'
import { FontProvider } from '@/contexts/FontContext'

// Optimized: Only 3 essential fonts for performance
// Inter: Primary UI font (body text, buttons)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '600', '700'], // Reduced from 5 to 3 weights
  preload: true, // Preload critical font
})

// Poppins: Secondary font (headings, emphasis)
const poppins = Poppins({
  weight: ['400', '600', '700'], // Reduced from 5 to 3 weights
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
})

// Cinzel: Elegant serif for special headings
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['600', '700'], // Reduced from 4 to 2 weights
  preload: false, // Load on-demand
})

export const metadata: Metadata = {
  title: 'Apapacho - Tu Plataforma de Contenido',
  description: 'Plataforma para creadores de contenido con personalización total estilo MySpace',
  keywords: ['creadores', 'contenido', 'suscripciones', 'personalización'],
  metadataBase: new URL('https://apapacho.vercel.app'),
  openGraph: {
    title: 'Apapacho - Tu Plataforma de Contenido',
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
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* Preconnect for critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0d0d1a" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${cinzel.variable}`}>
        <FontProvider>
          {children}
        </FontProvider>
      </body>
    </html>
  )
}
