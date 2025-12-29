'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { Search, Filter, TrendingUp, Heart, Star } from 'lucide-react';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explora <span className="gradient-text">Contenido</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Descubre los mejores creadores y contenido exclusivo
            </p>
          </div>

          {/* Coming Soon */}
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Próximamente
            </h2>
            <p className="text-white/60 mb-8">
              Estamos trabajando en crear la mejor experiencia de exploración para ti. 
              Mientras tanto, puedes ver todos los creadores disponibles.
            </p>
            <Link href="/creators">
              <Button variant="primary" size="lg">
                Ver Creadores
              </Button>
            </Link>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-fuchsia-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Tendencias</h3>
              <p className="text-white/60 text-sm">
                Descubre los creadores y contenido más populares del momento
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Recomendaciones</h3>
              <p className="text-white/60 text-sm">
                Contenido personalizado basado en tus intereses
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Destacados</h3>
              <p className="text-white/60 text-sm">
                Los mejores creadores verificados de la plataforma
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
