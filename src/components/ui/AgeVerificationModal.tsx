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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
        <div className="animate-spin w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-8 text-center">
        {/* Warning Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Contenido para Adultos
        </h2>

        <p className="text-zinc-400 mb-6">
          Esta plataforma contiene contenido explícito para adultos mayores de 18 años.
        </p>

        {step === 'confirm' ? (
          <>
            <p className="text-zinc-300 mb-8">
              Al continuar, confirmas que tienes al menos <span className="text-fuchsia-400 font-bold">18 años</span> de edad y que es legal ver este tipo de contenido en tu jurisdicción.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Sí, tengo 18+ años'}
              </button>
              
              <button
                onClick={handleDecline}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
              >
                No, salir del sitio
              </button>
            </div>

            {token && (
              <button
                onClick={() => setStep('birthdate')}
                className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 underline"
              >
                Verificar con fecha de nacimiento
              </button>
            )}
          </>
        ) : (
          <form onSubmit={handleBirthdateSubmit}>
            <p className="text-zinc-300 mb-6">
              Por favor ingresa tu fecha de nacimiento para verificar tu edad.
            </p>

            <div className="mb-6">
              <label className="block text-sm text-zinc-400 mb-2 text-left">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-fuchsia-500"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar Edad'}
              </button>
              
              <button
                type="button"
                onClick={handleDecline}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
              >
                Salir del sitio
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 underline"
            >
              Volver
            </button>
          </form>
        )}

        {/* Legal disclaimer */}
        <p className="mt-6 text-xs text-zinc-600">
          Al acceder aceptas nuestros{' '}
          <a href="/terminos" className="text-zinc-500 hover:text-zinc-300">
            Términos de Servicio
          </a>
        </p>
      </div>
    </div>
  )
}

export default AgeVerificationModal
