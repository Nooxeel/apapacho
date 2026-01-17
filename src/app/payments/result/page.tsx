'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Home, CreditCard } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type PaymentStatus = 'AUTHORIZED' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' | 'PENDING' | 'REVERSED' | 'REFUNDED';

interface PaymentDetails {
  status: PaymentStatus;
  success: boolean;
  buyOrder: string;
  amount: number;
  transactionId: string;
  authorizationCode?: string;
  cardNumber?: string;
  error?: string;
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      // Get token from Webpay redirect
      const token_ws = searchParams.get('token_ws');
      const TBK_TOKEN = searchParams.get('TBK_TOKEN');
      const TBK_ORDEN_COMPRA = searchParams.get('TBK_ORDEN_COMPRA');
      
      console.log('[PaymentResult] Params:', { token_ws, TBK_TOKEN, TBK_ORDEN_COMPRA });
      
      // Case 1: User cancelled (has TBK_TOKEN)
      if (TBK_TOKEN && TBK_ORDEN_COMPRA) {
        console.log('[PaymentResult] User cancelled payment');
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
        console.log('[PaymentResult] Payment timeout');
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
            });
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'AUTHORIZED':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          title: '¡Pago Exitoso!',
          message: 'Tu pago ha sido procesado correctamente.',
        };
      case 'FAILED':
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

        {/* Webpay logo */}
        <div className="text-center mt-6">
          <p className="text-white/30 text-xs">
            Pago procesado de forma segura por
          </p>
          <p className="text-white/50 text-sm font-medium mt-1">
            Webpay Plus - Transbank
          </p>
        </div>
      </div>
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
