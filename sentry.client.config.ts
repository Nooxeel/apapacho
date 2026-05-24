/**
 * Sentry — Browser runtime (Apapacho frontend, Ley 21.719 — Ola 4, P1.3).
 *
 * PII rules (mismas que el backend en src/lib/sentry.ts):
 *   - sendDefaultPii: false (no IP, no UA cookies)
 *   - beforeSend: maskea emails y elimina cualquier campo con nombre
 *     potencialmente sensible (password, rut, account, card, token).
 *   - Session Replay: 1% baseline + 100% si ocurre error (con masking
 *     agresivo: maskAllText + blockAllMedia).
 */
import * as Sentry from '@sentry/nextjs'
import { isDntEnabled } from './src/lib/dnt'

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// DNT (Do Not Track) — Ley 21.719 hardening.
// Resolve once at init. We still capture errors (essential to operate the
// service safely), but turn off session replay — that IS behavioral tracking
// because it records DOM mutations + interactions over time.
const DNT_ON = isDntEnabled()

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
  // Mirror del backend: 10% en prod, 100% en dev para tracing útil.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Replays: 1% sesiones, 100% si hay error. Estricto masking porque el
  // contenido del usuario es adulto y sensible (Ley 21.719 dato sensible
  // "vida sexual"). DNT: cuando el navegador opta por no ser rastreado
  // forzamos AMBAS sample rates a 0 — error reporting (mensajes + stacks)
  // sigue funcionando, pero NO grabamos sesión.
  replaysSessionSampleRate: DNT_ON ? 0 : 0.01,
  replaysOnErrorSampleRate: DNT_ON ? 0 : 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
  // No enviar IP/UA/cookies por defecto.
  sendDefaultPii: false,
  beforeSend(event) {
    // Limpiar el request data (POST bodies pueden traer password/email).
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
    if (event.contexts) {
      const cleaned: Record<string, Record<string, unknown>> = {}
      const standard = ['trace', 'runtime', 'os', 'device', 'browser', 'app']
      for (const [k, v] of Object.entries(event.contexts)) {
        cleaned[k] = standard.includes(k)
          ? (v as Record<string, unknown>)
          : (scrubValue(v) as Record<string, unknown>)
      }
      event.contexts = cleaned
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
