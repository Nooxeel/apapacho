'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle, AlertTriangle, Mail } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('No se proporcionó un token de verificación')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al verificar el email')
        }

        setStatus('success')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Error al verificar el email')
      }
    }

    verifyEmail()
  }, [token, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10 text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Verificando tu email...
            </h1>
            
            <p className="text-gray-400">
              Por favor espera mientras confirmamos tu dirección de correo.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              ¡Email verificado! 🎉
            </h1>
            
            <p className="text-gray-400 mb-6">
              Tu cuenta ha sido verificada exitosamente. 
              Serás redirigido al inicio de sesión...
            </p>
            
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Error de verificación
          </h1>
          
          <p className="text-gray-400 mb-6">
            {error}
          </p>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              <Mail className="w-5 h-5" />
              Ir al inicio de sesión
            </Link>
            
            <p className="text-sm text-gray-500">
              Si el problema persiste, contacta a soporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
