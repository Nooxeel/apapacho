import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Calendar, Clock, ArrowRight, TrendingUp, DollarSign, Shield, Users } from 'lucide-react';

// Artículos del blog - en producción esto vendría de un CMS o base de datos
const articles = [
  {
    slug: 'como-ganar-dinero-contenido-adulto-chile',
    title: 'Cómo Ganar Dinero con Contenido Adulto en Chile 2026',
    excerpt: 'Guía completa para empezar a monetizar tu contenido adulto en Chile. Descubre las mejores estrategias, plataformas y consejos legales.',
    category: 'Guía',
    readTime: '8 min',
    date: '2026-01-15',
    featured: true,
    icon: DollarSign,
  },
  {
    slug: 'alternativas-onlyfans-latinoamerica',
    title: 'Las Mejores Alternativas a OnlyFans en Latinoamérica',
    excerpt: 'Comparativa de plataformas de contenido adulto disponibles en LATAM. Comisiones, métodos de pago y ventajas de cada una.',
    category: 'Comparativa',
    readTime: '6 min',
    date: '2026-01-10',
    featured: true,
    icon: TrendingUp,
  },
  {
    slug: 'proteger-contenido-adulto-pirateria',
    title: 'Cómo Proteger tu Contenido de la Piratería',
    excerpt: 'Técnicas y herramientas para evitar que roben tu contenido. Marcas de agua, DMCA y acciones legales en Chile.',
    category: 'Seguridad',
    readTime: '5 min',
    date: '2026-01-05',
    featured: false,
    icon: Shield,
  },
  {
    slug: 'conseguir-suscriptores-contenido-adulto',
    title: '10 Estrategias para Conseguir Más Suscriptores',
    excerpt: 'Tácticas probadas para aumentar tu base de fans. Redes sociales, promociones y engagement efectivo.',
    category: 'Marketing',
    readTime: '7 min',
    date: '2025-12-28',
    featured: false,
    icon: Users,
  },
  {
    slug: 'impuestos-creadores-contenido-chile',
    title: 'Guía de Impuestos para Creadores en Chile',
    excerpt: 'Todo lo que necesitas saber sobre tributación como creador de contenido. Boletas, SII e inicio de actividades.',
    category: 'Legal',
    readTime: '10 min',
    date: '2025-12-20',
    featured: false,
    icon: DollarSign,
  },
];

export default function BlogPage() {
  const featuredArticles = articles.filter(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d0d1a] to-[#1a1a2e]">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Blog para <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Creadores</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Guías, consejos y estrategias para monetizar tu contenido adulto en Chile y Latinoamérica
            </p>
          </div>

          {/* Featured Articles */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-pink-500" />
              Artículos Destacados
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => {
                const IconComponent = article.icon;
                return (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500" />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-pink-500/20">
                          <IconComponent className="w-5 h-5 text-pink-400" />
                        </div>
                        <span className="text-sm text-pink-400 font-medium">{article.category}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-white/60 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-white/40">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.date).toLocaleDateString('es-CL')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-pink-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* All Articles */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Todos los Artículos
            </h2>
            <div className="grid gap-4">
              {regularArticles.map((article) => {
                const IconComponent = article.icon;
                return (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    className="group flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-pink-500/50 transition-all"
                  >
                    <div className="p-3 rounded-lg bg-white/5 group-hover:bg-pink-500/20 transition-colors">
                      <IconComponent className="w-6 h-6 text-white/60 group-hover:text-pink-400 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-pink-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-white/50 text-sm line-clamp-1">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm text-white/40">
                      <span>{article.category}</span>
                      <span>{article.readTime}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 text-center p-8 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl border border-pink-500/30">
            <h2 className="text-2xl font-bold text-white mb-3">
              ¿Listo para empezar a ganar?
            </h2>
            <p className="text-white/60 mb-6">
              Únete a Apapacho y comienza a monetizar tu contenido con la comisión más baja del mercado.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
