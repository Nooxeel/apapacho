/**
 * Flow Payment Hook
 *
 * Integración con Flow (flow.cl) para pagos por redirect.
 * Crea una orden de pago en el backend, luego redirige al checkout hospedado de Flow.
 *
 * Espeja useFintoc.ts: mismo patrón de auth (credentials:'include' + X-Requested-With),
 * mismos métodos públicos (payForSubscription / payForDonation / payForTip / getPaymentStatus).
 *
 * NOTE (R0-05): JWT en cookie httpOnly; auth viaja vía `credentials: 'include'`
 * + `X-Requested-With`. Migración al wrapper api() compartido: R1-08.
 */

import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export type PaymentType = 'SUBSCRIPTION' | 'DONATION' | 'TIP' | 'CONTENT' | 'TOKENS'

export interface CreateFlowPaymentParams {
  amount: number
  paymentType: PaymentType
  subscriptionTierId?: string
  creatorId?: string
  donationMessage?: string
  postId?: string
}

export interface FlowPaymentResult {
  success: boolean
  redirectUrl?: string
  commerceOrder?: string
  transactionId?: string
  error?: string
}

async function apiRequest<T>(
  endpoint: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'GET', body } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(error.error || 'Error en la solicitud')
  }

  return response.json()
}

export function useFlow() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuthStore()

  /**
   * Crea una orden de pago en Flow y redirige al checkout hospedado.
   * El backend devuelve { redirectUrl, commerceOrder, transactionId }.
   */
  const createPayment = useCallback(
    async (params: CreateFlowPaymentParams): Promise<FlowPaymentResult> => {
      if (!isAuthenticated) {
        return { success: false, error: 'Debes iniciar sesión para realizar un pago' }
      }

      setLoading(true)
      setError(null)

      try {
        const response = await apiRequest<{
          success: boolean
          redirectUrl: string
          commerceOrder: string
          transactionId: string
          gateway: string
        }>('/payments/flow/create', {
          method: 'POST',
          body: params,
        })

        if (response.success && response.redirectUrl) {
          // Redirigir al checkout hospedado de Flow
          window.location.href = response.redirectUrl

          return {
            success: true,
            redirectUrl: response.redirectUrl,
            commerceOrder: response.commerceOrder,
            transactionId: response.transactionId,
          }
        } else {
          throw new Error('Error al crear orden de pago')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al procesar pago'
        setError(message)
        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated]
  )

  const payForSubscription = useCallback(
    async (subscriptionTierId: string, creatorId: string, amount: number) => {
      return createPayment({
        amount,
        paymentType: 'SUBSCRIPTION',
        subscriptionTierId,
        creatorId,
      })
    },
    [createPayment]
  )

  const payForDonation = useCallback(
    async (creatorId: string, amount: number, message?: string) => {
      return createPayment({
        amount,
        paymentType: 'DONATION',
        creatorId,
        donationMessage: message,
      })
    },
    [createPayment]
  )

  const payForTip = useCallback(
    async (creatorId: string, amount: number, message?: string) => {
      return createPayment({
        amount,
        paymentType: 'TIP',
        creatorId,
        donationMessage: message,
      })
    },
    [createPayment]
  )

  const getPaymentStatus = useCallback(async (commerceOrder: string) => {
    try {
      const response = await apiRequest<{
        success: boolean
        status: string
        amount: number
        errorMessage?: string
      }>(`/payments/flow/status/${commerceOrder}`)
      return response
    } catch {
      return null
    }
  }, [])

  return {
    loading,
    error,
    createPayment,
    payForSubscription,
    payForDonation,
    payForTip,
    getPaymentStatus,
  }
}
