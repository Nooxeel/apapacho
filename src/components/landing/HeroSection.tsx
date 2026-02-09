import Link from 'next/link'
import { CursorParticles } from '@/components/ui/CursorParticles'

// Server Component - No JavaScript sent to browser
// All styling is pure CSS, no client-side interactivity needed

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-gradient-to-b from-[#0d0d1a] via-[#12101f] to-[#1a1528]">
      {/* Background Effects - Simplified for faster paint */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Use CSS gradients instead of blur for instant paint */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full" />
      </div>

      {/* Cursor Particles Effect */}
      <CursorParticles />

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-10">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-sm text-purple-200/90 tracking-wide">Plataforma en crecimiento</span>
        </div>

        {/* Main Title - Uses system font first, then Poppins when loaded */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold mb-8 tracking-wide"
          style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}
        >
          <span className="text-white/95">Tu espacio,</span>
          <br />
          <span className="gradient-text">tu estilo</span>
        </h1>

        {/* Subtitle - This is the LCP element */}
        <p className="text-lg md:text-xl text-white/75 max-w-3xl mx-auto mb-12 leading-relaxed">
          ¿Recuerdas cuando tu perfil era realmente <span className="text-purple-300 font-medium">tuyo</span>?
          <br className="hidden md:block" />
          Música de fondo, colores personalizados, tu propio espacio.
          <br className="hidden md:block" />
          La nostalgia de MySpace con las herramientas de hoy.
        </p>

        {/* CTA Buttons - Pure HTML/CSS, no JS needed */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 px-8 py-4 text-base font-medium tracking-wide shadow-lg shadow-purple-500/25 rounded-xl text-white transition-all duration-200"
          >
            Crea tu Espacio
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center text-purple-200/80 hover:text-white hover:bg-purple-500/10 border border-purple-500/20 px-8 py-4 rounded-xl transition-all duration-200"
          >
            Ver Ejemplos
          </Link>
        </div>

        {/* Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Visually hidden h2 for accessibility - maintains heading hierarchy */}
          <h2 className="sr-only">Características principales</h2>
          <div className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-300">
            <div className="text-4xl mb-4" aria-hidden="true">🎨</div>
            <h3 className="text-lg font-semibold text-white/90 mb-3">Diseña sin límites</h3>
            <p className="text-white/70 text-sm leading-relaxed">Colores, fondos, layouts. Todo personalizable como en los 2000s</p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-300">
            <div className="text-4xl mb-4" aria-hidden="true">🎵</div>
            <h3 className="text-lg font-semibold text-white/90 mb-3">Tu soundtrack</h3>
            <p className="text-white/70 text-sm leading-relaxed">Agrega música a tu perfil. Hazlo tuyo con tu banda sonora favorita</p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-300">
            <div className="text-4xl mb-4" aria-hidden="true">💰</div>
            <h3 className="text-lg font-semibold text-white/90 mb-3">Monetiza tu arte</h3>
            <p className="text-white/70 text-sm leading-relaxed">Tu audiencia, tus reglas. Gana directamente de tus fans</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-purple-400/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
