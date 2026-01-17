'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Home, CreditCard } from 'lucide-react';
import Link from 'next/link';

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

  useEffect(() => {
    // Parse URL parameters
    const status = searchParams.get('status') as PaymentStatus;
    const success = searchParams.get('success') === 'true';
    const buyOrder = searchParams.get('buyOrder') || '';
    const amount = parseInt(searchParams.get('amount') || '0');
    const transactionId = searchParams.get('transactionId') || '';
    const authorizationCode = searchParams.get('authorizationCode') || undefined;
    const cardNumber = searchParams.get('cardNumber') || undefined;
    const error = searchParams.get('error') || undefined;

    if (status) {
      setDetails({
        status,
        success,
        buyOrder,
        amount,
        transactionId,
        authorizationCode,
        cardNumber,
        error,
      });
    }
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
