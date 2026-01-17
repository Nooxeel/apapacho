import dynamic from 'next/dynamic'
import { HeroSection } from '@/components/landing/HeroSection'
import { Navbar } from '@/components/layout/Navbar'

// Lazy load below-fold components for better LCP
const FeaturesSection = dynamic(
  () => import('@/components/landing/FeaturesSection').then(mod => ({ default: mod.FeaturesSection })),
  { ssr: true }
)

const CreatorsShowcase = dynamic(
  () => import('@/components/landing/CreatorsShowcase').then(mod => ({ default: mod.CreatorsShowcase })),
  { ssr: true }
)

const Footer = dynamic(
  () => import('@/components/layout/Footer').then(mod => ({ default: mod.Footer })),
  { ssr: true }
)

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CreatorsShowcase />
      <Footer />
    </main>
  )
}
