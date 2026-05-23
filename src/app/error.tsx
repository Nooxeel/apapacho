'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { ErrorFallback } from '@/components/ui/ErrorFallback'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capturar al observability backend (Ley 21.719 P1.3). El beforeSend del
    // sentry.client.config.ts ya maskea PII en el evento.
    Sentry.captureException(error, {
      tags: { boundary: 'root' },
      extra: { digest: error.digest },
    })
    if (process.env.NODE_ENV === 'development') {
      console.error('Root error boundary caught:', error)
    }
  }, [error])

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Algo salio mal"
      message="Algo salio mal. Por favor intenta de nuevo."
    />
  )
}
