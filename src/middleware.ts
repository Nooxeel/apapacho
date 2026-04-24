import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Edge middleware — R0-04 + R0-16
 *
 * Responsibilities:
 *  1. Server-side route protection: reject unauthenticated requests to
 *     protected paths before the page is ever rendered (fixes C1 — content
 *     was previously flashed to the client while useAuthStore ran).
 *  2. Per-request CSP nonce: mints a fresh nonce on every request so that
 *     inline scripts (JSON-LD in layout.tsx, Next.js bootstrap) can be
 *     whitelisted without `'unsafe-inline'` in script-src (fixes H7).
 *
 * The nonce is exposed to RSCs via the `x-nonce` request header (read with
 * `headers().get('x-nonce')` in server components) and echoed back on the
 * response for easier debugging.
 */

// Routes that require a valid session cookie. Patterns are evaluated against
// the pathname only. Keep this list aligned with the client-side guards that
// remain in each page as a defense-in-depth measure.
const PROTECTED_MATCHERS: readonly RegExp[] = [
  /^\/creator(\/.*)?$/,
  /^\/admin(\/.*)?$/,
  /^\/dashboard(\/.*)?$/,
  /^\/settings(\/.*)?$/,
  /^\/messages(\/.*)?$/,
  /^\/transactions(\/.*)?$/,
  /^\/profile\/edit(\/.*)?$/,
  /^\/payments(\/.*)?$/,
]

// Must match backend/src/lib/cookies.ts -> JWT_COOKIE_NAME
const AUTH_COOKIE_NAME = 'apapacho_token'

function generateNonce(): string {
  // crypto.randomUUID is available in the Edge runtime.
  return crypto.randomUUID().replace(/-/g, '')
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_MATCHERS.some((re) => re.test(pathname))
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
  const { pathname } = request.nextUrl
  const nonce = generateNonce()

  // Propagate the nonce to downstream RSCs via request headers so that
  // server components can read it with `headers()`.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  if (isProtectedPath(pathname)) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
  }

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
