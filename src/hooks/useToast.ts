'use client'

/**
 * useToast — ergonomic accessor for the global toast queue.
 *
 * The provider (<ToastProvider />) is mounted in the root layout, so any
 * client component can import this hook and call `toast.success(...)` /
 * `toast.error(...)` without additional wiring.
 *
 * The hook intentionally throws if used outside the provider so that mounting
 * regressions are caught immediately in development.
 */

import { useContext, useMemo } from 'react'
import { ToastContext, type ToastOptions } from '@/components/ui/ToastProvider'

export interface ToastApi {
  success: (message: string, options?: ToastOptions) => string
  error: (message: string, options?: ToastOptions) => string
  info: (message: string, options?: ToastOptions) => string
  warning: (message: string, options?: ToastOptions) => string
  dismiss: (id: string) => void
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider> (mounted in app/layout.tsx)')
  }

  const { addToast, dismissToast } = ctx

  return useMemo<ToastApi>(
    () => ({
      success: (message, options) => addToast({ type: 'success', message, ...options }),
      error: (message, options) => addToast({ type: 'error', message, ...options }),
      info: (message, options) => addToast({ type: 'info', message, ...options }),
      warning: (message, options) => addToast({ type: 'warning', message, ...options }),
      dismiss: dismissToast,
    }),
    [addToast, dismissToast]
  )
}
