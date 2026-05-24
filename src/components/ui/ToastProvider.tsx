'use client'

/**
 * Toast Provider — accessible non-blocking notifications.
 *
 * Replaces every `alert()` call site in the app. Toasts are queued (FIFO),
 * auto-dismiss after a configurable duration, and can be manually dismissed.
 *
 * Accessibility (WCAG AA):
 *  - The renderer (`<Toaster />`) labels its region with role="region" + an
 *    accessible name, so screen readers can navigate to active notifications.
 *  - Each toast is announced via aria-live polite (success/info/warning) or
 *    assertive (error), and uses role="status" or role="alert" accordingly.
 *  - The dismiss button is keyboard-reachable and shows a focus ring.
 *  - Pressing Escape while focus is inside a toast dismisses it.
 *
 * Usage:
 *   import { useToast } from '@/hooks/useToast'
 *   const toast = useToast()
 *   toast.success('Subido correctamente')
 *   toast.error('No se pudo subir', { title: 'Error' })
 */

import { createContext, useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Toaster } from './Toaster'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  /** Optional bold heading rendered above the message. */
  title?: string
  /** Auto-dismiss delay in milliseconds. Defaults to 5000. Use 0 to disable. */
  duration?: number
}

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  /** Effective duration in milliseconds (0 means manual-dismiss only). */
  duration: number
}

export interface ToastContextValue {
  toasts: Toast[]
  addToast: (input: { type: ToastType; message: string } & ToastOptions) => string
  dismissToast: (id: string) => void
}

/** Default auto-dismiss for any toast that does not override it. */
const DEFAULT_DURATION_MS = 5000
/** FIFO cap to prevent runaway stacks (oldest is dropped when exceeded). */
const MAX_TOASTS = 5

export const ToastContext = createContext<ToastContextValue | null>(null)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  // Monotonic counter avoids collisions when toasts fire in the same tick.
  const counterRef = useRef(0)

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ type, message, title, duration }: { type: ToastType; message: string } & ToastOptions) => {
      counterRef.current += 1
      const id = `toast-${Date.now()}-${counterRef.current}`
      const effectiveDuration = duration ?? DEFAULT_DURATION_MS

      const toast: Toast = { id, type, message, title, duration: effectiveDuration }

      setToasts((prev) => {
        // FIFO: drop the oldest when at capacity.
        const next = prev.length >= MAX_TOASTS ? prev.slice(prev.length - MAX_TOASTS + 1) : prev
        return [...next, toast]
      })

      return id
    },
    []
  )

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, addToast, dismissToast }),
    [toasts, addToast, dismissToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}
