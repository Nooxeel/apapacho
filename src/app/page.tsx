import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { HeroSection } from '@/components/landing/HeroSection'

// Navbar is a client component - load it without blocking the hero
const Navbar = dynamic(
  () => import('@/components/layout/Navbar').then(mod => ({ default: mod.Navbar })),
  { 
    ssr: true,
    loading: () => (
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-transparent" />
    )
  }
)

// Lazy load below-fold components for better LCP
// Using loading skeletons to prevent layout shift
const FeaturesSection = dynamic(
  () => import('@/components/landing/FeaturesSection').then(mod => ({ default: mod.FeaturesSection })),
  { 
    ssr: true,
    loading: () => <div className="h-96 bg-transparent" /> 
  }
)

const CreatorsShowcase = dynamic(
  () => import('@/components/landing/CreatorsShowcase').then(mod => ({ default: mod.CreatorsShowcase })),
  { 
    ssr: true,
    loading: () => <div className="h-96 bg-transparent" />
  }
)

const Footer = dynamic(
  () => import('@/components/layout/Footer').then(mod => ({ default: mod.Footer })),
  { 
    ssr: true,
    loading: () => <div className="h-32 bg-transparent" />
  }
)

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      {/* Hero is a pure Server Component - renders immediately without JS */}
      <HeroSection />
      <Suspense fallback={<div className="h-96 bg-transparent" />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-transparent" />}>
        <CreatorsShowcase />
      </Suspense>
      <Footer />
    </main>
  )
}
