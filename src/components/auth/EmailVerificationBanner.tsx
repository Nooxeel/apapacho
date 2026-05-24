'use client'

/**
 * Persistent "verify your email" banner.
 *
 * Visible only when an authenticated user has `emailVerified === false`.
 * Behavior:
 *   - Yellow amber stripe at the top of the page (between Navbar and main).
 *   - Resend button calls POST /api/auth/resend-verification-email (1/min/user
 *     server-side rate limit).
 *   - The "X" hides it for the session via sessionStorage; on next page reload
 *     it reappears until the user actually verifies.
 *
 * Ola 6 P2 — auth hardening (verification nudge).
 */

import { useEffect, useState } from 'react'
import { MailWarning, X, Loader2, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api/auth'

const SESSION_HIDE_KEY = 'apapacho-verify-banner-hidden'

export default function EmailVerificationBanner() {
  const { user, hasHydrated } = useAuthStore()
  const [hidden, setHidden] = useState(true) // start hidden to avoid flash
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (typeof window === 'undefined') return
    const dismissed = window.sessionStorage.getItem(SESSION_HIDE_KEY) === '1'
    setHidden(dismissed)
  }, [hasHydrated])

  // Type guard: User-like with optional emailVerified flag. Hide the banner
  // until the store has hydrated and we have a user object with a definitive
  // false value — undefined means we don't know yet (e.g. old API response).
  const u = user as { emailVerified?: boolean } | null
  const shouldShow = hasHydrated && !!u && u.emailVerified === false && !hidden

  if (!shouldShow) return null

  const handleResend = async () => {
    setError(null)
    setSending(true)
    try {
      await authApi.resendVerificationEmail()
      setSent(true)
    } catch (err: any) {
      if (err?.statusCode === 429) {
        const retryAfter: number | undefined = err?.data?.retryAfterSeconds
        setError(
          retryAfter
            ? `Espera ${retryAfter}s antes de reenviar.`
            : 'Espera un momento antes de reenviar.'
        )
      } else if (err?.statusCode === 400 && err?.message?.includes('verificado')) {
        // The store user is stale — the email is actually verified.
        setSent(true)
      } else {
        setError(err?.message || 'No pudimos reenviar el email. Intenta de nuevo.')
      }
    } finally {
      setSending(false)
    }
  }

  const handleHide = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(SESSION_HIDE_KEY, '1')
    }
    setHidden(true)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-500/15 border-b border-amber-500/40 text-amber-200"
    >
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-start gap-3">
        <MailWarning className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 text-sm leading-relaxed">
          {sent ? (
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              Te enviamos el email de verificación. Revisa tu bandeja de entrada y spam.
            </span>
          ) : (
            <>
              <span>
                Verifica tu email para activar todas las funcionalidades de Apapacho.
              </span>{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={sending}
                className="underline underline-offset-2 font-medium hover:text-amber-100 disabled:opacity-60"
              >
                {sending ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Enviando…
                  </span>
                ) : (
                  'Reenviar email de verificación'
                )}
              </button>
              {error && <span className="block text-amber-300/80 mt-1">{error}</span>}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleHide}
          aria-label="Ocultar aviso"
          className="text-amber-200/70 hover:text-amber-100 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/** Re-export of the dismiss key for tests / unit isolation. */
export const __SESSION_HIDE_KEY = SESSION_HIDE_KEY
