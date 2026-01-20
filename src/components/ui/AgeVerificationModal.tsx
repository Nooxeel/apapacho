'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores'
import { ageVerificationApi } from '@/lib/api'

interface AgeVerificationModalProps {
  onVerified?: () => void
  onClose?: () => void
}

export function AgeVerificationModal({ onVerified, onClose }: AgeVerificationModalProps) {
  const { token, hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  // Check verification status on mount
  useEffect(() => {
    if (!hasHydrated) return
    
    const checkStatus = async () => {
      // Check localStorage first for anonymous users
      if (localStorage.getItem('ageVerified') === 'true') {
        setIsVerified(true)
        onVerified?.()
        return
      }

      if (!token) {
        // Not logged in - show age gate
        setIsVerified(false)
        return
      }

      try {
        const status = await ageVerificationApi.getStatus(token)
        if (status.verified) {
          setIsVerified(true)
          onVerified?.()
        } else {
          setIsVerified(false)
        }
      } catch {
        setIsVerified(false)
      }
    }

    checkStatus()
  }, [token, hasHydrated, onVerified])

  const handleConfirm = async () => {
    setLoading(true)
    
    try {
      if (token) {
        // For logged-in users, call confirm endpoint
        const result = await ageVerificationApi.confirm(token)
        if (result.verified) {
          setIsVerified(true)
          onVerified?.()
        }
      } else {
        // For anonymous users, just store in localStorage
        localStorage.setItem('ageVerified', 'true')
        setIsVerified(true)
        onVerified?.()
      }
    } catch (err) {
      // Even on error, accept for anonymous (better UX)
      if (!token) {
        localStorage.setItem('ageVerified', 'true')
        setIsVerified(true)
        onVerified?.()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = () => {
    window.location.href = 'https://google.com'
  }

  // Don't render if already verified
  if (isVerified === true) {
    return null
  }

  // Don't render until we check status
  if (isVerified === null) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
        <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-3 border-fuchsia-500 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-2 sm:p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
            {/* Warning Icon - hidden on mobile to save space */}
            <div className="hidden sm:flex w-12 h-12 bg-fuchsia-500/20 rounded-full items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                🔞 Contenido para Adultos
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Esta plataforma contiene contenido explícito para adultos mayores de 18 años. 
                Al continuar, confirmas que tienes al menos <span className="text-fuchsia-400 font-bold">18 años</span>.{' '}
                <a href="/terminos" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  Términos
                </a>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-2 flex-shrink-0 mt-2 sm:mt-0">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
              >
                {loading ? 'Verificando...' : 'Sí, tengo 18+ años'}
              </button>
              
              <button
                onClick={handleDecline}
                className="px-4 sm:px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all text-xs sm:text-sm whitespace-nowrap"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgeVerificationModal
