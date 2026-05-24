'use client'

/**
 * Toaster — renders the active toast stack created via <ToastProvider />.
 *
 * Visual: fixed top-right, slide-in from the right with a fade.
 * Accessibility:
 *  - Container has role="region" with an accessible name.
 *  - Each toast picks its role + aria-live level based on severity.
 *  - Dismiss button has keyboard focus ring and aria-label.
 *  - Pressing Escape while a toast (or its dismiss button) is focused removes it.
 */

import { useContext, useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { ToastContext, type Toast, type ToastType } from './ToastProvider'

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

/**
 * Tailwind classes per severity. Background uses a 10% tint on top of the
 * page so dark mode contrast stays AA. The accent color drives icon + border.
 */
const STYLES: Record<ToastType, { ring: string; iconColor: string; border: string }> = {
  success: {
    ring: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  error: {
    ring: 'bg-red-500/10',
    iconColor: 'text-red-400',
    border: 'border-red-500/30',
  },
  info: {
    ring: 'bg-sky-500/10',
    iconColor: 'text-sky-400',
    border: 'border-sky-500/30',
  },
  warning: {
    ring: 'bg-yellow-500/10',
    iconColor: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
}

export function Toaster() {
  const ctx = useContext(ToastContext)
  if (!ctx) return null
  const { toasts, dismissToast } = ctx

  if (toasts.length === 0) return null

  return (
    <div
      // Region landmark so AT users can jump straight to live notifications.
      role="region"
      aria-label="Notificaciones"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: () => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = ICONS[toast.type]
  const styles = STYLES[toast.type]
  // Errors are urgent — assertive interrupts the current AT reading.
  const isUrgent = toast.type === 'error'
  const ariaLive: 'assertive' | 'polite' = isUrgent ? 'assertive' : 'polite'
  const role: 'alert' | 'status' = isUrgent ? 'alert' : 'status'

  const rootRef = useRef<HTMLDivElement | null>(null)

  // Auto-dismiss timer. duration=0 disables auto-dismiss.
  useEffect(() => {
    if (toast.duration <= 0) return
    const id = window.setTimeout(onDismiss, toast.duration)
    return () => window.clearTimeout(id)
  }, [toast.duration, onDismiss])

  // Keyboard: Escape dismisses while focus is inside the toast.
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onDismiss()
    }
  }

  return (
    <div
      ref={rootRef}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      onKeyDown={handleKeyDown}
      className={`pointer-events-auto bg-[#1a1a1a] border ${styles.border} rounded-xl shadow-lg p-3 flex items-start gap-3 animate-toast-in`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.ring}`}
        aria-hidden="true"
      >
        <Icon className={`h-4 w-4 ${styles.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-white font-semibold text-sm leading-tight">{toast.title}</p>
        )}
        <p className={`text-sm text-gray-200 ${toast.title ? 'mt-0.5' : ''} break-words`}>
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500/60 transition"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
