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
  const [step, setStep] = useState<'confirm' | 'birthdate'>('confirm')
  const [birthdate, setBirthdate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  // Check verification status on mount
  useEffect(() => {
    if (!hasHydrated) return
    
    const checkStatus = async () => {
      if (!token) {
        // Not logged in - show simple age gate
        setIsVerified(false)
        setStep('confirm')
        return
      }

      try {
        const status = await ageVerificationApi.getStatus(token)
        if (status.verified) {
          setIsVerified(true)
          onVerified?.()
        } else {
          setIsVerified(false)
          setStep(status.hasBirthdate ? 'confirm' : 'birthdate')
        }
      } catch {
        setIsVerified(false)
      }
    }

    checkStatus()
  }, [token, hasHydrated, onVerified])

  const handleConfirm = async () => {
    // For logged-in users, call confirm endpoint
    if (token) {
      setLoading(true)
      setError('')
      
      try {
        const result = await ageVerificationApi.confirm(token)
        if (result.verified) {
          setIsVerified(true)
          onVerified?.()
        }
      } catch (err) {
        // Need full verification
        setStep('birthdate')
      } finally {
        setLoading(false)
      }
    } else {
      // For anonymous users, just accept their confirmation (stored in localStorage)
      localStorage.setItem('ageVerified', 'true')
      setIsVerified(true)
      onVerified?.()
    }
  }

  const handleBirthdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!birthdate) {
      setError('Por favor ingresa tu fecha de nacimiento')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (token) {
        const result = await ageVerificationApi.verify(birthdate, token)
        if (result.verified) {
          setIsVerified(true)
          onVerified?.()
        }
      } else {
        // Calculate age locally for anonymous users
        const birth = new Date(birthdate)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--
        }

        if (age < 18) {
          setError('Debes tener al menos 18 años para acceder a esta plataforma')
        } else {
          localStorage.setItem('ageVerified', 'true')
          setIsVerified(true)
          onVerified?.()
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al verificar edad'
      setError(errorMessage)
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
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          {step === 'confirm' ? (
            <div className="flex items-start gap-4">
              {/* Warning Icon */}
              <div className="w-12 h-12 bg-fuchsia-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  🔞 Contenido para Adultos
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Esta plataforma contiene contenido explícito para adultos mayores de 18 años. 
                  Al continuar, confirmas que tienes al menos <span className="text-fuchsia-400 font-bold">18 años</span> de edad.{' '}
                  <a href="/terminos" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                    Términos de Servicio
                  </a>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm whitespace-nowrap"
                >
                  {loading ? 'Verificando...' : 'Sí, tengo 18+ años'}
                </button>
                
                <button
                  onClick={handleDecline}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all text-sm whitespace-nowrap"
                >
                  Salir
                </button>
              </div>
            </div>
          ) : (
            /* Birthdate verification form */
            <form onSubmit={handleBirthdateSubmit} className="flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 bg-fuchsia-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1">
                  🔞 Verificación de Edad
                </h3>
                <p className="text-gray-400 text-sm">
                  Por favor ingresa tu fecha de nacimiento para verificar tu edad.
                </p>
                {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-fuchsia-500"
                  required
                />
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm whitespace-nowrap"
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>
                
                <button
                  type="button"
                  onClick={handleDecline}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all text-sm whitespace-nowrap"
                >
                  Salir
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgeVerificationModal
