'use client'

/**
 * Settings · Seguridad — Ley 21.719 Ola 4 P1.1.
 *
 * Panel principal de seguridad de la cuenta. Por ahora hospeda únicamente
 * la sección MFA; en el futuro podrán colgarse sesiones activas, historial
 * de logins, etc.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import MfaSection from '@/components/security/MfaSection'
import ActiveSessions from '@/components/security/ActiveSessions'

export default function SecuritySettingsPage() {
  const router = useRouter()
  const { token, hasHydrated, user } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!token && !user) {
      router.replace('/login?redirect=/settings/security')
    }
  }, [hasHydrated, token, user, router])

  if (!hasHydrated) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-10 border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 transition hover:bg-[#222]"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <Shield className="h-5 w-5 text-fuchsia-400" />
          <h1 className="text-xl font-semibold text-white">Seguridad</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="mb-6 text-sm text-gray-400">
          Protege tu cuenta con autenticación de dos factores (MFA) y revisa tu
          actividad reciente. Para administradores, MFA es obligatorio.
        </p>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Autenticación de dos factores
          </h2>
          <MfaSection />
        </section>

        <section className="mt-10 space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Sesiones activas
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Dispositivos donde tu cuenta está iniciada. Si ves una sesión que
              no reconoces, ciérrala y cambia tu contraseña.
            </p>
          </div>
          <ActiveSessions />
        </section>

        <section className="mt-8">
          <Link
            href="/settings"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Volver a Configuración
          </Link>
        </section>
      </main>
    </div>
  )
}
