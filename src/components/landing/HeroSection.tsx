import Link from 'next/link'
import { Button } from '@/components/ui'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-[#0f0f14]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
          <span className="text-sm text-white/80">Plataforma en crecimiento</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
          <span className="text-white">Tu espacio,</span>
          <br />
          <span className="gradient-text">tu estilo</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10">
          ¿Recuerdas cuando tu perfil era realmente <span className="font-semibold">tuyo</span>?
          <br />
          Música de fondo, colores personalizados, tu propio espacio.
          <br />
          La nostalgia de MySpace con las herramientas de hoy.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/login">
            <Button variant="primary" size="lg">
              Crea tu Espacio
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" size="lg">
              Ver Ejemplos
            </Button>
          </Link>
        </div>

        {/* Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="text-lg font-semibold text-white mb-2">Diseña sin límites</h3>
            <p className="text-white/60 text-sm">Colores, fondos, layouts. Todo personalizable como en los 2000s</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-2">🎵</div>
            <h3 className="text-lg font-semibold text-white mb-2">Tu soundtrack</h3>
            <p className="text-white/60 text-sm">Agrega música a tu perfil. Hazlo tuyo con tu banda sonora favorita</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-lg font-semibold text-white mb-2">Monetiza tu arte</h3>
            <p className="text-white/60 text-sm">Tu audiencia, tus reglas. Gana directamente de tus fans</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  )
}
