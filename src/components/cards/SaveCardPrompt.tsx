'use client'

import { useState } from 'react'
import { CreditCard, Loader2, Shield } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores'
import { Dialog } from '@/components/ui/Dialog'

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
  creatorName,
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
        token,
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

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="¿Deseas guardar tu tarjeta?"
      size="md"
      closeOnOverlay={!loading}
      closeOnEscape={!loading}
      showCloseButton={!loading}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        aria-hidden="true"
      >
        <CreditCard className="h-8 w-8 text-pink-400" />
      </div>

      {/* Description */}
      <p className="text-gray-400 text-center mb-4 text-sm">
        {tierName && creatorName ? (
          <>
            Guarda tu tarjeta para que tu suscripción a{' '}
            <span className="text-white font-medium">{tierName}</span> de{' '}
            <span className="text-white font-medium">{creatorName}</span> se renueve
            automáticamente.
          </>
        ) : (
          <>
            Guarda tu tarjeta para que tus suscripciones se renueven automáticamente y
            no pierdas acceso a tu contenido favorito.
          </>
        )}
      </p>

      {/* Benefits */}
      <div className="bg-[#0f0f0f] rounded-lg p-4 mb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Shield className="h-4 w-4 text-green-400" aria-hidden="true" />
          <span>Datos seguros en Transbank</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <CreditCard className="h-4 w-4 text-blue-400" aria-hidden="true" />
          <span>Renovación automática sin interrupciones</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleSaveCard}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Redirigiendo...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Guardar Tarjeta
            </>
          )}
        </button>

        <button
          type="button"
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
    </Dialog>
  )
}
