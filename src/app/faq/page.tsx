'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChevronDown, HelpCircle, DollarSign, Shield, CreditCard, Users, MessageCircle } from 'lucide-react';

const faqCategories = [
  {
    id: 'general',
    name: 'General',
    icon: HelpCircle,
    questions: [
      {
        q: '¿Qué es Apapacho?',
        a: 'Apapacho es la plataforma líder de contenido adulto en Chile y Latinoamérica. Permite a creadores monetizar su contenido exclusivo mediante suscripciones, propinas y ventas directas, con pagos locales sin complicaciones.'
      },
      {
        q: '¿Es legal crear contenido adulto en Chile?',
        a: 'Sí, es completamente legal para mayores de 18 años. Solo necesitas verificar tu identidad y edad. Los ingresos se declaran como cualquier otro trabajo independiente.'
      },
      {
        q: '¿Quién puede ver mi contenido?',
        a: 'Solo usuarios verificados mayores de 18 años que hayan pagado por tu contenido (suscripción o compra individual) pueden verlo. Tu contenido nunca es público.'
      },
      {
        q: '¿Puedo ser anónimo/a?',
        a: 'Puedes usar un nombre artístico y no mostrar tu rostro. Sin embargo, para recibir pagos necesitamos verificar tu identidad real (esta información es confidencial).'
      }
    ]
  },
  {
    id: 'money',
    name: 'Dinero y Comisiones',
    icon: DollarSign,
    questions: [
      {
        q: '¿Cuánto cobra Apapacho de comisión?',
        a: 'Apapacho cobra solo 7% a 10% de comisión, la más baja del mercado. OnlyFans cobra 20%. Esto significa que si ganas $100.000, te quedas con $90.000-93.000.'
      },
      {
        q: '¿Cada cuánto recibo mis pagos?',
        a: 'Los pagos se procesan semanalmente, todos los lunes. El dinero llega a tu cuenta bancaria chilena en 1-2 días hábiles.'
      },
      {
        q: '¿Cuál es el monto mínimo de retiro?',
        a: 'El monto mínimo es de $10.000 CLP. No hay máximo.'
      },
      {
        q: '¿Qué métodos de pago aceptan para fans?',
        a: 'Aceptamos tarjetas de débito y crédito chilenas a través de WebPay. Pronto agregaremos transferencias bancarias y criptomonedas.'
      },
      {
        q: '¿Cómo pongo precio a mi contenido?',
        a: 'Tú decides. Puedes crear suscripciones desde $2.990 CLP/mes, vender contenido individual desde $990 CLP, y recibir propinas de cualquier monto.'
      }
    ]
  },
  {
    id: 'security',
    name: 'Seguridad y Privacidad',
    icon: Shield,
    questions: [
      {
        q: '¿Mi contenido está protegido?',
        a: 'Sí. Usamos marcas de agua automáticas con el nombre del comprador, bloqueamos capturas de pantalla en la app, y tenemos sistemas anti-descarga. Además, actuamos rápidamente ante filtraciones con DMCA.'
      },
      {
        q: '¿Qué pasa si alguien filtra mi contenido?',
        a: 'Tenemos un equipo legal que envía notificaciones DMCA inmediatamente. Rastreamos filtraciones con la marca de agua y podemos identificar al infractor.'
      },
      {
        q: '¿Mis datos personales están seguros?',
        a: 'Absolutamente. Usamos encriptación de nivel bancario. Tu identidad real nunca se comparte con fans ni terceros.'
      },
      {
        q: '¿Los fans saben mi nombre real?',
        a: 'No. Los fans solo ven tu nombre artístico. En sus estados de cuenta bancaria aparece "APAPACHO" sin detalles de tu perfil.'
      }
    ]
  },
  {
    id: 'creators',
    name: 'Para Creadores',
    icon: Users,
    questions: [
      {
        q: '¿Cómo empiezo como creador/a?',
        a: 'Regístrate gratis, verifica tu identidad (24h), configura tu perfil y precios, ¡y empieza a publicar! Puedes estar ganando el mismo día.'
      },
      {
        q: '¿Qué tipo de contenido puedo subir?',
        a: 'Fotos, videos, textos y mensajes. Todo contenido debe ser legal y entre adultos que consientan. Revisa nuestros términos para más detalles.'
      },
      {
        q: '¿Puedo bloquear a ciertos usuarios?',
        a: 'Sí. Puedes bloquear usuarios específicos, regiones geográficas, e incluso direcciones IP. Tú tienes el control total.'
      },
      {
        q: '¿Hay soporte si tengo problemas?',
        a: 'Sí, tenemos soporte en español 24/7 por chat y email. Respuesta garantizada en menos de 2 horas.'
      }
    ]
  },
  {
    id: 'fans',
    name: 'Para Fans',
    icon: CreditCard,
    questions: [
      {
        q: '¿Cómo pago por contenido?',
        a: 'Puedes pagar con tarjeta de débito o crédito chilena a través de WebPay. Es 100% seguro.'
      },
      {
        q: '¿Qué aparece en mi estado de cuenta?',
        a: 'Solo aparece "APAPACHO" sin detalles del creador ni tipo de contenido. Total discreción.'
      },
      {
        q: '¿Puedo cancelar mi suscripción?',
        a: 'Sí, puedes cancelar en cualquier momento desde tu panel. Mantienes acceso hasta que termine el período pagado.'
      },
      {
        q: '¿Hay reembolsos?',
        a: 'No ofrecemos reembolsos por contenido digital ya consumido. Si hay un problema técnico, contáctanos y lo resolveremos.'
      }
    ]
  }
];

// Generate FAQ structured data
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqCategories.flatMap(category => 
    category.questions.map(q => ({
      "@type": "Question",
      "name": q.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.a
      }
    }))
  )
};

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('general');

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d0d1a] to-[#1a1a2e]">
      <Navbar />
      
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Preguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Frecuentes</span>
            </h1>
            <p className="text-xl text-white/60">
              Todo lo que necesitas saber sobre Apapacho
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {faqCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    activeCategory === category.id
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqCategories
              .find(c => c.id === activeCategory)
              ?.questions.map((item, index) => {
                const itemId = `${activeCategory}-${index}`;
                const isOpen = openItems[itemId];
                
                return (
                  <div
                    key={itemId}
                    className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(itemId)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <span className="font-semibold text-white pr-4">{item.q}</span>
                      <ChevronDown 
                        className={`w-5 h-5 text-pink-400 flex-shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-white/70 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center p-8 bg-white/5 rounded-2xl border border-white/10">
            <MessageCircle className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              ¿No encontraste tu respuesta?
            </h2>
            <p className="text-white/60 mb-6">
              Nuestro equipo de soporte está listo para ayudarte
            </p>
            <a
              href="mailto:soporte@appapacho.cl"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Contactar soporte
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
