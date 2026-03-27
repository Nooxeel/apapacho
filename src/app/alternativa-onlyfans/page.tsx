import type { Metadata } from 'next';
import { AlternativaOnlyfansContent } from './content';

export const metadata: Metadata = {
  title: 'Alternativa a OnlyFans en Chile | Apapacho',
  description: 'Apapacho es la mejor alternativa a OnlyFans para creadores en Chile. Comisión del 10% vs 20%, pagos en pesos chilenos, transferencia bancaria directa y protección de contenido avanzada.',
  keywords: [
    'alternativa onlyfans chile',
    'onlyfans chile',
    'plataforma creadores chile',
    'onlyfans en pesos chilenos',
    'alternativa onlyfans latinoamerica',
    'ganar dinero contenido adulto chile',
    'plataforma contenido adulto chile',
    'mejor que onlyfans',
  ],
  openGraph: {
    title: 'Apapacho: La Alternativa Chilena a OnlyFans',
    description: 'Comisión del 10% vs 20%, pagos en pesos chilenos, sin conversión de moneda. La plataforma de contenido para creadores en Chile.',
    type: 'website',
    locale: 'es_CL',
  },
  alternates: {
    canonical: '/alternativa-onlyfans',
  },
};

export default function AlternativaOnlyfansPage() {
  return <AlternativaOnlyfansContent />;
}
