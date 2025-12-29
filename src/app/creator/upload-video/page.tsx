'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Navbar, Footer } from '@/components/layout'
import { VideoUpload } from '@/components/profile/VideoUpload'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UploadVideoPage() {
  const router = useRouter()
  const { token, user, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    
    if (!token || !user?.isCreator) {
      router.push('/login')
    }
  }, [token, user, hasHydrated, router])

  if (!hasHydrated || !token || !user?.isCreator) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </Link>

        {/* Upload Component */}
        <VideoUpload
          onSuccess={(videoUrl) => {
            console.log('Video uploaded:', videoUrl)
            router.push('/dashboard')
          }}
        />
      </div>

      <Footer />
    </div>
  )
}
