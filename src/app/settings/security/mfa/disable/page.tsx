'use client'

/**
 * MFA disable confirmation — Ley 21.719 Ola 4 P1.1.
 *
 * Requiere password (re-auth) y al estilo del backend, opcionalmente acepta
 * un código TOTP/recovery para futuras políticas. La política actual
 * (mfaService.disableMfa) sólo valida password — esta UI prepara el patrón
 * más estricto: password + sesión activa con MFA ya verificada en login.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { mfaApi } from '@/lib/api/mfa'

export default function MfaDisablePage() {
  const router = useRouter()
  const { hasHydrated, user } = useAuthStore()

  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      router.replace('/login?redirect=/settings/security/mfa/disable')
    }
  }, [hasHydrated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!password) {
      setError('Ingresa tu contraseña actual.')
      return
    }
    setSubmitting(true)
    try {
      await mfaApi.disable(password)
      setDone(true)
      // Pequeño delay para que el usuario vea la confirmación.
      setTimeout(() => router.replace('/settings/security'), 1200)
    } catch (err: any) {
      setError(err?.message || 'No se pudo desactivar MFA.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasHydrated) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-10 border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 transition hover:bg-[#222]"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <ShieldOff className="h-5 w-5 text-red-400" />
          <h1 className="text-xl font-semibold text-white">Desactivar MFA</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-red-200">
            Desactivar MFA reduce significativamente la seguridad de tu cuenta.
            Considera mantenerlo activo y solo regenerar los códigos de respaldo
            si los perdiste.
          </p>
        </div>

        {done ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-200">
            MFA desactivado. Redirigiendo…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300">
                Contraseña actual
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-fuchsia-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Link
                href="/settings/security"
                className="text-sm text-gray-400 hover:text-white"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Desactivar MFA
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
