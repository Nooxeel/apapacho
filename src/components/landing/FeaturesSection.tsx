import { Card, CardContent } from '@/components/ui'

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'Tu Identidad, Tu Canvas',
    description: 'Escoge colores, fondos, fuentes. Como MySpace pero mejor. Tu perfil refleja quien eres realmente.',
    gradient: 'from-primary-500 to-pink-500',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    title: 'Tu Música, Tu Vibe',
    description: 'Reproduce tu playlist favorita automáticamente cuando alguien visite tu perfil. La magia de MySpace está de vuelta.',
    gradient: 'from-accent-500 to-orange-500',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
    title: 'Expresa tu Estilo',
    description: 'Desde layouts clásicos hasta diseños modernos. La creatividad no tiene límites en tu espacio.',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Gana con tu Arte',
    description: 'Suscripciones, contenido premium y donaciones. Tu talento merece ser recompensado.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Construye tu Tribu',
    description: 'Libro de visitas, comentarios, mensajes. Conexiones reales como en los viejos tiempos.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Tu Contenido, Tus Reglas',
    description: 'Decide quién ve qué. Control total sobre tu contenido y tu privacidad.',
    gradient: 'from-yellow-500 to-orange-500',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 relative bg-gradient-to-b from-[#FAF3DD] to-[#B8F2E6]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#5E6472] mb-4">
            La plataforma que <span className="bg-gradient-to-r from-[#FFA69E] to-[#AED9E0] bg-clip-text text-transparent">extrañabas</span>
          </h2>
          <p className="text-lg text-[#5E6472] max-w-2xl mx-auto">
            Donde tu creatividad no tiene límites y tu perfil es tan único como tú.
            <br />
            Bienvenido de vuelta a la era dorada de la personalización.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="glass"
              hover
              className="group bg-white/80 border-[#5E6472]/10"
            >
              <CardContent>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-5`}
                >
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-[#5E6472]">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-[#5E6472] mb-2 group-hover:bg-gradient-to-r group-hover:from-[#FFA69E] group-hover:to-[#AED9E0] group-hover:bg-clip-text group-hover:text-transparent transition-all">
                  {feature.title}
                </h3>
                <p className="text-[#5E6472]">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
