import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Descubrir Creadores - Recomendaciones Personalizadas',
  description: 'Descubre creadores de contenido adulto basados en tus intereses. Recomendaciones personalizadas de modelos y creators exclusivos.',
  keywords: [
    'descubrir modelos',
    'recomendaciones contenido adulto',
    'creadores sugeridos',
    'modelos para ti',
    'contenido personalizado'
  ],
  openGraph: {
    title: 'Descubrir Creadores | Apapacho',
    description: 'Encuentra creadores recomendados según tus intereses. Contenido adulto personalizado.',
    type: 'website',
    locale: 'es_CL',
  },
}

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
