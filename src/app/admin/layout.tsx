'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'

/**
 * Admin layout — client-side role gate.
 *
 * Group E is adding the Next.js `middleware.ts` with matchers for `/admin/*`
 * in parallel. Until that lands, we enforce the SUPER_ADMIN check here by
 * calling `/auth/me` on mount. When the middleware ships, this is belt +
 * suspenders — not redundant, since middleware only checks token presence
 * and we need the backend role field.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, isAuthenticated, hasHydrated, logout } = useAuthStore()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  // Ley 21.719 — Ola 4 P1.1: surface MFA enforcement client-side so the
  // admin sees a clear CTA when /api/admin/* returns 403 MFA_REQUIRED.
  // Backend is the source of truth — this is UX, not enforcement.
  const [mfaRequired, setMfaRequired] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || !token) {
      router.replace('/login?redirect=/admin')
      return
    }
    let cancelled = false
    async function verify() {
      try {
        const me = (await authApi.getMe(token!)) as {
          role?: string
          mfaEnabled?: boolean
        }
        if (cancelled) return
        if (me.role !== 'SUPER_ADMIN') {
          router.replace('/')
          return
        }
        setMfaRequired(me.mfaEnabled !== true)
        setAuthorized(true)
      } catch {
        if (!cancelled) {
          await logout()
          router.replace('/login?redirect=/admin')
        }
      } finally {
        if (!cancelled) setChecking(false)
      }
    }
    verify()
    return () => {
      cancelled = true
    }
  }, [hasHydrated, isAuthenticated, token, router, logout])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white/70">
        Verificando permisos…
      </div>
    )
  }
  if (!authorized) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold">
              Apapacho · Admin
            </Link>
            <Link
              href="/admin/kyc"
              className="text-sm text-white/70 hover:text-white"
            >
              KYC
            </Link>
            <Link
              href="/admin/legal"
              className="text-sm text-white/70 hover:text-white"
            >
              Legal
            </Link>
            <Link
              href="/admin/reports"
              className="text-sm text-white/70 hover:text-white"
            >
              Reportes
            </Link>
            <Link
              href="/admin/content-moderation"
              className="text-sm text-white/70 hover:text-white"
            >
              Moderación
            </Link>
          </div>
        </div>
      </nav>

      {mfaRequired && (
        <div className="border-b border-red-500/30 bg-red-500/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">
                  Debes activar MFA para acceder al panel admin
                </p>
                <p className="text-sm text-red-200/80">
                  El panel administrativo procesa documentos sensibles (KYC,
                  ARCO-P, DMCA). Sin MFA, las acciones serán rechazadas con 403.
                </p>
              </div>
            </div>
            <Link
              href="/settings/security/mfa/setup"
              className="self-stretch sm:self-auto inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Activar MFA ahora
            </Link>
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
