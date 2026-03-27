import type { Metadata } from 'next';
import { ReferidosContent } from './content';

export const metadata: Metadata = {
  title: 'Programa de Referidos | Apapacho',
  description: 'Gana dinero invitando creadores a Apapacho. Obtén 5% de comisión por cada creador que refieras durante 90 días. Sin límite de referidos.',
  keywords: [
    'programa referidos apapacho',
    'ganar dinero refiriendo creadores',
    'referidos onlyfans chile',
    'comisión por referir creadores',
  ],
  openGraph: {
    title: 'Gana Dinero Invitando Creadores | Apapacho',
    description: 'Refiere creadores a Apapacho y gana 5% de comisión por 90 días. Sin límite.',
    type: 'website',
    locale: 'es_CL',
  },
  alternates: {
    canonical: '/referidos',
  },
};

export default function ReferidosPage() {
  return <ReferidosContent />;
}
