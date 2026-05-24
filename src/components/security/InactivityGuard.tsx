'use client'

/**
 * InactivityGuard — mounts the inactivity timer + warning modal.
 *
 * Designed to be mounted once at the root layout. Renders nothing when:
 *   - The user is not authenticated.
 *   - The user hasn't enabled inactivity auto-logout
 *     (user.inactivityTimeoutMinutes is null/undefined).
 *
 * When the timer enters the warning window (default 60 seconds before
 * logout), an overlay surfaces a countdown and a "Sigo aquí" button that
 * resets the timer.
 *
 * Ola 6 P2 — auth hardening.
 */

import { useInactivityTimer } from '@/hooks/useInactivityTimer'
import { Clock } from 'lucide-react'

export default function InactivityGuard() {
  const { warning, secondsLeft, reset } = useInactivityTimer()

  if (!warning) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="inactivity-warning-title"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-sm bg-[#1a1a25] border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-white">
        <div className="flex items-center gap-2 mb-3 text-amber-300">
          <Clock className="w-5 h-5" />
          <h2 id="inactivity-warning-title" className="text-base font-semibold">
            ¿Sigues ahí?
          </h2>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          Tu sesión cerrará por inactividad en{' '}
          <strong className="text-amber-200">{Math.max(0, secondsLeft)}s</strong>.
          Mueve el mouse o presiona una tecla para continuar.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-95 transition"
        >
          Sigo aquí
        </button>
      </div>
    </div>
  )
}
