import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
