'use client'

/**
 * useInactivityTimer — Auto-logout by inactivity (Ola 6 P2).
 *
 * Reads `user.inactivityTimeoutMinutes` from the auth store. When set, a
 * single shared timer counts down across the whole app:
 *   - Any of mousemove/keydown/touchstart/scroll/click resets the timer.
 *   - At (timeout − warningSeconds) seconds we surface a warning to give the
 *     user a chance to keep working without losing data.
 *   - At timeout we call POST /api/auth/inactivity-logout, run the store
 *     `logout()`, and redirect to /login?reason=inactivity.
 *
 * The hook is mounted once at the root via <InactivityGuard/>. Multiple mounts
 * are tolerated but wasteful — the guard ensures a single mount.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api/auth'

const WARNING_LEAD_SECONDS = 60

/**
 * Events that count as "user activity". Listening on `document` (not window)
 * keeps the listener cheap and avoids missing events from focused iframes
 * (we don't host iframes that proxy interaction, but the document-level
 * bubble pattern is the safer default).
 */
const ACTIVITY_EVENTS: Array<keyof DocumentEventMap> = [
  'mousemove',
  'keydown',
  'touchstart',
  'scroll',
  'click',
]

interface InactivityState {
  /** True when we are inside the warning window. */
  warning: boolean
  /** Seconds left until auto-logout (only valid while warning=true). */
  secondsLeft: number
  /** Manually reset the timer (e.g. from the "Keep me signed in" modal CTA). */
  reset: () => void
}

export function useInactivityTimer(): InactivityState {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  const [warning, setWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const timeoutMs =
    (user as { inactivityTimeoutMinutes?: number | null } | null)
      ?.inactivityTimeoutMinutes
  const enabled =
    isAuthenticated && typeof timeoutMs === 'number' && timeoutMs > 0

  const lastActivityRef = useRef<number>(Date.now())
  const intervalRef = useRef<number | null>(null)
  const loggingOutRef = useRef<boolean>(false)

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    if (warning) setWarning(false)
  }, [warning])

  // Subscribe to activity events while enabled. We use a single listener that
  // only updates a ref — no setState on every mouse-move (avoids re-renders).
  useEffect(() => {
    if (!enabled) return
    const handler = () => {
      lastActivityRef.current = Date.now()
    }
    // passive=true for scroll/touchstart so we never block the main thread.
    const opts: AddEventListenerOptions = { passive: true, capture: true }
    for (const ev of ACTIVITY_EVENTS) {
      document.addEventListener(ev, handler, opts)
    }
    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        document.removeEventListener(ev, handler, opts as EventListenerOptions)
      }
    }
  }, [enabled])

  // Tick interval — checks elapsed time vs configured timeout. 1s resolution
  // is sufficient for a feature measured in minutes.
  useEffect(() => {
    if (!enabled) {
      // Clear any state from a previous session.
      setWarning(false)
      setSecondsLeft(0)
      return
    }

    const totalMs = (timeoutMs as number) * 60_000
    const warningMs = WARNING_LEAD_SECONDS * 1000

    const tick = async () => {
      if (loggingOutRef.current) return
      const elapsed = Date.now() - lastActivityRef.current
      if (elapsed >= totalMs) {
        loggingOutRef.current = true
        setWarning(false)
        try {
          await authApi.inactivityLogout(timeoutMs as number).catch(() => undefined)
        } finally {
          await logout()
          // Avoid redirect loop if we're already on a public page.
          if (!pathname?.startsWith('/login')) {
            router.push('/login?reason=inactivity')
          }
        }
        return
      }

      const msUntilLogout = totalMs - elapsed
      if (msUntilLogout <= warningMs) {
        setWarning(true)
        setSecondsLeft(Math.ceil(msUntilLogout / 1000))
      } else if (warning) {
        // Activity happened after the warning fired — withdraw it.
        setWarning(false)
        setSecondsLeft(0)
      }
    }

    intervalRef.current = window.setInterval(tick, 1000)
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    // We intentionally do NOT depend on `warning` to avoid re-creating the
    // interval — the tick reads its current state via closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, timeoutMs, logout, router, pathname])

  return { warning, secondsLeft, reset: resetActivity }
}
