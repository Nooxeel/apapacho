'use client'

/**
 * Global error boundary — última red de seguridad cuando el root layout
 * mismo crashea (Next.js 15 App Router). DEBE incluir <html> y <body>
 * porque reemplaza a layout.tsx.
 *
 * Capturamos a Sentry para obtener visibilidad de fallos catastróficos
 * (Ley 21.719 — Ola 4 P1.3, mitigación de R13 recovery).
 */

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: 'global' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <html lang="es">
      <body>
        {/* NextError es un placeholder estándar; al ser un crash de layout
            no podemos asumir disponibilidad de fonts/contextos de la app. */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
