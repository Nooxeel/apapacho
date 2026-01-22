import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explorar Contenido Adulto - Descubre Nuevos Creadores',
  description: 'Explora y descubre nuevos creadores de contenido adulto. Encuentra modelos por categoría, popularidad y más. Contenido exclusivo y premium.',
  keywords: [
    'explorar contenido adulto',
    'buscar modelos',
    'descubrir creadores',
    'contenido nuevo',
    'modelos populares chile',
    'categorías adulto'
  ],
  openGraph: {
    title: 'Explorar Contenido | Apapacho',
    description: 'Descubre nuevos creadores de contenido adulto. Explora por categorías y encuentra tu favorito.',
    type: 'website',
    locale: 'es_CL',
  },
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
