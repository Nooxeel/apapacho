'use client'

/**
 * MFA enrollment wizard — Ley 21.719 Ola 4 P1.1.
 *
 * Steps:
 *   1. Mostrar QR + secret manual + instrucciones (Authy / Google Authenticator)
 *   2. Pedir primer código TOTP
 *   3. Mostrar recovery codes (UNA VEZ) con "Descargar TXT" + "Copiar"
 *   4. Confirmar guardado con checkbox + botón final
 *
 * El backend NO persiste hasta paso 2 (POST /mfa/enable). Si el usuario
 * abandona en paso 1, no queda secreto inválido en DB.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  KeyRound,
  Copy,
  Download,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { mfaApi } from '@/lib/api/mfa'

type Step = 1 | 2 | 3 | 4

export default function MfaSetupPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { isLoading: authLoading } = useRequireAuth({ redirectTo: '/login?redirect=/settings/security/mfa/setup' })
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 data
  const [secret, setSecret] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [otpAuthUrl, setOtpAuthUrl] = useState('')

  // Step 2 data
  const [totpCode, setTotpCode] = useState('')

  // Step 3 data
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [acknowledgedSaved, setAcknowledgedSaved] = useState(false)



  // Bootstrap enrollment on mount.
  useEffect(() => {
    let cancelled = false
    async function setup() {
      try {
        const data = await mfaApi.setup()
        if (cancelled) return
        setSecret(data.secret)
        setQrDataUrl(data.qrCodeDataUrl)
        setOtpAuthUrl(data.otpAuthUrl)
      } catch (err: any) {
        if (!cancelled) {
          if (err?.statusCode === 409) {
            setError('MFA ya está activado en tu cuenta.')
          } else {
            setError(err?.message || 'No se pudo iniciar el enrollment.')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (!authLoading && user) setup()
    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^\d{6}$/.test(totpCode)) {
      setError('Ingresa los 6 dígitos del código.')
      return
    }
    setSubmitting(true)
    try {
      const result = await mfaApi.enable(secret, totpCode)
      setRecoveryCodes(result.recoveryCodes)
      setStep(3)
    } catch (err: any) {
      setError(err?.message || 'Código incorrecto. Vuelve a intentarlo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret)
    } catch {
      // ignore
    }
  }

  const handleCopyCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'))
    } catch {
      // ignore
    }
  }

  const handleDownloadCodes = () => {
    const content =
      `Apapacho — Códigos de respaldo MFA\n` +
      `Generados: ${new Date().toLocaleString('es-CL')}\n\n` +
      recoveryCodes.join('\n') +
      `\n\nCada código solo puede usarse UNA vez.\n` +
      `Si los pierdes, deberás contactar soporte para recuperar el acceso.\n`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apapacho-recovery-codes-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (authLoading) return null

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
          <Shield className="h-5 w-5 text-fuchsia-400" />
          <h1 className="text-xl font-semibold text-white">Activar MFA</h1>
          <span className="ml-auto text-sm text-gray-400">Paso {step} de 3</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading && (
          <div className="flex items-center gap-2 p-4 text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparando…
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && step === 1 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                1. Escanea el código QR
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Abre tu app de autenticación —{' '}
                <strong>Google Authenticator</strong>, <strong>Authy</strong>,{' '}
                <strong>1Password</strong> o similar — y escanea este código.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt="Código QR para enrollment MFA"
                  className="h-64 w-64 rounded-lg bg-white p-2"
                />
              ) : (
                <div className="h-64 w-64 animate-pulse rounded-lg bg-white/10" />
              )}
              <div className="w-full">
                <label className="text-xs uppercase tracking-wide text-gray-400">
                  ¿No puedes escanear? Ingrésalo manualmente:
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 break-all rounded-lg bg-black/40 px-3 py-2 font-mono text-sm text-fuchsia-300">
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="rounded-lg border border-white/15 p-2 text-gray-200 hover:bg-white/10"
                    aria-label="Copiar secreto"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 px-5 py-2.5 font-medium text-white hover:from-fuchsia-600 hover:to-pink-600"
              >
                Ya escaneé el código
              </button>
            </div>
          </section>
        )}

        {!loading && step === 2 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                2. Ingresa el código de tu app
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Tu app debería mostrar un código de 6 dígitos que cambia cada
                30 segundos. Cópialo aquí para confirmar el vínculo.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-white focus:border-fuchsia-500 focus:outline-none"
                aria-label="Código TOTP de 6 dígitos"
              />

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  ← Volver al QR
                </button>
                <button
                  type="submit"
                  disabled={submitting || totpCode.length !== 6}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 px-5 py-2.5 font-medium text-white hover:from-fuchsia-600 hover:to-pink-600 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verificar y activar
                </button>
              </div>
            </form>
          </section>
        )}

        {!loading && step === 3 && (
          <section className="space-y-6">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
                <div>
                  <h2 className="font-semibold text-white">
                    MFA activado correctamente
                  </h2>
                  <p className="mt-1 text-sm text-gray-300">
                    A partir de tu próximo inicio de sesión te pediremos un
                    código de tu app de autenticación.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                3. Guarda tus códigos de respaldo
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Si pierdes tu teléfono o desinstalas tu app, podrás usar UNO de
                estos 10 códigos para entrar. Cada uno funciona una sola vez y
                no podrás volver a verlos.
              </p>
            </div>

            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {recoveryCodes.map((code) => (
                  <code
                    key={code}
                    className="rounded-lg bg-black/40 px-3 py-2 text-yellow-200"
                  >
                    {code}
                  </code>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDownloadCodes}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
                >
                  <Download className="h-4 w-4" />
                  Descargar TXT
                </button>
                <button
                  type="button"
                  onClick={handleCopyCodes}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" />
                  Copiar todos
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={acknowledgedSaved}
                onChange={(e) => setAcknowledgedSaved(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500"
              />
              <span className="text-sm text-gray-300">
                Confirmo que guardé los códigos de respaldo en un lugar seguro
                (gestor de contraseñas, archivo cifrado, papel impreso). Entiendo
                que no podré volver a verlos.
              </span>
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={!acknowledgedSaved}
                onClick={() => router.replace('/settings/security')}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 px-5 py-2.5 font-medium text-white hover:from-fuchsia-600 hover:to-pink-600 disabled:opacity-50"
              >
                <KeyRound className="h-4 w-4" />
                Terminar
              </button>
            </div>
          </section>
        )}

        <section className="mt-8">
          <Link
            href="/settings/security"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Volver a Seguridad
          </Link>
        </section>
      </main>
    </div>
  )
}
