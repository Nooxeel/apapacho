import type { Metadata } from 'next'
import { Inter, Poppins, Roboto, Open_Sans, Montserrat } from 'next/font/google'
import './globals.css'
import { FontProvider } from '@/contexts/FontContext'

// Top 5 web fonts optimized for performance
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap'
})

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap'
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Apapacho - Tu Plataforma de Contenido',
  description: 'Plataforma para creadores de contenido con personalización total estilo MySpace',
  keywords: ['creadores', 'contenido', 'suscripciones', 'personalización'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${poppins.variable} ${roboto.variable} ${openSans.variable} ${montserrat.variable}`}>
        <FontProvider>
          {children}
        </FontProvider>
      </body>
    </html>
  )
}
