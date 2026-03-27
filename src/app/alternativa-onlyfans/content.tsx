'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button, Card } from '@/components/ui';
import Link from 'next/link';
import { Check, X, ArrowRight, Shield, Banknote, Gamepad2, Users, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const comparisonData = [
  { feature: 'Comisión', apapacho: '10%', onlyfans: '20%', apWins: true },
  { feature: 'Moneda de pago', apapacho: 'Pesos chilenos (CLP)', onlyfans: 'Dólares (USD)', apWins: true },
  { feature: 'Transferencia bancaria Chile', apapacho: true, onlyfans: false, apWins: true },
  { feature: 'Conversión de moneda', apapacho: 'Sin conversión', onlyfans: '~3% pérdida USD→CLP', apWins: true },
  { feature: 'Frecuencia de pagos', apapacho: 'Semanal', onlyfans: 'Mensual', apWins: true },
  { feature: 'Gamificación (niveles, misiones)', apapacho: true, onlyfans: false, apWins: true },
  { feature: 'Protección anti-screenshot', apapacho: true, onlyfans: false, apWins: true },
  { feature: 'Watermark automático', apapacho: true, onlyfans: false, apWins: true },
  { feature: 'Soporte en español chileno', apapacho: true, onlyfans: false, apWins: true },
  { feature: 'Programa de referidos', apapacho: '5% por 90 días', onlyfans: '5% por 12 meses', apWins: false },
  { feature: 'Base de usuarios global', apapacho: 'Chile y Latam', onlyfans: 'Global', apWins: false },
  { feature: 'Mensajes directos', apapacho: true, onlyfans: true, apWins: null },
  { feature: 'Contenido PPV', apapacho: true, onlyfans: true, apWins: null },
  { feature: 'Propinas', apapacho: true, onlyfans: true, apWins: null },
  { feature: 'Suscripciones mensuales', apapacho: true, onlyfans: true, apWins: null },
];

const faqs = [
  {
    q: '¿Puedo migrar mi perfil de OnlyFans a Apapacho?',
    a: 'Sí, puedes importar tu contenido a Apapacho. Ofrecemos herramientas para facilitar la migración de tu perfil, biografía y contenido existente.'
  },
  {
    q: '¿Mis fans de OnlyFans me pueden encontrar en Apapacho?',
    a: 'Sí. Comparte tu link de Apapacho en tu perfil de OnlyFans, redes sociales y biografías. Muchos fans prefieren pagar en pesos chilenos, así que el cambio es natural.'
  },
  {
    q: '¿Puedo usar ambas plataformas al mismo tiempo?',
    a: 'Por supuesto. Muchos creadores empiezan usando ambas y gradualmente migran su audiencia. No hay exclusividad.'
  },
  {
    q: '¿Apapacho es seguro?',
    a: 'Sí. Usamos encriptación de nivel bancario, URLs firmadas para contenido, watermark automático con el nombre del comprador, y detección de capturas de pantalla. Tu contenido está más protegido que en OnlyFans.'
  },
  {
    q: '¿Qué pasa si soy de otro país de Latinoamérica?',
    a: 'Apapacho está enfocado en Chile, pero creadores de otros países pueden unirse. Estamos expandiendo los métodos de pago locales a más países de Latam.'
  },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value
      ? <Check className="w-5 h-5 text-green-400 mx-auto" />
      : <X className="w-5 h-5 text-red-400/50 mx-auto" />;
  }
  return <span>{value}</span>;
}

export function AlternativaOnlyfansContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-1.5 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-full">
              <span className="text-fuchsia-300 text-sm font-medium">La alternativa #1 en Chile</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Apapacho vs OnlyFans:<br />
              <span className="gradient-text">Gana más en Chile</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Mismas funcionalidades, mitad de comisión, pagos en pesos chilenos.
              La plataforma hecha por y para creadores chilenos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
                  Crear cuenta gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/calculadora">
                <Button size="lg" variant="outline">
                  Calcular mis ganancias
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Key differences */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            ¿Por qué creadores eligen Apapacho?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="solid" className="p-6 text-center">
              <Banknote className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-green-400 mb-2">10%</h3>
              <p className="text-white/60">Comisión vs 20% de OnlyFans</p>
            </Card>
            <Card variant="solid" className="p-6 text-center">
              <Shield className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Anti-piratería</h3>
              <p className="text-white/60">Watermark + bloqueo de screenshots</p>
            </Card>
            <Card variant="solid" className="p-6 text-center">
              <Gamepad2 className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Gamificación</h3>
              <p className="text-white/60">Niveles, misiones y recompensas para fans</p>
            </Card>
            <Card variant="solid" className="p-6 text-center">
              <Users className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Soporte local</h3>
              <p className="text-white/60">Equipo chileno, soporte en español</p>
            </Card>
          </div>
        </div>

        {/* Comparison table */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Comparación detallada
          </h2>
          <Card variant="solid" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Característica</th>
                    <th className="text-center p-4 text-fuchsia-400 font-bold">Apapacho</th>
                    <th className="text-center p-4 text-white/40 font-medium">OnlyFans</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white/80">{row.feature}</td>
                      <td className={`p-4 text-center font-medium ${row.apWins === true ? 'text-green-400' : 'text-white/70'}`}>
                        <CellValue value={row.apapacho} />
                      </td>
                      <td className={`p-4 text-center ${row.apWins === false ? 'text-green-400' : 'text-white/40'}`}>
                        <CellValue value={row.onlyfans} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Preguntas sobre el cambio
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i} variant="solid" className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-semibold text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-white/70">{faq.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="solid" className="p-12 text-center bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border-2 border-fuchsia-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Haz el cambio hoy
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Crea tu cuenta gratis en 2 minutos. Puedes usar ambas plataformas mientras migras tu audiencia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
                  Empezar gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/calculadora">
                <Button size="lg" variant="outline">
                  Calcular cuánto ganaría
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
