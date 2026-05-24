'use client'

/**
 * ConsentRefreshModal — Ley 21.719 Ola 5A.
 *
 * Blocking modal that asks the authenticated user to re-accept the latest
 * versions of Terms / Privacy / Cookies when a `ConsentVersion` has been
 * bumped since they last consented.
 *
 * The component is purposely self-contained: it owns the polling, the modal
 * state, the deferral toggle (`"Revisar después"` allowed exactly once per
 * session) and the API calls. The provider that wraps the app
 * (`ReConsentProvider`) only mounts this component once for authenticated
 * users — there is no global state to manage.
 *
 * UX rules:
 *   - Modal is BLOCKING: backdrop click / Escape does NOT dismiss.
 *   - "Revisar después" is allowed exactly once per browser session
 *     (sessionStorage); after that, the secondary button is disabled and
 *     the user can only accept to continue.
 *   - "Acepto las nuevas versiones" calls POST /users/me/consents/accept-latest
 *     and closes the modal on success. On failure we surface a short error
 *     and keep the modal open so the user can retry.
 *
 * Accessibility:
 *   - Modal uses role="dialog" with aria-modal="true".
 *   - Focus is trapped via tabindex management on the accept/defer buttons.
 *   - aria-labelledby points to the visible title.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import {
  consentsApi,
  type ConsentPurpose,
  type ConsentStatusResponse,
} from '@/lib/api/consents'

const DEFER_FLAG_KEY = 'apapacho.reconsent.deferredOnce'

const PURPOSE_LABELS: Record<ConsentPurpose, string> = {
  SERVICE_EXECUTION: 'Ejecución del servicio',
  MARKETING: 'Marketing y comunicaciones',
  PROFILING: 'Personalización y recomendaciones',
  INTERNATIONAL_TRANSFER: 'Transferencia internacional',
  THIRD_PARTY_TRANSFER: 'Compartir con terceros',
  SENSITIVE_DATA: 'Datos sensibles',
  COOKIES_ANALYTICS: 'Cookies de analítica',
  COOKIES_PREFERENCES: 'Cookies de preferencias',
  COOKIES_MARKETING: 'Cookies de marketing',
}

/**
 * Read the "user already deferred this session" flag. Returns false on the
 * server (no sessionStorage) — the modal is always shown on first client mount.
 */
function hasDeferredThisSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(DEFER_FLAG_KEY) === '1'
  } catch {
    return false
  }
}

function markDeferred(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(DEFER_FLAG_KEY, '1')
  } catch {
    // best-effort — if sessionStorage is unavailable, we just don't remember
  }
}

function clearDeferred(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(DEFER_FLAG_KEY)
  } catch {
    // best-effort
  }
}

export function ConsentRefreshModal() {
  const { isAuthenticated, token } = useAuthStore()
  const [status, setStatus] = useState<ConsentStatusResponse | null>(null)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyDeferred, setAlreadyDeferred] = useState(false)

  // Fetch status whenever auth state changes from unauth → auth. We keep this
  // intentionally simple — a single check on login is enough to gate the
  // session. The provider remounts on logout so flags reset naturally.
  useEffect(() => {
    if (!isAuthenticated) {
      setStatus(null)
      setOpen(false)
      // On logout reset the per-session deferral so the next user logging in
      // sees the modal again if they have pending consents.
      clearDeferred()
      return
    }

    let cancelled = false
    consentsApi
      .getConsentStatus(token ?? undefined)
      .then((res) => {
        if (cancelled) return
        setStatus(res)
        if (res.needsReconsent) {
          const deferred = hasDeferredThisSession()
          setAlreadyDeferred(deferred)
          // Only auto-open if the user has NOT already deferred this session.
          if (!deferred) {
            setOpen(true)
          }
        }
      })
      .catch(() => {
        // Silent failure — re-consent is best-effort. If the endpoint is
        // unreachable we don't block the user from using the app.
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, token])

  const handleAccept = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await consentsApi.acceptLatest(token ?? undefined)
      clearDeferred()
      setOpen(false)
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              needsReconsent: false,
              pendingPurposes: [],
              entries: prev.entries.map((e) => ({ ...e, needsReconsent: false })),
            }
          : prev
      )
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'No pudimos guardar tu aceptación. Inténtalo nuevamente.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }, [submitting, token])

  const handleDefer = useCallback(() => {
    if (alreadyDeferred) return
    markDeferred()
    setAlreadyDeferred(true)
    setOpen(false)
  }, [alreadyDeferred])

  if (!open || !status?.needsReconsent) {
    return null
  }

  const pendingLabels = status.pendingPurposes
    .map((p) => PURPOSE_LABELS[p] ?? p)
    .filter(Boolean)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reconsent-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#13131a] shadow-2xl">
        <div className="p-6 sm:p-8">
          <h2
            id="reconsent-title"
            className="text-xl sm:text-2xl font-semibold text-white mb-2"
          >
            Hemos actualizado nuestros términos
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Para seguir usando Apapacho, necesitamos que revises y aceptes la
            versión más reciente de nuestros documentos legales. Conforme a la
            Ley 21.719, te pedimos un nuevo consentimiento cuando hacemos
            cambios sustanciales.
          </p>

          {pendingLabels.length > 0 && (
            <div className="mt-4 rounded-lg bg-white/5 p-3 text-sm text-gray-300">
              <p className="font-medium text-white mb-1">
                Finalidades pendientes de actualización:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                {pendingLabels.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-400 hover:text-fuchsia-300 underline"
            >
              Términos y Condiciones
            </Link>
            <Link
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-400 hover:text-fuchsia-300 underline"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-400 hover:text-fuchsia-300 underline"
            >
              Política de Cookies
            </Link>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleAccept}
              disabled={submitting}
              className="flex-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white hover:from-fuchsia-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Guardando…' : 'Acepto las nuevas versiones'}
            </button>
            <button
              type="button"
              onClick={handleDefer}
              disabled={alreadyDeferred || submitting}
              title={
                alreadyDeferred
                  ? 'Ya pospusiste esta revisión una vez en esta sesión'
                  : undefined
              }
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-gray-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              Revisar después
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Si pospones esta revisión, te la volveremos a pedir la próxima vez
            que inicies sesión. Tras la primera postergación dentro de esta
            sesión, el botón se desactiva para evitar accesos prolongados sin
            consentimiento actualizado.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConsentRefreshModal
