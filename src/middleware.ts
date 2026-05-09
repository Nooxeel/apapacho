import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Edge middleware — R0-16 (CSP nonce).
 *
 * R0-04 (server-side route protection) is intentionally DISABLED while
 * frontend (appapacho.cl) and backend (apapacho-backend-production.up.railway.app)
 * live on different eTLD+1s. The auth cookie `apapacho_token` is scoped to the
 * backend's host, so the frontend's edge middleware cannot read it and any
 * cookie-based redirect here ends up in a login loop.
 *
 * Defense-in-depth meanwhile:
 *  - Client-side guards in each protected page (Zustand `useAuthStore`)
 *    redirect to /login when there is no `user` rehydrated from /auth/me.
 *  - The backend rejects every API call without a valid cookie, so no data
 *    leaks through the page render — only the static shell may flash.
 *
 * Re-enable cookie protection here (uncomment the block below) once the
 * backend is reachable at `api.appapacho.cl` and cookies use
 * `Domain=.appapacho.cl` so they are first-party to the frontend too.
 *
 * The CSP nonce path stays active and is the main reason this middleware
 * exists in production today.
 */

function generateNonce(): string {
  // crypto.randomUUID is available in the Edge runtime.
  return crypto.randomUUID().replace(/-/g, '')
}

function buildCsp(nonce: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  const isDev = process.env.NODE_ENV !== 'production'

  // Socket.IO + fetch targets. In dev we also need localhost backend
  // over http/ws; in prod we allow Railway deploys and wss:.
  const connectSrc = [
    "'self'",
    apiUrl,
    'https://accounts.google.com',
    'wss:',
    ...(isDev
      ? ['http://localhost:3001', 'ws://localhost:3001']
      : ['https://*.railway.app', 'https://*.up.railway.app', 'wss://*.railway.app', 'wss://*.up.railway.app']),
  ]
    .filter(Boolean)
    .join(' ')

  // NOTE on style-src: Tailwind v4 / Next.js 15 still emit runtime inline
  // styles (e.g. styled-jsx, some third-party widgets) that cannot be nonce'd
  // reliably today. We keep 'unsafe-inline' for style-src only — this is a
  // recognized trade-off that still materially improves XSS posture because
  // script execution is the actual exploitation vector. Revisit once Next
  // supports nonce'd inline CSS end-to-end.
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://www.youtube.com https://www.googletagmanager.com https://accounts.google.com`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' https://www.youtube.com https://www.googletagmanager.com https://accounts.google.com`

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com`,
    `img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://images.unsplash.com https://ui-avatars.com https://res.cloudinary.com https://*.placeholder.com https://*.googleusercontent.com https://*.railway.app https://*.up.railway.app http://localhost:3001`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src ${connectSrc}`,
    `frame-src 'self' https://www.youtube.com https://*.transbank.cl https://accounts.google.com`,
    `media-src 'self' https://res.cloudinary.com https://*.railway.app https://*.up.railway.app http://localhost:3001 blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://*.transbank.cl https://webpay3gint.transbank.cl https://webpay3g.transbank.cl https://www.mercadopago.cl`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce()

  // Propagate the nonce to downstream RSCs via request headers so that
  // server components can read it with `headers()`.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // Cookie-based protection intentionally disabled — see file-level comment.
  // Client-side guards remain authoritative until backend lives on the same
  // eTLD+1 as the frontend (e.g. api.appapacho.cl).

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', buildCsp(nonce))
  response.headers.set('x-nonce', nonce)
  return response
}

export const config = {
  // Skip Next internals, server actions, image optimization & static assets.
  // Static files (svg/png/ico/etc.) don't benefit from CSP and bypassing
  // them keeps the middleware cheap.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)',
  ],
}
