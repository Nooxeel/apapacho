/**
 * Fintoc Payment Hook
 *
 * Provides integration with Fintoc Checkout Sessions.
 * Creates a checkout session via backend, then redirects to Fintoc hosted checkout.
 */

import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// NOTE (R0-05): The JWT now lives in an httpOnly cookie; auth travels via
// `credentials: 'include'` + `X-Requested-With`. Full migration to the
// shared `api()` wrapper is tracked in R1-08.

export type PaymentType = 'SUBSCRIPTION' | 'DONATION' | 'TIP' | 'CONTENT' | 'TOKENS'

export interface CreateFintocPaymentParams {
  amount: number
  paymentType: PaymentType
  subscriptionTierId?: string
  creatorId?: string
  donationMessage?: string
  postId?: string
}

export interface FintocPaymentResult {
  success: boolean
  redirectUrl?: string
  buyOrder?: string
  transactionId?: string
  checkoutSessionId?: string
  error?: string
}

async function apiRequest<T>(
  endpoint: string,
  options: { method?: string; body?: any } = {}
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

export function useFintoc() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuthStore()

  /**
   * Create a Fintoc checkout session and redirect to payment
   */
  const createPayment = useCallback(
    async (params: CreateFintocPaymentParams): Promise<FintocPaymentResult> => {
      if (!isAuthenticated) {
        return { success: false, error: 'Debes iniciar sesión para realizar un pago' }
      }

      setLoading(true)
      setError(null)

      try {
        const response = await apiRequest<{
          success: boolean
          redirectUrl: string
          buyOrder: string
          transactionId: string
          checkoutSessionId: string
          gateway: string
        }>('/payments/fintoc/create', {
          method: 'POST',
          body: params,
        })

        if (response.success && response.redirectUrl) {
          // Redirect to Fintoc hosted checkout
          window.location.href = response.redirectUrl

          return {
            success: true,
            redirectUrl: response.redirectUrl,
            buyOrder: response.buyOrder,
            transactionId: response.transactionId,
            checkoutSessionId: response.checkoutSessionId,
          }
        } else {
          throw new Error('Error al crear sesión de pago')
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

  const getPaymentStatus = useCallback(async (buyOrder: string) => {
    try {
      const response = await apiRequest<{
        success: boolean
        status: string
        amount: number
        errorMessage?: string
      }>(`/payments/fintoc/status/${buyOrder}`)
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
