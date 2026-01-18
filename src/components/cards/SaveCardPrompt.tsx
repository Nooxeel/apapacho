'use client'

import { useState } from 'react'
import { CreditCard, X, Loader2, Shield } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores'

export interface SaveCardPromptProps {
  isOpen: boolean
  onClose: () => void
  tierName?: string
  creatorName?: string
}

interface InscriptionResponse {
  success: boolean
  urlWebpay?: string
  token?: string
  error?: string
}

export default function SaveCardPrompt({ 
  isOpen, 
  onClose, 
  tierName, 
  creatorName 
}: SaveCardPromptProps) {
  const [loading, setLoading] = useState(false)
  const { token } = useAuthStore()
  
  const handleSaveCard = async () => {
    if (!token) {
      console.error('No auth token')
      onClose()
      return
    }
    
    try {
      setLoading(true)
      const response = await api<InscriptionResponse>('/cards/inscribe', { 
        method: 'POST',
        token 
      })
      
      if (response.success && response.urlWebpay && response.token) {
        // Create a form and submit it (Transbank requires POST)
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = response.urlWebpay
        
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'TBK_TOKEN'
        input.value = response.token
        form.appendChild(input)
        
        document.body.appendChild(form)
        form.submit()
      } else {
        console.error('Error starting inscription:', response.error)
        onClose()
      }
    } catch (error) {
      console.error('Error:', error)
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] rounded-xl max-w-md w-full p-6 border border-[#333] relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-pink-400" />
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-semibold text-white text-center mb-2">
          ¿Deseas guardar tu tarjeta?
        </h2>
        
        {/* Description */}
        <p className="text-gray-400 text-center mb-4 text-sm">
          {tierName && creatorName ? (
            <>Guarda tu tarjeta para que tu suscripción a <span className="text-white font-medium">{tierName}</span> de <span className="text-white font-medium">{creatorName}</span> se renueve automáticamente.</>
          ) : (
            <>Guarda tu tarjeta para que tus suscripciones se renueven automáticamente y no pierdas acceso a tu contenido favorito.</>
          )}
        </p>
        
        {/* Benefits */}
        <div className="bg-[#0f0f0f] rounded-lg p-4 mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Shield className="h-4 w-4 text-green-400" />
            <span>Datos seguros en Transbank</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CreditCard className="h-4 w-4 text-blue-400" />
            <span>Renovación automática sin interrupciones</span>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSaveCard}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirigiendo...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Guardar Tarjeta
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 bg-[#333] text-gray-300 rounded-lg font-medium hover:bg-[#444] transition disabled:opacity-50"
          >
            Ahora no
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Puedes agregar o eliminar tarjetas en cualquier momento desde Configuración.
        </p>
      </div>
    </div>
  )
}
