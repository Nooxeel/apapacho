import { Metadata } from 'next'
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Calendar, Clock, Share2, Check, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Guía de Impuestos para Creadores de Contenido en Chile 2026',
  description: 'Todo lo que necesitas saber sobre tributación como creador de contenido adulto en Chile. Inicio de actividades en el SII, boletas de honorarios, impuestos y deducciones.',
  keywords: [
    'impuestos creadores contenido chile',
    'boletas honorarios onlyfans',
    'SII creadores contenido',
    'tributación contenido adulto',
    'inicio actividades creador chile',
    'declarar ingresos onlyfans chile'
  ],
  openGraph: {
    title: 'Guía de Impuestos para Creadores en Chile 2026',
    description: 'Todo sobre tributación como creador de contenido en Chile.',
    type: 'article',
    locale: 'es_CL',
    publishedTime: '2025-12-20T00:00:00.000Z',
    authors: ['Apapacho'],
  },
}

export default function ArticlePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d0d1a] to-[#1a1a2e]">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Guía de Impuestos para Creadores de Contenido en Chile",
            "description": "Todo sobre tributación como creador de contenido en Chile.",
            "author": { "@type": "Organization", "name": "Apapacho" },
            "publisher": { "@type": "Organization", "name": "Apapacho", "logo": { "@type": "ImageObject", "url": "https://appapacho.cl/favicon.svg" } },
            "datePublished": "2025-12-20",
            "dateModified": "2025-12-20",
            "mainEntityOfPage": { "@type": "WebPage", "@id": "https://appapacho.cl/blog/impuestos-creadores-contenido-chile" }
          })
        }}
      />

      <article className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-pink-400 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          <header className="mb-8">
            <span className="inline-block px-3 py-1 bg-pink-500/20 text-pink-400 text-sm font-medium rounded-full mb-4">
              Legal
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Guía de Impuestos para Creadores de Contenido en Chile
            </h1>
            <div className="flex items-center gap-4 text-white/50 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                20 Diciembre 2025
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                10 min de lectura
              </span>
            </div>
          </header>

          <div className="prose prose-invert prose-pink max-w-none">
            <p className="text-lg text-white/80 leading-relaxed">
              Si estás ganando dinero como creador de contenido en Chile, necesitas entender
              tus obligaciones tributarias. No es tan complicado como parece. Esta guía te
              explica paso a paso qué hacer.
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Aviso importante</h3>
                  <p className="text-white/70">
                    Esta guía es informativa y no reemplaza la asesoría de un contador profesional.
                    Las leyes tributarias pueden cambiar. Consulta con un profesional para tu situación específica.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              ¿Necesito pagar impuestos?
            </h2>
            <p className="text-white/70 leading-relaxed">
              Sí. Los ingresos por creación de contenido son ingresos tributables en Chile,
              igual que cualquier otro trabajo independiente. La buena noticia es que el proceso
              es sencillo y hay bastantes deducciones disponibles.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Paso 1: Inicio de actividades en el SII
            </h2>
            <p className="text-white/70 leading-relaxed">
              Lo primero es formalizar tu actividad ante el Servicio de Impuestos Internos (SII).
              Esto se hace online en <strong>sii.cl</strong>.
            </p>
            <div className="bg-white/5 border border-pink-500/30 rounded-xl p-6 my-6">
              <h3 className="text-lg font-semibold text-white mb-3">Cómo hacer inicio de actividades:</h3>
              <ol className="space-y-2 list-decimal list-inside">
                {[
                  'Ingresa a sii.cl con tu ClaveÚnica',
                  'Ve a "Registro de Contribuyentes" → "Inicio de Actividades"',
                  'Selecciona actividad: "Servicios de entretenimiento" o "Producción de contenido digital"',
                  'Código de actividad sugerido: 900002 (Actividades artísticas) o 620200 (Servicios informáticos)',
                  'Elige régimen tributario: Pro Pyme General (si ganas menos de 75.000 UF/año)',
                  'Confirma y listo — el proceso es inmediato'
                ].map((item, i) => (
                  <li key={i} className="text-white/70">{item}</li>
                ))}
              </ol>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Paso 2: Emitir boletas de honorarios
            </h2>
            <p className="text-white/70 leading-relaxed">
              Cada vez que recibes un pago de Apapacho, deberías emitir una boleta de honorarios.
              Esto se hace también en el sitio del SII.
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 my-4">
              <li><strong>Monto bruto:</strong> El total que recibiste antes de impuestos</li>
              <li><strong>Retención:</strong> 13.75% (2026) se retiene como pago provisional</li>
              <li><strong>Receptor:</strong> Los datos de Apapacho como empresa</li>
            </ul>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 my-6">
              <p className="text-white/70">
                <strong className="text-white">Tip:</strong> Si tus ingresos mensuales son menores
                a $500.000, podrías emitir boletas a terceros (a nombre propio) en lugar de a Apapacho.
                Consulta con tu contador cuál es la mejor opción para ti.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Paso 3: Declaración anual (Abril)
            </h2>
            <p className="text-white/70 leading-relaxed">
              Cada abril debes hacer tu declaración anual de impuestos (Operación Renta).
              Aquí declaras todos tus ingresos del año anterior y pagas la diferencia — o
              recibes devolución si te retuvieron de más.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              ¿Qué puedes deducir?
            </h2>
            <p className="text-white/70 leading-relaxed">
              Como trabajador independiente, puedes deducir gastos relacionados con tu actividad:
            </p>
            <div className="bg-white/5 border border-pink-500/30 rounded-xl p-6 my-6">
              <h3 className="text-lg font-semibold text-white mb-3">Gastos deducibles comunes:</h3>
              <ul className="space-y-2">
                {[
                  'Equipamiento: cámara, lentes, iluminación, trípodes',
                  'Internet y teléfono (proporción de uso profesional)',
                  'Ropa y accesorios para contenido',
                  'Software y apps de edición (Lightroom, Photoshop, etc.)',
                  'Arriendo de espacio para fotos/videos (si aplica)',
                  'Maquillaje y cuidado personal profesional',
                  'Asesoría contable y legal',
                  'Comisiones de la plataforma (el 10% de Apapacho)'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/70">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Tramos de impuestos 2026
            </h2>
            <p className="text-white/70 leading-relaxed">
              Chile usa un sistema de impuestos progresivo. Solo pagas la tasa más alta sobre
              la porción que supera cada tramo:
            </p>
            <div className="overflow-x-auto my-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-white/60">Ingreso anual</th>
                    <th className="text-right p-3 text-white/60">Tasa</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  <tr className="border-b border-white/5">
                    <td className="p-3">Hasta ~$8.7M</td>
                    <td className="p-3 text-right text-green-400">0% (exento)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-3">$8.7M - $19.3M</td>
                    <td className="p-3 text-right">4%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-3">$19.3M - $32.2M</td>
                    <td className="p-3 text-right">8%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-3">$32.2M - $45.1M</td>
                    <td className="p-3 text-right">13.5%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-3">$45.1M - $57.9M</td>
                    <td className="p-3 text-right">23%</td>
                  </tr>
                  <tr>
                    <td className="p-3">Más de $57.9M</td>
                    <td className="p-3 text-right">30.4% - 40%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-white/50 text-sm my-4">
              * Valores aproximados en pesos chilenos. Los tramos oficiales se expresan en UTA/UTM.
              Consulta sii.cl para los valores exactos vigentes.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Preguntas frecuentes
            </h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">
              ¿Puedo trabajar sin inicio de actividades?
            </h3>
            <p className="text-white/70 leading-relaxed">
              Técnicamente puedes emitir boletas sin inicio de actividades, pero si tus ingresos
              superan las 10 UF mensuales (~$380.000), es altamente recomendable formalizarte.
              Evitas multas y accedes a beneficios tributarios.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">
              ¿El SII sabe lo que hago?
            </h3>
            <p className="text-white/70 leading-relaxed">
              El SII ve tus ingresos y gastos, no el contenido de tu trabajo. Tu declaración
              solo muestra montos, no qué tipo de contenido creaste. Tu privacidad está protegida.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">
              ¿Necesito contador?
            </h3>
            <p className="text-white/70 leading-relaxed">
              Si ganas menos de $1M al mes, probablemente puedas manejar tus impuestos tú misma.
              Si ganas más, un contador te ahorrará dinero en deducciones que no conocías.
              El costo típico es $30.000-$80.000 por la declaración anual.
            </p>

            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-6 my-8 border border-pink-500/30">
              <h3 className="text-xl font-bold text-white mb-3">Tu dinero, sin complicaciones</h3>
              <p className="text-white/70 mb-4">
                En Apapacho recibes tus pagos semanales directamente a tu cuenta bancaria chilena.
                Esto facilita el registro y control de tus ingresos para efectos tributarios.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Crear mi cuenta gratis
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/50">¿Te fue útil? Compártelo</span>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-white/70 hover:text-pink-400 hover:bg-white/10 transition-colors">
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
