/**
 * Sentry — Edge runtime (middleware.ts + edge API routes).
 *
 * El edge runtime tiene un subset limitado de APIs: sin profiling, sin replay,
 * sin require dinámico. Solo init básico con beforeSend scrubbing.
 */
import * as Sentry from '@sentry/nextjs'

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /rut/i,
  /nationalid/i,
  /national_id/i,
  /account.*number/i,
  /account.*holder/i,
  /card.*number/i,
  /card.*last/i,
  /cvv/i,
  /cvc/i,
  /tbkuser/i,
] as const

function redactEmail(value: string): string {
  if (typeof value !== 'string' || !value.includes('@')) {
    return value
  }
  return value.replace(/(.).+@/, '$1***@')
}

function scrubValue(input: unknown, depth = 0): unknown {
  if (depth > 5 || input == null) return input
  if (Array.isArray(input)) return input.map((v) => scrubValue(v, depth + 1))
  if (typeof input !== 'object') return input
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERNS.some((re) => re.test(key))) continue
    if (/^email$/i.test(key) && typeof value === 'string') {
      out[key] = redactEmail(value)
      continue
    }
    out[key] = scrubValue(value, depth + 1)
  }
  return out
}

Sentry.init({
  dsn: DSN,
  enabled: Boolean(DSN),
  environment: process.env.NODE_ENV ?? 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies
      delete event.request.data
      if (event.request.headers) {
        const headers = { ...event.request.headers }
        for (const k of ['Authorization', 'authorization', 'Cookie', 'cookie']) {
          delete headers[k]
        }
        event.request.headers = headers
      }
    }
    if (event.extra) {
      event.extra = scrubValue(event.extra) as Record<string, unknown>
    }
    if (event.user) {
      const u: Sentry.User = { id: event.user.id }
      if (event.user.email && typeof event.user.email === 'string') {
        u.email = redactEmail(event.user.email)
      }
      event.user = u
    }
    return event
  },
})
