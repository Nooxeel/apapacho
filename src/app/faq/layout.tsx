import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes - FAQ sobre Apapacho',
  description: 'Resuelve todas tus dudas sobre Apapacho. Cómo funciona, comisiones, pagos, seguridad y más. Guía completa para creadores y fans.',
  keywords: [
    'apapacho faq',
    'preguntas frecuentes onlyfans chile',
    'como funciona apapacho',
    'comisiones creadores chile',
    'plataforma contenido adulto preguntas'
  ],
  openGraph: {
    title: 'Preguntas Frecuentes | Apapacho',
    description: 'Todo lo que necesitas saber sobre Apapacho',
    type: 'website',
    locale: 'es_CL',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
