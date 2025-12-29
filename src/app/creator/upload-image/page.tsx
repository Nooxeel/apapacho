'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Navbar, Footer } from '@/components/layout'
import { ImageUpload } from '@/components/profile'
import { useAuthStore } from '@/stores'

export default function UploadImagePage() {
  const router = useRouter()
  const { token, user, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    
    if (!token || !user?.isCreator) {
      router.push('/login')
    }
  }, [token, user, hasHydrated, router])

  if (!hasHydrated || !token || !user?.isCreator) {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0f0f14] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Dashboard
          </button>

          <ImageUpload />
        </div>
      </div>
      <Footer />
    </>
  )
}
