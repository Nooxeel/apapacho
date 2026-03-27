import { Metadata } from 'next'
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Calendar, Clock, Share2, Check, Shield, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cómo Proteger tu Contenido de la Piratería - Guía 2026',
  description: 'Técnicas y herramientas para evitar que roben tu contenido adulto. Marcas de agua, DMCA, detección de screenshots y acciones legales en Chile.',
  keywords: [
    'proteger contenido adulto',
    'piratería onlyfans',
    'marca de agua contenido',
    'DMCA chile',
    'proteger fotos adultas',
    'evitar filtraciones contenido'
  ],
  openGraph: {
    title: 'Cómo Proteger tu Contenido de la Piratería',
    description: 'Técnicas y herramientas para evitar que roben tu contenido adulto.',
    type: 'article',
    locale: 'es_CL',
    publishedTime: '2026-01-05T00:00:00.000Z',
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
            "headline": "Cómo Proteger tu Contenido de la Piratería",
            "description": "Técnicas y herramientas para evitar que roben tu contenido adulto.",
            "author": { "@type": "Organization", "name": "Apapacho" },
            "publisher": { "@type": "Organization", "name": "Apapacho", "logo": { "@type": "ImageObject", "url": "https://appapacho.cl/favicon.svg" } },
            "datePublished": "2026-01-05",
            "dateModified": "2026-01-05",
            "mainEntityOfPage": { "@type": "WebPage", "@id": "https://appapacho.cl/blog/proteger-contenido-adulto-pirateria" }
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
              Seguridad
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cómo Proteger tu Contenido de la Piratería
            </h1>
            <div className="flex items-center gap-4 text-white/50 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                5 Enero 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                5 min de lectura
              </span>
            </div>
          </header>

          <div className="prose prose-invert prose-pink max-w-none">
            <p className="text-lg text-white/80 leading-relaxed">
              La piratería es una de las mayores preocupaciones para creadores de contenido adulto.
              Cada año, miles de creadores ven su contenido filtrado en sitios de terceros sin su consentimiento.
              En esta guía te enseñamos cómo protegerte de forma efectiva.
            </p>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">El problema es real</h3>
                  <p className="text-white/70">
                    Según estudios de la industria, más del 75% de los creadores de contenido adulto
                    han experimentado piratería de su contenido al menos una vez. La prevención es clave.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              1. Marcas de agua automáticas
            </h2>
            <p className="text-white/70 leading-relaxed">
              Las marcas de agua son tu primera línea de defensa. En Apapacho, cada pieza de contenido
              incluye automáticamente una marca de agua invisible con el nombre del comprador. Si alguien
              filtra tu contenido, puedes rastrear exactamente quién lo hizo.
            </p>
            <div className="bg-white/5 border border-pink-500/30 rounded-xl p-6 my-6">
              <h3 className="text-lg font-semibold text-white mb-3">Cómo funciona en Apapacho:</h3>
              <ul className="space-y-2">
                {[
                  'Marca de agua invisible integrada en cada imagen y video',
                  'El nombre del comprador queda embebido en el archivo',
                  'Sistema de detección que identifica al infractor',
                  'Activada por defecto en todo el contenido'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/70">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              2. Bloqueo de capturas de pantalla
            </h2>
            <p className="text-white/70 leading-relaxed">
              Las capturas de pantalla son el método más común de robo de contenido. Apapacho implementa
              tecnología que detecta y previene capturas de pantalla en dispositivos móviles y navegadores web.
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 my-4">
              <li><strong>CSS overlay:</strong> Capa protectora que dificulta la captura directa</li>
              <li><strong>Detección de teclas:</strong> Bloqueo de PrintScreen y atajos de captura</li>
              <li><strong>Deshabilitación de click derecho:</strong> Previene &quot;Guardar imagen como&quot;</li>
              <li><strong>DRM en videos:</strong> Protección de reproducción que impide grabación</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              3. URLs firmadas y contenido temporal
            </h2>
            <p className="text-white/70 leading-relaxed">
              Tu contenido nunca se expone con URLs permanentes. Cada vez que un fan accede a tu contenido,
              se genera una URL firmada que expira en minutos. Esto significa que incluso si alguien copia
              el link, dejará de funcionar rápidamente.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              4. Acciones legales: DMCA en Chile
            </h2>
            <p className="text-white/70 leading-relaxed">
              Si tu contenido aparece en sitios de terceros, tienes herramientas legales para eliminarlo:
            </p>
            <ol className="list-decimal list-inside text-white/70 space-y-2 my-4">
              <li><strong>DMCA Takedown:</strong> Envía una notificación DMCA al hosting del sitio infractor</li>
              <li><strong>Google Search Removal:</strong> Solicita a Google que desindexe las URLs infractoras</li>
              <li><strong>Reporte en redes sociales:</strong> Denuncia el contenido en Twitter, Reddit, Telegram</li>
              <li><strong>Acción legal en Chile:</strong> La ley 17.336 de propiedad intelectual protege tu contenido</li>
            </ol>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 my-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                <Shield className="w-5 h-5 text-pink-400 inline mr-2" />
                Ley 17.336 en Chile
              </h3>
              <p className="text-white/70">
                La Ley de Propiedad Intelectual chilena protege todas las obras creativas, incluyendo
                fotografías y videos. Compartir contenido sin autorización puede resultar en multas
                de hasta 1.000 UTM y penas de prisión. Como creador, tienes derechos morales y
                patrimoniales sobre todo tu contenido.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              5. Consejos adicionales
            </h2>
            <ul className="list-disc list-inside text-white/70 space-y-1 my-4">
              <li><strong>Busca regularmente:</strong> Usa Google Reverse Image Search para encontrar copias</li>
              <li><strong>No compartas previews de alta resolución</strong> en redes sociales</li>
              <li><strong>Usa marcas de agua visibles</strong> en contenido gratuito o de preview</li>
              <li><strong>Mantén registros:</strong> Guarda fechas de publicación como prueba de autoría</li>
              <li><strong>Monitorea Telegram y foros:</strong> Son los lugares más comunes de filtración</li>
            </ul>

            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-6 my-8 border border-pink-500/30">
              <h3 className="text-xl font-bold text-white mb-3">Protección incluida en Apapacho</h3>
              <p className="text-white/70 mb-4">
                Todas las herramientas de protección mencionadas están incluidas en tu cuenta de Apapacho
                sin costo adicional. Tu seguridad es nuestra prioridad.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Proteger mi contenido
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
