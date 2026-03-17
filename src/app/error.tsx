'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/ui/ErrorFallback'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
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
