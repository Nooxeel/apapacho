/**
 * Webpay Payment Hook
 * 
 * Provides easy integration with Webpay Plus payments
 */

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type PaymentType = 'SUBSCRIPTION' | 'DONATION' | 'TIP' | 'CONTENT' | 'TOKENS';

export interface CreatePaymentParams {
  amount: number;
  paymentType: PaymentType;
  subscriptionTierId?: string;
  creatorId?: string;
  donationMessage?: string;
}

export interface PaymentResult {
  success: boolean;
  token?: string;
  url?: string;
  buyOrder?: string;
  transactionId?: string;
  formHtml?: string;
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

export function useWebpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  /**
   * Create a payment and redirect to Webpay
   * This will redirect the user away from the site to complete payment
   */
  const createPayment = useCallback(async (params: CreatePaymentParams): Promise<PaymentResult> => {
    if (!token) {
      return { success: false, error: 'Debes iniciar sesión para realizar un pago' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{
        success: boolean;
        token: string;
        url: string;
        buyOrder: string;
        transactionId: string;
        formHtml: string;
      }>('/payments/webpay/create', {
        method: 'POST',
        body: params,
        token,
      });

      if (response.success && response.url && response.token) {
        // Create form manually and submit to Webpay
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.url;
        form.style.display = 'none';
        
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = response.token;
        form.appendChild(tokenInput);
        
        document.body.appendChild(form);
        
        // Submit the form - this will redirect to Webpay
        form.submit();

        return {
          success: true,
          token: response.token,
          url: response.url,
          buyOrder: response.buyOrder,
          transactionId: response.transactionId,
        };
      } else {
        throw new Error('Error al crear pago');
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
   * Create subscription payment
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
   * Create donation payment
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
   * Create tip payment
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

  /**
   * Get payment status
   */
  const getPaymentStatus = useCallback(async (buyOrder: string) => {
    try {
      const response = await apiRequest<{
        success: boolean;
        status: string;
        amount: number;
        authorizationCode?: string;
        cardNumber?: string;
        errorMessage?: string;
      }>(`/payments/webpay/status/${buyOrder}`);
      return response;
    } catch (err) {
      return null;
    }
  }, []);

  /**
   * Get user's payment history
   */
  const getMyTransactions = useCallback(async (limit = 20, offset = 0) => {
    if (!token) return { transactions: [], total: 0 };

    try {
      const response = await apiRequest<{
        transactions: Array<{
          id: string;
          buyOrder: string;
          amount: number;
          paymentType: PaymentType;
          status: string;
          cardNumber?: string;
          createdAt: string;
          completedAt?: string;
        }>;
        total: number;
      }>(`/payments/webpay/my-transactions?limit=${limit}&offset=${offset}`, {
        token,
      });
      return response;
    } catch (err) {
      return { transactions: [], total: 0 };
    }
  }, [token]);

  return {
    loading,
    error,
    createPayment,
    payForSubscription,
    payForDonation,
    payForTip,
    getPaymentStatus,
    getMyTransactions,
  };
}
