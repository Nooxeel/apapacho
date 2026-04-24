'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getKycStatus, type KycStatusResponse } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

/**
 * Persistent KYC banner for creators. Shown on the dashboard (and any other
 * creator landing surface) whenever kycStatus !== 'APPROVED'.
 *
 * Returns `null` when the creator is approved, not a creator, or the status
 * cannot be determined — callers can mount it unconditionally.
 */
export function KycBanner() {
  const { user, token, isAuthenticated, hasHydrated } = useAuthStore()
  const [status, setStatus] = useState<KycStatusResponse | null>(null)

  const isCreator = (user as { isCreator?: boolean } | null)?.isCreator === true

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !isCreator) return
    let cancelled = false
    getKycStatus(token ?? undefined)
      .then((s) => {
        if (!cancelled) setStatus(s)
      })
      .catch(() => {
        // 404 = not a creator yet; silently ignore
      })
    return () => {
      cancelled = true
    }
  }, [hasHydrated, isAuthenticated, isCreator, token])

  if (!status || status.status === 'APPROVED') return null

  const copy = BANNER_COPY[status.status]

  return (
    <div className="max-w-5xl mx-auto px-4 mt-6">
      <div
        className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 ${copy.className}`}
      >
        <div className="flex-1">
          <h3 className="font-semibold">{copy.title}</h3>
          <p className="text-sm opacity-90 mt-1">
            {copy.description}
            {status.rejectionReason && (
              <span className="block mt-1 italic">Motivo: {status.rejectionReason}</span>
            )}
          </p>
        </div>
        <Link
          href="/creator/kyc"
          className="inline-block px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90"
        >
          {copy.cta}
        </Link>
      </div>
    </div>
  )
}

const BANNER_COPY: Record<
  Exclude<KycStatusResponse['status'], 'APPROVED'>,
  { title: string; description: string; cta: string; className: string }
> = {
  PENDING: {
    title: 'Completa tu verificación de identidad',
    description:
      'Para publicar contenido y recibir pagos necesitamos verificar tu identidad. Te toma 5 minutos.',
    cta: 'Verificar ahora',
    className: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
  },
  SUBMITTED: {
    title: 'Verificación en revisión',
    description:
      'Recibimos tu documentación. Revisamos manualmente en un plazo máximo de 48 horas hábiles.',
    cta: 'Ver estado',
    className: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
  },
  IN_REVIEW: {
    title: 'Verificación en revisión',
    description: 'Un administrador está revisando tu documentación.',
    cta: 'Ver estado',
    className: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
  },
  REJECTED: {
    title: 'Verificación rechazada',
    description:
      'No pudimos aprobar tu documentación. Escríbenos a soporte@appapacho.cl para apelar.',
    cta: 'Ver detalles',
    className: 'bg-red-500/10 border-red-500/30 text-red-100',
  },
  RESUBMISSION_REQUIRED: {
    title: 'Necesitamos nuevos documentos',
    description: 'Hay que volver a subir los documentos. Ver motivo abajo.',
    cta: 'Volver a enviar',
    className: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
  },
}
