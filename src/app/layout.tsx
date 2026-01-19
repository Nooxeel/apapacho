import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { FontProvider } from '@/contexts/FontContext'
import { AgeVerificationProvider } from '@/components/providers/AgeVerificationProvider'
import { ContentProtection } from '@/components/ui/ContentProtection'
import CookieConsent from '@/components/ui/CookieConsent'

// Optimized: Only 2 essential fonts for performance
// Inter: Primary UI font (body text, buttons) - CRITICAL for LCP
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '600', '700'],
  preload: true,
  fallback: ['system-ui', 'sans-serif'], // Use system font immediately
})

// Poppins: Secondary font (headings) - also used for decorative headings
const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap', // Changed from 'optional' to 'swap' for faster perceived load
  preload: false, // Load on-demand to reduce render-blocking
  fallback: ['system-ui', 'sans-serif'],
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
        <link rel="dns-prefetch" href="https://apapacho-backend-production.up.railway.app" />
        
        {/* Preconnect for critical resources - saves 100-300ms per connection */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://apapacho-backend-production.up.railway.app" crossOrigin="anonymous" />
        
        {/* Creator profile customization fonts - loaded async via media trick */}
        <link 
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700&family=Open+Sans:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
        />
        <link 
          id="google-fonts"
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700&family=Open+Sans:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
          media="print"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById('google-fonts').addEventListener('load', function() {
                this.media = 'all';
              });
              // Fallback for when load event already fired
              setTimeout(function() {
                var gf = document.getElementById('google-fonts');
                if (gf) gf.media = 'all';
              }, 100);
            `
          }}
        />
        
        {/* Viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0d0d1a" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <ContentProtection />
        <FontProvider>
          <AgeVerificationProvider>
            {children}
          </AgeVerificationProvider>
        </FontProvider>
        <CookieConsent />
      </body>
    </html>
  )
}
