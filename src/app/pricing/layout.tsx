import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifas y Comisiones - Monetiza tu Contenido Adulto',
  description: 'Conoce las tarifas y comisiones de Apapacho. La plataforma con las mejores comisiones para creadores de contenido adulto en Chile. Gana más con tu contenido.',
  keywords: [
    'comisiones onlyfans',
    'tarifas plataforma adulto',
    'monetizar contenido adulto',
    'ganar dinero webcam',
    'comisiones creadores chile',
    'alternativa onlyfans barata'
  ],
  openGraph: {
    title: 'Tarifas para Creadores | Apapacho',
    description: 'Las mejores comisiones para creadores de contenido adulto. Gana más con Apapacho.',
    type: 'website',
    locale: 'es_CL',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
