/**
 * MercadoPago Payment Hook
 * 
 * Provides integration with MercadoPago Checkout Pro payments.
 * Creates a preference and redirects to MercadoPago's hosted checkout.
 */

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type PaymentType = 'SUBSCRIPTION' | 'DONATION' | 'TIP' | 'CONTENT' | 'TOKENS';

export interface CreateMPPaymentParams {
  amount: number;
  paymentType: PaymentType;
  subscriptionTierId?: string;
  creatorId?: string;
  donationMessage?: string;
  postId?: string;
}

export interface MPPaymentResult {
  success: boolean;
  preferenceId?: string;
  initPoint?: string;
  buyOrder?: string;
  transactionId?: string;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: { method?: string; body?: any; token?: string } = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error en la solicitud');
  }

  return response.json();
}

export function useMercadoPago() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  /**
   * Create a payment and redirect to MercadoPago Checkout Pro
   */
  const createPayment = useCallback(async (params: CreateMPPaymentParams): Promise<MPPaymentResult> => {
    if (!token) {
      return { success: false, error: 'Debes iniciar sesión para realizar un pago' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{
        success: boolean;
        preferenceId: string;
        initPoint: string;
        buyOrder: string;
        transactionId: string;
      }>('/payments/mercadopago/create', {
        method: 'POST',
        body: params,
        token,
      });

      if (response.success && response.initPoint) {
        console.log('[MercadoPago] ✅ Preference created, redirecting to MercadoPago...');
        
        // Redirect to MercadoPago Checkout Pro
        window.location.href = response.initPoint;

        return {
          success: true,
          preferenceId: response.preferenceId,
          initPoint: response.initPoint,
          buyOrder: response.buyOrder,
          transactionId: response.transactionId,
        };
      } else {
        throw new Error('Error al crear preferencia de pago');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar pago';
      setError(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Create subscription payment via MercadoPago
   */
  const payForSubscription = useCallback(async (
    subscriptionTierId: string,
    creatorId: string,
    amount: number
  ) => {
    return createPayment({
      amount,
      paymentType: 'SUBSCRIPTION',
      subscriptionTierId,
      creatorId,
    });
  }, [createPayment]);

  /**
   * Create donation payment via MercadoPago
   */
  const payForDonation = useCallback(async (
    creatorId: string,
    amount: number,
    message?: string
  ) => {
    return createPayment({
      amount,
      paymentType: 'DONATION',
      creatorId,
      donationMessage: message,
    });
  }, [createPayment]);

  /**
   * Create tip payment via MercadoPago
   */
  const payForTip = useCallback(async (
    creatorId: string,
    amount: number,
    message?: string
  ) => {
    return createPayment({
      amount,
      paymentType: 'TIP',
      creatorId,
      donationMessage: message,
    });
  }, [createPayment]);

  return {
    loading,
    error,
    createPayment,
    payForSubscription,
    payForDonation,
    payForTip,
  };
}
