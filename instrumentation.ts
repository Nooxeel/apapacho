/**
 * Next.js instrumentation hook — Apapacho frontend, Ley 21.719 P1.3.
 *
 * Next.js 15 invoca `register()` una sola vez por proceso (server/edge),
 * antes de servir requests. Aquí cargamos la configuración Sentry correcta
 * según el runtime.
 *
 * Para el browser, Next.js carga automáticamente `sentry.client.config.ts`.
 */
import * as Sentry from '@sentry/nextjs'

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Captura errores que ocurren en Server Components, middleware y route
// handlers (requiere @sentry/nextjs ≥ 8.28 con Next.js 15).
export const onRequestError = Sentry.captureRequestError
