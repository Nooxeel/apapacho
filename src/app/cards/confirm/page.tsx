'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, CreditCard, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import Link from 'next/link'

type ConfirmationState = 'loading' | 'success' | 'error'

interface CardInfo {
  id: string
  type: string
  lastFour: string
}

interface ConfirmResponse {
  success: boolean
  card?: CardInfo
  error?: string
}

function ConfirmCardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, hasHydrated } = useAuthStore()
  
  const [state, setState] = useState<ConfirmationState>('loading')
  const [card, setCard] = useState<CardInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  
  useEffect(() => {
    if (!hasHydrated) return
    
    if (!token) {
      router.push('/login')
      return
    }
    
    // Get token from URL (TBK_TOKEN from Transbank)
    const tbkToken = searchParams.get('TBK_TOKEN') || searchParams.get('token_ws')
    
    if (!tbkToken) {
      setState('error')
      setErrorMessage('No se recibió token de confirmación')
      return
    }
    
    confirmInscription(tbkToken)
  }, [hasHydrated, token, searchParams, router])
  
  const confirmInscription = async (tbkToken: string) => {
    if (!token) return
    
    try {
      const response = await api<ConfirmResponse>('/cards/confirm', { 
        method: 'POST',
        body: { token: tbkToken },
        token
      })
      
      if (response.success && response.card) {
        setCard(response.card)
        setState('success')
      } else {
        setState('error')
        setErrorMessage(response.error || 'Error al confirmar la tarjeta')
      }
    } catch (err: any) {
      setState('error')
      setErrorMessage(err.message || 'Error de conexión')
    }
  }
  
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] rounded-xl p-8 border border-[#333]">
        {state === 'loading' && (
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-pink-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-2">
              Confirmando tarjeta...
            </h1>
            <p className="text-gray-400">
              Por favor espera mientras verificamos tu tarjeta con Transbank
            </p>
          </div>
        )}
        
        {state === 'success' && card && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            
            <h1 className="text-xl font-semibold text-white mb-2">
              ¡Tarjeta guardada exitosamente!
            </h1>
            
            <p className="text-gray-400 mb-6">
              Tu tarjeta ha sido registrada para pagos automáticos
            </p>
            
            <div className="bg-[#0f0f0f] rounded-lg p-4 mb-6 flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{card.type}</p>
                <p className="text-gray-400 text-sm">•••• •••• •••• {card.lastFour}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/settings"
                className="block w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition"
              >
                Ir a Configuración
              </Link>
              
              <Link
                href="/creators"
                className="block w-full py-3 px-4 bg-[#333] text-white rounded-lg font-medium hover:bg-[#444] transition"
              >
                Explorar Creadores
              </Link>
            </div>
          </div>
        )}
        
        {state === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            
            <h1 className="text-xl font-semibold text-white mb-2">
              Error al guardar tarjeta
            </h1>
            
            <p className="text-gray-400 mb-6">
              {errorMessage || 'No pudimos registrar tu tarjeta. Por favor intenta de nuevo.'}
            </p>
            
            <div className="space-y-3">
              <Link
                href="/settings"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Configuración
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConfirmCardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    }>
      <ConfirmCardContent />
    </Suspense>
  )
}
