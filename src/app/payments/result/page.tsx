'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Home, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { SaveCardPrompt } from '@/components/cards';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type PaymentStatus = 'AUTHORIZED' | 'APPROVED' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' | 'PENDING' | 'REVERSED' | 'REFUNDED' | 'REJECTED' | 'IN_PROCESS';

interface PaymentDetails {
  status: PaymentStatus;
  success: boolean;
  buyOrder: string;
  amount: number;
  transactionId: string;
  authorizationCode?: string;
  cardNumber?: string;
  error?: string;
  paymentType?: string;
  redirectTo?: string;
}

interface CardsCheckResponse { 
  success: boolean; 
  cards?: { id: string }[] 
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, hasHydrated, isRefreshing } = useAuthStore();
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaveCardPrompt, setShowSaveCardPrompt] = useState(false);
  const [hasSavedCards, setHasSavedCards] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Effect 1: Confirm payment with backend (doesn't need auth)
  useEffect(() => {
    const confirmPayment = async () => {
      // Detect gateway from URL params
      const gateway = searchParams.get('gateway');
      
      // ==================== MERCADOPAGO FLOW ====================
      if (gateway === 'mercadopago') {
        const mpStatus = searchParams.get('status') || searchParams.get('collection_status');
        const externalReference = searchParams.get('external_reference');
        const paymentId = searchParams.get('collection_id') || searchParams.get('payment_id');
        const errorParam = searchParams.get('error');
        
        // Handle error from redirect
        if (errorParam && !externalReference) {
          setError(errorParam === 'unknown_state' 
            ? 'Estado de pago desconocido' 
            : decodeURIComponent(errorParam));
          setLoading(false);
          return;
        }
        
        // If we have payment details in URL params (redirected from backend)
        const successParam = searchParams.get('success');
        const buyOrderParam = searchParams.get('buyOrder');
        const amountParam = searchParams.get('amount');
        
        if (successParam && buyOrderParam) {
          const isSuccess = successParam === 'true';
          setDetails({
            status: isSuccess ? 'APPROVED' : (mpStatus?.toUpperCase() as PaymentStatus || 'FAILED'),
            success: isSuccess,
            buyOrder: buyOrderParam,
            amount: parseInt(amountParam || '0'),
            transactionId: searchParams.get('transactionId') || '',
            cardNumber: searchParams.get('cardNumber') || undefined,
            paymentType: searchParams.get('paymentType') || undefined,
            redirectTo: searchParams.get('redirectTo') || undefined,
            error: errorParam ? decodeURIComponent(errorParam) : undefined,
          });
          if (isSuccess) {
            setPaymentConfirmed(true);
            const redirectTo = searchParams.get('redirectTo');
            if (redirectTo) setRedirectCountdown(5);
          }
          setLoading(false);
          return;
        }
        
        // If we have a payment ID, confirm with backend
        if (paymentId && paymentId !== 'null') {
          try {
            const response = await fetch(
              `${API_URL}/payments/mercadopago/return?collection_id=${paymentId}&external_reference=${externalReference || ''}&status=${mpStatus || ''}`,
              { headers: { 'Accept': 'application/json' } }
            );
            const data = await response.json();
            
            if (data.success) {
              setDetails({
                status: 'APPROVED',
                success: true,
                buyOrder: data.buyOrder || '',
                amount: data.amount || 0,
                transactionId: data.transactionId || '',
                cardNumber: data.cardLastFour,
                paymentType: data.paymentType,
                redirectTo: data.redirectTo,
              });
              setPaymentConfirmed(true);
              if (data.redirectTo) setRedirectCountdown(5);
            } else {
              setDetails({
                status: (data.status as PaymentStatus) || 'FAILED',
                success: false,
                buyOrder: data.buyOrder || '',
                amount: data.amount || 0,
                transactionId: data.transactionId || '',
                error: data.error || 'El pago no pudo ser procesado',
              });
            }
          } catch (err) {
            console.error('[PaymentResult] Error confirming MercadoPago payment:', err);
            setError('Error al confirmar el pago. Por favor contacta a soporte.');
          }
          setLoading(false);
          return;
        }
        
        // If we only have external_reference and status
        if (externalReference) {
          try {
            const response = await fetch(
              `${API_URL}/payments/mercadopago/return?external_reference=${externalReference}&status=${mpStatus || ''}`,
              { headers: { 'Accept': 'application/json' } }
            );
            const data = await response.json();
            
            setDetails({
              status: data.success ? 'APPROVED' : ((data.status as PaymentStatus) || 'FAILED'),
              success: data.success || false,
              buyOrder: data.buyOrder || externalReference,
              amount: data.amount || 0,
              transactionId: data.transactionId || '',
              error: data.error,
            });
            if (data.success) {
              setPaymentConfirmed(true);
              if (data.redirectTo) setRedirectCountdown(5);
            }
          } catch (err) {
            // Fallback: use URL params directly
            const isApproved = mpStatus === 'approved';
            setDetails({
              status: isApproved ? 'APPROVED' : 'FAILED',
              success: isApproved,
              buyOrder: externalReference,
              amount: 0,
              transactionId: '',
              error: isApproved ? undefined : 'El pago no pudo ser procesado',
            });
            if (isApproved) setPaymentConfirmed(true);
          }
          setLoading(false);
          return;
        }
        
        // No valid MercadoPago parameters
        setError('No se encontraron datos de pago válidos.');
        setLoading(false);
        return;
      }
      
      // ==================== WEBPAY FLOW (existing) ====================
      // Get token from Webpay redirect
      const token_ws = searchParams.get('token_ws');
      const TBK_TOKEN = searchParams.get('TBK_TOKEN');
      const TBK_ORDEN_COMPRA = searchParams.get('TBK_ORDEN_COMPRA');
      
      // Case 1: User cancelled (has TBK_TOKEN)
      if (TBK_TOKEN && TBK_ORDEN_COMPRA) {
        setDetails({
          status: 'CANCELLED',
          success: false,
          buyOrder: TBK_ORDEN_COMPRA,
          amount: 0,
          transactionId: '',
          error: 'Pago cancelado por el usuario',
        });
        setLoading(false);
        return;
      }
      
      // Case 2: Timeout (has TBK_ORDEN_COMPRA but no tokens)
      if (TBK_ORDEN_COMPRA && !token_ws && !TBK_TOKEN) {
        setDetails({
          status: 'TIMEOUT',
          success: false,
          buyOrder: TBK_ORDEN_COMPRA,
          amount: 0,
          transactionId: '',
          error: 'El tiempo para completar el pago expiró',
        });
        setLoading(false);
        return;
      }
      
      // Case 3: Normal flow - confirm with backend
      if (token_ws) {
        console.log('[PaymentResult] Confirming payment with backend...');
        try {
          const response = await fetch(`${API_URL}/payments/webpay/return?token_ws=${token_ws}`, {
            headers: {
              'Accept': 'application/json',
            },
          });
          const data = await response.json();
          
          console.log('[PaymentResult] Backend response:', data);
          
          if (data.success) {
            setDetails({
              status: 'AUTHORIZED',
              success: true,
              buyOrder: data.buyOrder || '',
              amount: data.amount || 0,
              transactionId: data.transactionId || '',
              authorizationCode: data.authorizationCode,
              cardNumber: data.cardNumber,
              paymentType: data.paymentType,
              redirectTo: data.redirectTo,
            });
            setPaymentConfirmed(true);
            
            // Start countdown for auto-redirect if we have a redirect URL
            if (data.redirectTo) {
              setRedirectCountdown(5);
            }
          } else {
            setDetails({
              status: data.status || 'FAILED',
              success: false,
              buyOrder: data.buyOrder || '',
              amount: data.amount || 0,
              transactionId: data.transactionId || '',
              error: data.error || 'El pago no pudo ser procesado',
            });
          }
        } catch (err) {
          console.error('[PaymentResult] Error confirming payment:', err);
          setError('Error al confirmar el pago. Por favor contacta a soporte.');
        }
        setLoading(false);
        return;
      }
      
      // No valid parameters
      console.log('[PaymentResult] No valid payment parameters');
      setError('No se encontraron datos de pago válidos.');
      setLoading(false);
    };

    confirmPayment();
  }, [searchParams]);

  // Effect 2: Check saved cards after payment is confirmed AND auth is hydrated (and not refreshing)
  useEffect(() => {
    const checkSavedCards = async () => {
      // Wait for hydration and any token refresh to complete
      if (!paymentConfirmed || !hasHydrated || isRefreshing) return;
      if (!token) {
        console.log('[PaymentResult] No auth token, skipping card check');
        return;
      }
      
      try {
        const cardsResponse = await api<CardsCheckResponse>('/cards', { token });
        const cards = cardsResponse.cards || [];
        setHasSavedCards(cards.length > 0);
        
        // Show save card prompt only if no cards saved yet
        if (cards.length === 0) {
          setShowSaveCardPrompt(true);
        }
      } catch (e) {
        console.log('[PaymentResult] Could not check saved cards:', e);
      }
    };
    
    checkSavedCards();
  }, [paymentConfirmed, hasHydrated, isRefreshing, token]);

  // Effect 3: Auto-redirect countdown for content purchases
  useEffect(() => {
    if (redirectCountdown === null || redirectCountdown <= 0) return;
    
    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  // Effect 4: Perform redirect when countdown reaches 0
  useEffect(() => {
    if (redirectCountdown === 0 && details?.redirectTo) {
      router.push(details.redirectTo);
    }
  }, [redirectCountdown, details?.redirectTo, router]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'AUTHORIZED':
      case 'APPROVED':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          title: '¡Pago Exitoso!',
          message: 'Tu pago ha sido procesado correctamente.',
        };
      case 'FAILED':
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          title: 'Pago Rechazado',
          message: 'Tu pago no pudo ser procesado. Por favor, intenta nuevamente.',
        };
      case 'CANCELLED':
        return {
          icon: AlertCircle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          title: 'Pago Cancelado',
          message: 'Has cancelado el proceso de pago.',
        };
      case 'TIMEOUT':
        return {
          icon: Clock,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30',
          title: 'Tiempo Agotado',
          message: 'El tiempo para completar el pago ha expirado.',
        };
      case 'PENDING':
      case 'IN_PROCESS':
        return {
          icon: Clock,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          title: 'Pago Pendiente',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          title: 'Estado Desconocido',
          message: 'No pudimos determinar el estado de tu pago.',
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
        <p className="text-white/70">Confirmando tu pago...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-red-500/20 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  const config = getStatusConfig(details.status);
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-8 text-center`}>
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.bgColor} mb-6`}>
            <Icon className={`w-10 h-10 ${config.color}`} />
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold ${config.color} mb-2`}>
            {config.title}
          </h1>
          <p className="text-white/70 mb-6">
            {config.message}
          </p>

          {/* Transaction Details */}
          <div className="bg-black/30 rounded-xl p-4 mb-6 text-left space-y-3">
            {details.success && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Monto:</span>
                  <span className="text-white font-bold text-lg">{formatAmount(details.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Orden:</span>
                  <span className="text-white/80 font-mono text-sm">{details.buyOrder}</span>
                </div>
                {details.authorizationCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Autorización:</span>
                    <span className="text-white/80 font-mono">{details.authorizationCode}</span>
                  </div>
                )}
                {details.cardNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Tarjeta:</span>
                    <span className="text-white/80 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      **** {details.cardNumber}
                    </span>
                  </div>
                )}
              </>
            )}

            {details.error && !details.success && (
              <div className="text-red-400 text-sm">
                <span className="font-medium">Error:</span> {details.error}
              </div>
            )}

            {!details.success && (
              <div className="flex justify-between items-center">
                <span className="text-white/50">Orden:</span>
                <span className="text-white/80 font-mono text-sm">{details.buyOrder}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {details.success ? (
              <>
                {/* Show redirect countdown for content purchases */}
                {details.redirectTo && redirectCountdown !== null && redirectCountdown > 0 && (
                  <div className="text-center mb-4">
                    <p className="text-white/70 text-sm">
                      Redirigiendo al contenido en <span className="font-bold text-fuchsia-400">{redirectCountdown}</span> segundos...
                    </p>
                  </div>
                )}
                
                {details.redirectTo ? (
                  <>
                    <button
                      onClick={() => router.push(details.redirectTo!)}
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Ver Contenido Ahora
                    </button>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                    >
                      <Home className="w-5 h-5" />
                      Ir a mi Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <Home className="w-5 h-5" />
                      Ir a mi Dashboard
                    </Link>
                    <Link
                      href="/"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Volver al Inicio
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => router.back()}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-medium transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Intentar Nuevamente
                </button>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Volver al Inicio
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Payment provider logo */}
        <div className="text-center mt-6">
          <p className="text-white/30 text-xs">
            Pago procesado de forma segura por
          </p>
          <p className="text-white/50 text-sm font-medium mt-1">
            {searchParams.get('gateway') === 'mercadopago' 
              ? 'MercadoPago' 
              : 'Webpay Plus - Transbank'}
          </p>
        </div>
      </div>
      
      {/* Save Card Prompt Modal */}
      {showSaveCardPrompt && (
        <SaveCardPrompt
          isOpen={showSaveCardPrompt}
          onClose={() => setShowSaveCardPrompt(false)}
        />
      )}
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
