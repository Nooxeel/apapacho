'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/ui/ErrorFallback'

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Messages error boundary caught:', error)
    }
  }, [error])

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Error en mensajes"
      message="Error en mensajes. Es posible que la conexion se haya interrumpido."
      backHref="/messages"
      backLabel="Volver a mensajes"
    />
  )
}
