/**
 * Unified Payment Hook
 * 
 * Wraps both Webpay and MercadoPago payment methods.
 * Provides a single interface for initiating payments with either gateway.
 * 
 * Usage:
 *   const { payForSubscription, loading, error, gateway, setGateway } = usePayment();
 *   
 *   // User selects gateway in UI
 *   setGateway('mercadopago');
 *   
 *   // Payment uses selected gateway
 *   await payForSubscription(tierId, creatorId, amount);
 */

import { useState, useCallback } from 'react';
import { useWebpay } from './useWebpay';
import { useMercadoPago } from './useMercadoPago';

export type PaymentGateway = 'webpay' | 'mercadopago';

export function usePayment(defaultGateway: PaymentGateway = 'webpay') {
  const [gateway, setGateway] = useState<PaymentGateway>(defaultGateway);

  const webpay = useWebpay();
  const mercadoPago = useMercadoPago();

  const loading = gateway === 'webpay' ? webpay.loading : mercadoPago.loading;
  const error = gateway === 'webpay' ? webpay.error : mercadoPago.error;

  const payForSubscription = useCallback(async (
    subscriptionTierId: string,
    creatorId: string,
    amount: number
  ) => {
    if (gateway === 'mercadopago') {
      return mercadoPago.payForSubscription(subscriptionTierId, creatorId, amount);
    }
    return webpay.payForSubscription(subscriptionTierId, creatorId, amount);
  }, [gateway, webpay.payForSubscription, mercadoPago.payForSubscription]);

  const payForDonation = useCallback(async (
    creatorId: string,
    amount: number,
    message?: string
  ) => {
    if (gateway === 'mercadopago') {
      return mercadoPago.payForDonation(creatorId, amount, message);
    }
    return webpay.payForDonation(creatorId, amount, message);
  }, [gateway, webpay.payForDonation, mercadoPago.payForDonation]);

  const payForTip = useCallback(async (
    creatorId: string,
    amount: number,
    message?: string
  ) => {
    if (gateway === 'mercadopago') {
      return mercadoPago.payForTip(creatorId, amount, message);
    }
    return webpay.payForTip(creatorId, amount, message);
  }, [gateway, webpay.payForTip, mercadoPago.payForTip]);

  return {
    gateway,
    setGateway,
    loading,
    error,
    payForSubscription,
    payForDonation,
    payForTip,
    // Expose individual gateway hooks for advanced usage
    webpay,
    mercadoPago,
  };
}
