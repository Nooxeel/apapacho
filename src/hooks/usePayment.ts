/**
 * Unified Payment Hook
 *
 * Wraps Webpay, MercadoPago, and Fintoc payment methods.
 * Provides a single interface for initiating payments with any gateway.
 *
 * Usage:
 *   const { payForSubscription, loading, error, gateway, setGateway } = usePayment();
 *
 *   // User selects gateway in UI
 *   setGateway('fintoc');
 *
 *   // Payment uses selected gateway
 *   await payForSubscription(tierId, creatorId, amount);
 */

import { useState, useCallback } from 'react';
import { useWebpay } from './useWebpay';
import { useMercadoPago } from './useMercadoPago';
import { useFintoc } from './useFintoc';

export type PaymentGateway = 'webpay' | 'mercadopago' | 'fintoc';

export function usePayment(defaultGateway: PaymentGateway = 'fintoc') {
  const [gateway, setGateway] = useState<PaymentGateway>(defaultGateway);

  const webpay = useWebpay();
  const mercadoPago = useMercadoPago();
  const fintoc = useFintoc();

  const loading = gateway === 'webpay'
    ? webpay.loading
    : gateway === 'mercadopago'
    ? mercadoPago.loading
    : fintoc.loading;

  const error = gateway === 'webpay'
    ? webpay.error
    : gateway === 'mercadopago'
    ? mercadoPago.error
    : fintoc.error;

  const payForSubscription = useCallback(async (
    subscriptionTierId: string,
    creatorId: string,
    amount: number
  ) => {
    if (gateway === 'mercadopago') {
      return mercadoPago.payForSubscription(subscriptionTierId, creatorId, amount);
    }
    if (gateway === 'fintoc') {
      return fintoc.payForSubscription(subscriptionTierId, creatorId, amount);
    }
    return webpay.payForSubscription(subscriptionTierId, creatorId, amount);
  }, [gateway, webpay.payForSubscription, mercadoPago.payForSubscription, fintoc.payForSubscription]);

  const payForDonation = useCallback(async (
    creatorId: string,
    amount: number,
    message?: string
  ) => {
    if (gateway === 'mercadopago') {
      return mercadoPago.payForDonation(creatorId, amount, message);
    }
    if (gateway === 'fintoc') {
      return fintoc.payForDonation(creatorId, amount, message);
    }
    return webpay.payForDonation(creatorId, amount, message);
  }, [gateway, webpay.payForDonation, mercadoPago.payForDonation, fintoc.payForDonation]);

  const payForTip = useCallback(async (
    creatorId: string,
    amount: number,
    message?: string
  ) => {
    if (gateway === 'mercadopago') {
      return mercadoPago.payForTip(creatorId, amount, message);
    }
    if (gateway === 'fintoc') {
      return fintoc.payForTip(creatorId, amount, message);
    }
    return webpay.payForTip(creatorId, amount, message);
  }, [gateway, webpay.payForTip, mercadoPago.payForTip, fintoc.payForTip]);

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
    fintoc,
  };
}
