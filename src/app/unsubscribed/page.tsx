'use client'

/**
 * /unsubscribed — confirmation page for the one-click marketing unsubscribe
 * flow (Ley 21.719 — Ola 5A).
 *
 * The backend endpoint `GET /api/legal/unsubscribe?token=...` performs the
 * actual withdrawal and redirects here with a `status` query param:
 *   - status=success → user successfully opted out of marketing
 *   - status=invalid → token was malformed / unrecognized
 *   - status=expired → token TTL passed (30 days)
 *
 * The page does NOT make any API calls — all state is encoded in the URL by
 * the backend redirect. This keeps the unsubscribe action safe to trigger
 * even from inbox previews/scanners.
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type Status = 'success' | 'invalid' | 'expired'

function isStatus(value: string | null): value is Status {
  return value === 'success' || value === 'invalid' || value === 'expired'
}

function UnsubscribedContent() {
  const searchParams = useSearchParams()
  const rawStatus = searchParams.get('status')
  const status: Status = isStatus(rawStatus) ? rawStatus : 'invalid'

  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          {isSuccess ? (
            <>
              <div
                aria-hidden="true"
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/40"
              >
                <svg
                  className="h-7 w-7 text-emerald-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Te hemos dado de baja
              </h1>
              <p className="text-sm text-gray-300 leading-relaxed">
                Ya no recibirás emails de marketing de Apapacho. El cambio se
                aplicó al instante y quedó registrado en el historial de
                consentimientos de tu cuenta.
              </p>
              <p className="mt-4 text-sm text-gray-400">
                Si fue un error, puedes reactivar las comunicaciones de
                marketing desde la configuración granular de tu cuenta.
              </p>
            </>
          ) : status === 'expired' ? (
            <>
              <div
                aria-hidden="true"
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 border border-amber-400/40"
              >
                <svg
                  className="h-7 w-7 text-amber-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Este enlace expiró
              </h1>
              <p className="text-sm text-gray-300 leading-relaxed">
                El enlace de baja directa tiene una validez de 30 días desde
                que se envió el email. Para gestionar tus preferencias, abre
                la configuración de tu cuenta.
              </p>
            </>
          ) : (
            <>
              <div
                aria-hidden="true"
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 border border-red-400/40"
              >
                <svg
                  className="h-7 w-7 text-red-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                No pudimos procesar la baja
              </h1>
              <p className="text-sm text-gray-300 leading-relaxed">
                El enlace es inválido o ya fue utilizado. Para asegurarte de
                que no recibirás más emails de marketing, ajusta tus
                preferencias desde la configuración de tu cuenta.
              </p>
            </>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/settings/privacy"
              className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white hover:from-fuchsia-400 hover:to-purple-400 transition-colors"
            >
              Configurar mis preferencias
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          ¿Dudas sobre tus datos?{' '}
          <a
            href="mailto:privacidad@appapacho.cl"
            className="text-fuchsia-400 hover:text-fuchsia-300"
          >
            privacidad@appapacho.cl
          </a>
        </p>
      </div>
    </div>
  )
}

export default function UnsubscribedPage() {
  // useSearchParams() requires a Suspense boundary in Next.js 15.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center px-4 py-12">
          <p className="text-sm text-gray-400">Cargando…</p>
        </div>
      }
    >
      <UnsubscribedContent />
    </Suspense>
  )
}
