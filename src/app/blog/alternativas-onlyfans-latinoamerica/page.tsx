import { Metadata } from 'next'
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Calendar, Clock, Check, X, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Alternativas a OnlyFans en Latinoamérica 2026 - Comparativa Completa',
  description: 'Comparativa de las mejores plataformas de contenido adulto en LATAM. OnlyFans vs Fansly vs Apapacho. Comisiones, pagos y características.',
  keywords: [
    'alternativas onlyfans',
    'onlyfans latinoamerica',
    'fansly vs onlyfans',
    'plataformas contenido adulto latam',
    'mejor plataforma creadores chile'
  ],
  openGraph: {
    title: 'Alternativas a OnlyFans en Latinoamérica 2026',
    description: 'Comparativa completa de plataformas de contenido adulto en LATAM',
    type: 'article',
    locale: 'es_CL',
    publishedTime: '2026-01-10T00:00:00.000Z',
  },
}

const platforms = [
  {
    name: 'Apapacho',
    commission: '7-10%',
    localPayments: true,
    spanishSupport: true,
    weeklyPayouts: true,
    verification: 'Rápida (24h)',
    highlight: true,
    pros: ['Comisión más baja', 'Pagos en CLP', 'Soporte local', 'WebPay'],
    cons: ['Solo disponible en Chile (por ahora)'],
  },
  {
    name: 'OnlyFans',
    commission: '20%',
    localPayments: false,
    spanishSupport: false,
    weeklyPayouts: false,
    verification: 'Lenta (3-7 días)',
    highlight: false,
    pros: ['Marca conocida', 'Gran audiencia'],
    cons: ['Alta comisión', 'Pagos lentos', 'Soporte en inglés', 'Problemas con bancos'],
  },
  {
    name: 'Fansly',
    commission: '20%',
    localPayments: false,
    spanishSupport: false,
    weeklyPayouts: false,
    verification: 'Media (2-5 días)',
    highlight: false,
    pros: ['Más funciones que OF', 'Menos restricciones'],
    cons: ['Misma comisión alta', 'Sin pagos locales', 'Menos conocido'],
  },
  {
    name: 'Fanvue',
    commission: '15%',
    localPayments: false,
    spanishSupport: false,
    weeklyPayouts: false,
    verification: 'Media (2-4 días)',
    highlight: false,
    pros: ['Comisión intermedia', 'IA para gestión'],
    cons: ['Poco conocido en LATAM', 'Sin pagos locales'],
  },
];

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
            "headline": "Alternativas a OnlyFans en Latinoamérica 2026",
            "description": "Comparativa de las mejores plataformas de contenido adulto en LATAM.",
            "author": { "@type": "Organization", "name": "Apapacho" },
            "publisher": { "@type": "Organization", "name": "Apapacho" },
            "datePublished": "2026-01-10",
          })
        }}
      />
      
      <article className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-pink-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          <header className="mb-8">
            <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-full mb-4">
              Comparativa
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Las Mejores Alternativas a OnlyFans en Latinoamérica 2026
            </h1>
            <div className="flex items-center gap-4 text-white/50 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                10 Enero 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                6 min de lectura
              </span>
            </div>
          </header>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-white/80 leading-relaxed">
              OnlyFans dominó el mercado de contenido adulto por años, pero sus altas comisiones 
              y problemas con pagos en Latinoamérica han abierto espacio para alternativas locales. 
              Analizamos las mejores opciones disponibles en 2026.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-6">
              Comparativa de Plataformas
            </h2>

            {/* Comparison Table */}
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-3 px-4 text-white font-semibold">Plataforma</th>
                    <th className="py-3 px-4 text-white font-semibold">Comisión</th>
                    <th className="py-3 px-4 text-white font-semibold">Pagos Locales</th>
                    <th className="py-3 px-4 text-white font-semibold">Soporte ES</th>
                    <th className="py-3 px-4 text-white font-semibold">Pagos Semanales</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((platform) => (
                    <tr 
                      key={platform.name}
                      className={`border-b border-white/10 ${platform.highlight ? 'bg-pink-500/10' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${platform.highlight ? 'text-pink-400' : 'text-white'}`}>
                            {platform.name}
                          </span>
                          {platform.highlight && (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                      </td>
                      <td className={`py-4 px-4 font-semibold ${platform.commission === '7-10%' ? 'text-green-400' : 'text-white/70'}`}>
                        {platform.commission}
                      </td>
                      <td className="py-4 px-4">
                        {platform.localPayments ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {platform.spanishSupport ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {platform.weeklyPayouts ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Platform Details */}
            {platforms.map((platform) => (
              <div 
                key={platform.name}
                className={`mb-8 p-6 rounded-xl border ${
                  platform.highlight 
                    ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <h3 className={`text-xl font-bold mb-3 ${platform.highlight ? 'text-pink-400' : 'text-white'}`}>
                  {platform.name}
                  {platform.highlight && <span className="ml-2 text-sm text-yellow-400">⭐ Recomendado</span>}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Ventajas</h4>
                    <ul className="space-y-1">
                      {platform.pros.map((pro, i) => (
                        <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2">✗ Desventajas</h4>
                    <ul className="space-y-1">
                      {platform.cons.map((con, i) => (
                        <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                          <X className="w-4 h-4 text-red-400" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Conclusión: ¿Cuál elegir?
            </h2>
            <p className="text-white/70 leading-relaxed">
              Si estás en <strong>Chile</strong>, la mejor opción es claramente <strong>Apapacho</strong>: 
              comisión 50% menor que OnlyFans, pagos semanales en pesos chilenos, y soporte local.
            </p>
            <p className="text-white/70 leading-relaxed mt-4">
              Si necesitas alcance internacional y ya tienes audiencia, OnlyFans sigue siendo una opción, 
              pero considera usar múltiples plataformas para maximizar tus ingresos.
            </p>

            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-6 my-8 border border-pink-500/30 text-center">
              <h3 className="text-xl font-bold text-white mb-3">Prueba Apapacho Gratis</h3>
              <p className="text-white/70 mb-4">
                Crea tu cuenta en minutos y empieza a ganar con la comisión más baja.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Empezar ahora
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
