import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Creadores de Contenido Adulto - Modelos y Creators Exclusivos',
  description: 'Explora los mejores creadores de contenido adulto en Chile. Modelos exclusivas, contenido premium y suscripciones. Encuentra tu creador favorito.',
  keywords: [
    'creadores contenido adulto chile',
    'modelos onlyfans chile',
    'contenido exclusivo chile',
    'modelos webcam chilenas',
    'creators adultos',
    'suscripciones premium',
    'fotos y videos exclusivos',
    'modelos latinoamericanas'
  ],
  openGraph: {
    title: 'Creadores de Contenido Adulto | Apapacho',
    description: 'Explora los mejores creadores de contenido adulto. Modelos exclusivas con suscripciones y contenido premium.',
    type: 'website',
    locale: 'es_CL',
  },
}

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
