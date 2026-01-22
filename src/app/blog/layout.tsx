import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Guías y Consejos para Creadores de Contenido Adulto',
  description: 'Aprende a monetizar tu contenido adulto. Guías, consejos y estrategias para creadores en Chile y Latinoamérica. Alternativas a OnlyFans.',
  keywords: [
    'blog contenido adulto',
    'guia creadores onlyfans',
    'como ganar dinero contenido adulto',
    'tips creadores chile',
    'monetizar fotos y videos'
  ],
  openGraph: {
    title: 'Blog para Creadores | Apapacho',
    description: 'Guías y consejos para monetizar tu contenido adulto',
    type: 'website',
    locale: 'es_CL',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
