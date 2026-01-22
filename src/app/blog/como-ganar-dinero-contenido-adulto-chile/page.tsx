import { Metadata } from 'next'
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Calendar, Clock, Share2, Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cómo Ganar Dinero con Contenido Adulto en Chile 2026 - Guía Completa',
  description: 'Aprende paso a paso cómo monetizar tu contenido adulto en Chile. Plataformas, estrategias, aspectos legales y consejos de creadores exitosos.',
  keywords: [
    'ganar dinero contenido adulto chile',
    'como empezar onlyfans chile',
    'monetizar fotos adultas',
    'creador contenido adulto',
    'plataforma adultos chile'
  ],
  openGraph: {
    title: 'Cómo Ganar Dinero con Contenido Adulto en Chile 2026',
    description: 'Guía completa para monetizar tu contenido adulto en Chile',
    type: 'article',
    locale: 'es_CL',
    publishedTime: '2026-01-15T00:00:00.000Z',
    authors: ['Apapacho'],
  },
}

export default function ArticlePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d0d1a] to-[#1a1a2e]">
      <Navbar />
      
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Cómo Ganar Dinero con Contenido Adulto en Chile 2026",
            "description": "Guía completa para empezar a monetizar tu contenido adulto en Chile.",
            "image": "https://appapacho.cl/og-blog.jpg",
            "author": {
              "@type": "Organization",
              "name": "Apapacho"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Apapacho",
              "logo": {
                "@type": "ImageObject",
                "url": "https://appapacho.cl/favicon.svg"
              }
            },
            "datePublished": "2026-01-15",
            "dateModified": "2026-01-15",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://appapacho.cl/blog/como-ganar-dinero-contenido-adulto-chile"
            }
          })
        }}
      />
      
      <article className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* Back link */}
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-pink-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            <span className="inline-block px-3 py-1 bg-pink-500/20 text-pink-400 text-sm font-medium rounded-full mb-4">
              Guía
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cómo Ganar Dinero con Contenido Adulto en Chile 2026
            </h1>
            <div className="flex items-center gap-4 text-white/50 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                15 Enero 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                8 min de lectura
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-pink max-w-none">
            <p className="text-lg text-white/80 leading-relaxed">
              El mercado de contenido adulto en Chile ha crecido exponencialmente en los últimos años. 
              Con la llegada de plataformas locales como <strong>Apapacho</strong>, ahora es más fácil 
              que nunca monetizar tu contenido de forma segura y con pagos directos en pesos chilenos.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              ¿Por qué elegir una plataforma chilena?
            </h2>
            <p className="text-white/70 leading-relaxed">
              Las plataformas internacionales como OnlyFans cobran hasta un <strong>20% de comisión</strong> y 
              los pagos pueden tardar semanas en llegar, además de las complicaciones con el cambio de moneda.
            </p>
            
            <div className="bg-white/5 border border-pink-500/30 rounded-xl p-6 my-6">
              <h3 className="text-lg font-semibold text-white mb-3">Ventajas de Apapacho:</h3>
              <ul className="space-y-2">
                {[
                  'Solo 7-10% de comisión (la más baja del mercado)',
                  'Pagos semanales directos a tu cuenta chilena',
                  'Soporte en español 24/7',
                  'WebPay: débito y crédito chileno',
                  'Protección de contenido con marca de agua',
                  'Verificación de edad obligatoria para fans'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/70">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Paso 1: Decide tu nicho
            </h2>
            <p className="text-white/70 leading-relaxed">
              Antes de empezar, es importante definir qué tipo de contenido vas a crear. 
              Los nichos más populares en Chile incluyen:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 my-4">
              <li>Contenido fitness y lifestyle</li>
              <li>Fotos y videos sensuales</li>
              <li>Contenido fetiche específico</li>
              <li>Chats y videollamadas personalizadas</li>
              <li>Contenido cosplay o temático</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Paso 2: Crea tu cuenta en Apapacho
            </h2>
            <p className="text-white/70 leading-relaxed">
              El registro es gratuito y toma menos de 5 minutos. Necesitarás:
            </p>
            <ol className="list-decimal list-inside text-white/70 space-y-2 my-4">
              <li>Email válido</li>
              <li>Cédula de identidad (para verificar que eres mayor de 18)</li>
              <li>Selfie con tu cédula (verificación rápida)</li>
              <li>Cuenta bancaria chilena para recibir pagos</li>
            </ol>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Paso 3: Configura tus precios
            </h2>
            <p className="text-white/70 leading-relaxed">
              En Apapacho puedes ganar dinero de múltiples formas:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 my-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-2">💳 Suscripciones</h4>
                <p className="text-white/60 text-sm">Cobra mensualmente por acceso a tu contenido. Desde $2.990 CLP.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-2">💝 Propinas</h4>
                <p className="text-white/60 text-sm">Recibe propinas directas de tus fans más fieles.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-2">🔓 Contenido PPV</h4>
                <p className="text-white/60 text-sm">Vende fotos y videos individuales a precio fijo.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Paso 4: Promociona tu perfil
            </h2>
            <p className="text-white/70 leading-relaxed">
              El contenido es importante, pero la promoción lo es aún más. Estrategias efectivas:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 my-4">
              <li><strong>Twitter/X:</strong> La red más permisiva para contenido adulto</li>
              <li><strong>Reddit:</strong> Subreddits específicos de tu nicho</li>
              <li><strong>Telegram:</strong> Grupos y canales de promoción</li>
              <li><strong>TikTok:</strong> Contenido SFW que redirija a tu perfil</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">
              Aspectos Legales en Chile
            </h2>
            <p className="text-white/70 leading-relaxed">
              Crear contenido adulto es completamente legal en Chile para mayores de 18 años. 
              Sin embargo, debes considerar:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 my-4">
              <li><strong>Inicio de actividades:</strong> Si ganas más de $1.000.000 mensual, deberías formalizarte en el SII</li>
              <li><strong>Boletas:</strong> Emite boletas de honorarios por tus ingresos</li>
              <li><strong>Impuestos:</strong> Los ingresos tributan como cualquier otro trabajo</li>
            </ul>

            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-6 my-8 border border-pink-500/30">
              <h3 className="text-xl font-bold text-white mb-3">¿Listo para empezar?</h3>
              <p className="text-white/70 mb-4">
                Únete a cientos de creadores chilenos que ya están ganando dinero con Apapacho.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Crear mi cuenta gratis
              </Link>
            </div>
          </div>

          {/* Share */}
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
