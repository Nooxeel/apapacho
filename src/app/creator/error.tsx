'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/ui/ErrorFallback'

export default function CreatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Creator error boundary caught:', error)
    }
  }, [error])

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Error en el panel de creador"
      message="Ocurrio un error en el panel de creador. Por favor intenta de nuevo."
      backHref="/creator/dashboard"
      backLabel="Volver al panel"
    />
  )
}
