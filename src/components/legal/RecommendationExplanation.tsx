'use client'

/**
 * RecommendationExplanation — Ley 21.719 (Group 3.6)
 *
 * Discreet "ℹ" icon button that opens a popover explaining why a given card
 * (creator or post) was recommended to the authenticated user.
 *
 * Behavior:
 *  - Anonymous users: button is hidden — there is nothing to explain.
 *  - On open, fetches GET /api/users/me/recommendations/explanation.
 *  - If no log row found (direct visit, expired log) shows a friendly message.
 *  - If the user opted out of profiling, the reason will already say so —
 *    we additionally render a CTA linking to /settings/privacy so they can
 *    re-enable personalization if they want.
 *
 * The component swallows clicks on its outer wrapper (stopPropagation) so it
 * can be safely placed inside an enclosing <Link>/<a> without triggering
 * navigation.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Info, Loader2, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import {
  getRecommendationExplanation,
  type RecommendationExplanation,
  type RecommendationItemType,
} from '@/lib/api/recommendations'

interface RecommendationExplanationProps {
  itemId: string
  itemType: RecommendationItemType
  /** Optional className applied to the trigger button. */
  className?: string
  /** Aria label override; defaults to a generic "Por qué te mostramos esto". */
  ariaLabel?: string
}

const DEFAULT_ARIA_LABEL = 'Por qué te mostramos esto'

function formatShownAt(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return iso
  }
}

/**
 * Heuristic to detect the opt-out reason in the backend payload. We check for
 * the canonical phrase the backend emits ("perfilamiento desactivado") so the
 * UI can render the "re-enable" CTA. Avoids passing a separate boolean from
 * the server.
 */
function isOptOutReason(reason: string): boolean {
  return /perfilamiento\s+desactivado/i.test(reason)
}

export function RecommendationExplanation({
  itemId,
  itemType,
  className,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: RecommendationExplanationProps) {
  const token = useAuthStore((s) => s.token)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RecommendationExplanation | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const fetchExplanation = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await getRecommendationExplanation(itemId, itemType, token)
      setData(result)
    } catch (err) {
      console.error('[RecommendationExplanation] fetch failed', err)
      setError('No se pudo cargar la explicación. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [itemId, itemType, token])

  // Click-outside handler: close popover when clicking outside.
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Esc key closes.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const willOpen = !open
      setOpen(willOpen)
      if (willOpen && !data && !loading) {
        void fetchExplanation()
      }
    },
    [open, data, loading, fetchExplanation]
  )

  if (!token) return null

  return (
    <div ref={popoverRef} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={
          className ??
          'inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white/70 transition hover:bg-black/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60'
        }
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Explicación de la recomendación"
          className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-white/15 bg-[#15151c] p-4 text-left shadow-2xl shadow-black/40"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-white">¿Por qué ves esto?</h4>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
              }}
              aria-label="Cerrar"
              className="rounded p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 py-3 text-sm text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Cargando…
            </div>
          )}

          {error && (
            <div className="space-y-2">
              <p className="text-sm text-red-400">{error}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  void fetchExplanation()
                }}
                className="text-xs font-medium text-fuchsia-400 hover:text-fuchsia-300"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && data && data.explained === false && (
            <p className="text-sm leading-relaxed text-white/70">{data.message}</p>
          )}

          {!loading && !error && data && data.explained && (
            <div className="space-y-2">
              <p className="text-sm leading-relaxed text-white/80">{data.reason}</p>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
                <span>Mostrado: {formatShownAt(data.shownAt)}</span>
                {typeof data.score === 'number' && (
                  <span>Score: {Math.round(data.score)}</span>
                )}
                <span>v{data.algorithmVersion}</span>
              </div>

              {isOptOutReason(data.reason) && (
                <div className="mt-3 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 p-2.5">
                  <p className="text-xs text-white/80">
                    Tienes el perfilamiento desactivado. Si quieres recibir
                    recomendaciones personalizadas, puedes reactivarlo en tus
                    preferencias.
                  </p>
                  <Link
                    href="/settings/privacy"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-block text-xs font-medium text-fuchsia-400 hover:text-fuchsia-300"
                  >
                    Ir a Privacidad →
                  </Link>
                </div>
              )}
            </div>
          )}

          <p className="mt-3 border-t border-white/10 pt-2 text-[10px] leading-snug text-white/40">
            Información requerida por la Ley 21.719. La conservamos hasta 90 días.
          </p>
        </div>
      )}
    </div>
  )
}

export default RecommendationExplanation
