'use client'

/**
 * MfaSection — panel de estado MFA dentro de /settings/security.
 *
 * Muestra:
 *   - Si MFA está activo, desde cuándo y cuántos recovery codes quedan.
 *   - CTA a /settings/security/mfa/setup cuando está desactivado.
 *   - CTA a /settings/security/mfa/disable cuando está activo.
 *
 * No genera secretos ni recovery codes aquí — solo consume /api/mfa/status.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ShieldAlert, KeyRound, Loader2 } from 'lucide-react'
import { mfaApi, type MfaStatus } from '@/lib/api/mfa'

export default function MfaSection() {
  const [status, setStatus] = useState<MfaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const s = await mfaApi.getStatus()
        if (!cancelled) setStatus(s)
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'No se pudo cargar el estado MFA')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Cargando estado de MFA…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    )
  }

  if (!status) return null

  if (status.enabled) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 flex-shrink-0 text-emerald-400" />
          <div className="flex-1">
            <h3 className="font-semibold text-white">MFA activo</h3>
            <p className="mt-1 text-sm text-gray-300">
              Tu cuenta está protegida con autenticación de dos factores
              {status.enabledAt && (
                <>
                  {' '}desde el{' '}
                  {new Date(status.enabledAt).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </>
              )}
              .
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Te quedan{' '}
              <strong className="text-emerald-300">
                {status.recoveryCodesRemaining} de 10
              </strong>{' '}
              códigos de respaldo.
              {status.recoveryCodesRemaining < 3 && (
                <span className="ml-2 text-yellow-300">
                  Te recomendamos regenerarlos.
                </span>
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/settings/security/mfa/disable"
                className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
              >
                Desactivar MFA
              </Link>
              <Link
                href="/settings/security/mfa/setup?regenerate=1"
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
              >
                Regenerar códigos de respaldo
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-6 w-6 flex-shrink-0 text-yellow-400" />
        <div className="flex-1">
          <h3 className="font-semibold text-white">MFA desactivado</h3>
          <p className="mt-1 text-sm text-gray-300">
            Activa la autenticación de dos factores (TOTP) usando Google
            Authenticator, Authy o cualquier app compatible para proteger tu
            cuenta contra robo de credenciales.
          </p>
          <div className="mt-4">
            <Link
              href="/settings/security/mfa/setup"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:from-fuchsia-600 hover:to-pink-600"
            >
              <KeyRound className="h-4 w-4" />
              Activar MFA
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
