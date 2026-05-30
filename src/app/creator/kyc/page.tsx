'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import {
  getKycStatus,
  submitKyc,
  ApiError,
  type KycStatus,
  type KycStatusResponse,
} from '@/lib/api'
import { formatRut, validateRut } from '@/lib/rut'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

type FileSlot = 'idFront' | 'idBack' | 'selfieWithId'

const SLOT_COPY: Record<FileSlot, { title: string; description: string }> = {
  idFront: {
    title: 'Cédula — frente',
    description: 'Foto nítida del frente de tu cédula de identidad chilena.',
  },
  idBack: {
    title: 'Cédula — reverso',
    description: 'Foto nítida del reverso. Debe verse el RUN y la fecha de emisión.',
  },
  selfieWithId: {
    title: 'Selfie con cédula',
    description: 'Sostén la cédula junto a tu cara. Cara e ID ambos visibles.',
  },
}

type FileState = Record<FileSlot, { file: File | null; preview: string | null; error: string | null }>

function initialFileState(): FileState {
  return {
    idFront: { file: null, preview: null, error: null },
    idBack: { file: null, preview: null, error: null },
    selfieWithId: { file: null, preview: null, error: null },
  }
}

function ageFromBirthdate(iso: string): number | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

export default function CreatorKycPage() {
  const router = useRouter()
  const { user, token, isAuthenticated } = useAuthStore()
  const { isLoading: authLoading } = useRequireAuth({ redirectTo: '/login?redirect=/creator/kyc' })

  const [loadingStatus, setLoadingStatus] = useState(true)
  const [status, setStatus] = useState<KycStatusResponse | null>(null)

  const [files, setFiles] = useState<FileState>(initialFileState())
  const [fullLegalName, setFullLegalName] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [consent, setConsent] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Fetch current KYC status
  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    let cancelled = false
    async function fetchStatus() {
      setLoadingStatus(true)
      try {
        const data = await getKycStatus(token ?? undefined)
        if (!cancelled) setStatus(data)
      } catch (err) {
        if (!cancelled) {
          // 404 = not a creator; redirect to dashboard with a hint
          if (err instanceof ApiError && err.statusCode === 404) {
            router.replace('/dashboard')
            return
          }
          setStatus(null)
        }
      } finally {
        if (!cancelled) setLoadingStatus(false)
      }
    }
    fetchStatus()
    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, token, router])

  // Cleanup object URLs on unmount / file swap
  useEffect(() => {
    return () => {
      (Object.values(files) as FileState[FileSlot][]).forEach((s) => {
        if (s.preview) URL.revokeObjectURL(s.preview)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const age = useMemo(() => ageFromBirthdate(birthdate), [birthdate])
  const isRutValid = useMemo(() => (nationalId ? validateRut(nationalId) : false), [nationalId])

  const canSubmit = useMemo(() => {
    if (submitting) return false
    if (!fullLegalName.trim() || fullLegalName.trim().length < 3) return false
    if (!nationalId || !isRutValid) return false
    if (!birthdate || age === null || age < 18) return false
    if (!consent) return false
    return files.idFront.file && files.idBack.file && files.selfieWithId.file
  }, [submitting, fullLegalName, nationalId, isRutValid, birthdate, age, consent, files])

  const handleFileChange = useCallback(
    (slot: FileSlot, file: File | null) => {
      setFiles((prev) => {
        // revoke previous object URL
        const previousPreview = prev[slot].preview
        if (previousPreview) URL.revokeObjectURL(previousPreview)

        if (!file) {
          return { ...prev, [slot]: { file: null, preview: null, error: null } }
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          return {
            ...prev,
            [slot]: {
              file: null,
              preview: null,
              error: `El archivo excede ${MAX_FILE_SIZE_MB}MB`,
            },
          }
        }
        if (!ALLOWED_MIME.includes(file.type.toLowerCase())) {
          return {
            ...prev,
            [slot]: {
              file: null,
              preview: null,
              error: 'Solo se permiten JPEG, PNG o WebP',
            },
          }
        }
        const preview = URL.createObjectURL(file)
        return { ...prev, [slot]: { file, preview, error: null } }
      })
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitError(null)
      setSubmitSuccess(null)
      if (!canSubmit) return

      setSubmitting(true)
      try {
        await submitKyc(
          {
            idFront: files.idFront.file!,
            idBack: files.idBack.file!,
            selfieWithId: files.selfieWithId.file!,
            fullLegalName: fullLegalName.trim(),
            nationalId: formatRut(nationalId),
            birthdate,
            consent,
          },
          token ?? undefined
        )
        setSubmitSuccess(
          'Recibimos tu documentación. La revisamos en un plazo máximo de 48 horas hábiles.'
        )
        // Refresh status; user will see "in review" state
        const fresh = await getKycStatus(token ?? undefined)
        setStatus(fresh)
        setFiles(initialFileState())
        setConsent(false)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al enviar la verificación'
        setSubmitError(msg)
      } finally {
        setSubmitting(false)
      }
    },
    [canSubmit, files, fullLegalName, nationalId, birthdate, consent, token]
  )

  if (authLoading || loadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        <div className="animate-pulse">Cargando…</div>
      </div>
    )
  }

  const currentStatus: KycStatus = status?.status ?? 'PENDING'

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white">
            ← Volver al dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-3">Verificación de identidad</h1>
          <p className="text-white/60 mt-2">
            Para publicar contenido y recibir pagos en Apapacho necesitamos verificar que eres
            mayor de edad y que el ID que subes es tuyo. La revisión es manual y toma hasta 48
            horas hábiles.
          </p>
        </div>

        <StatusBanner status={currentStatus} rejectionReason={status?.rejectionReason ?? null} />

        {(currentStatus === 'PENDING' ||
          currentStatus === 'REJECTED' ||
          currentStatus === 'RESUBMISSION_REQUIRED') && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-8 bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Documentos</h2>
              {(Object.keys(SLOT_COPY) as FileSlot[]).map((slot) => (
                <FileSlotInput
                  key={slot}
                  slot={slot}
                  state={files[slot]}
                  onChange={handleFileChange}
                />
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Datos</h2>
              <Input
                label="Nombre legal completo"
                placeholder="Como aparece en tu cédula"
                value={fullLegalName}
                onChange={(e) => setFullLegalName(e.target.value)}
                maxLength={200}
                required
                autoComplete="off"
              />
              <Input
                label="RUT"
                placeholder="12.345.678-5"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                onBlur={() => setNationalId((v) => (validateRut(v) ? formatRut(v) : v))}
                maxLength={15}
                required
                autoComplete="off"
                error={
                  nationalId && !isRutValid
                    ? 'RUT inválido (dígito verificador no coincide)'
                    : undefined
                }
              />
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  required
                />
                {birthdate && age !== null && (
                  <p
                    className={`mt-1.5 text-sm ${age < 18 ? 'text-red-400' : 'text-white/50'}`}
                  >
                    {age < 18
                      ? 'Debes tener al menos 18 años'
                      : `Edad: ${age} años`}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <label className="flex items-start gap-3 text-sm text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4"
                  required
                />
                <span>
                  Declaro bajo juramento que los documentos que subo son auténticos, me
                  pertenecen, y que los datos entregados son veraces. Autorizo a Apapacho a
                  conservar esta información durante 7 años para cumplimiento regulatorio (Ley
                  19.628 de Protección de Datos y Ley 19.846 sobre Calificación de la Producción
                  Cinematográfica) y a usarla exclusivamente con fines de verificación de
                  identidad y eventual cooperación con autoridades.
                </span>
              </label>
            </section>

            {submitError && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                {submitSuccess}
              </div>
            )}

            <Button type="submit" disabled={!canSubmit} isLoading={submitting}>
              Enviar verificación
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

function StatusBanner({
  status,
  rejectionReason,
}: {
  status: KycStatus
  rejectionReason: string | null
}) {
  if (status === 'APPROVED') {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-green-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✓</span>
          <div>
            <h3 className="font-semibold">Verificación aprobada</h3>
            <p className="text-sm text-green-200/80 mt-1">
              Tu identidad fue verificada. Ya puedes publicar contenido y recibir pagos.
            </p>
          </div>
        </div>
        <Link
          href="/creator/edit"
          className="inline-block mt-4 text-sm underline hover:no-underline"
        >
          Ir a mi perfil de creador →
        </Link>
      </div>
    )
  }
  if (status === 'SUBMITTED' || status === 'IN_REVIEW') {
    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 text-blue-100">
        <h3 className="font-semibold">Verificación en revisión</h3>
        <p className="text-sm text-blue-200/80 mt-1">
          Recibimos tu documentación. La revisamos en un plazo máximo de 48 horas hábiles. Te
          avisaremos por email en cuanto tengamos una decisión.
        </p>
      </div>
    )
  }
  if (status === 'REJECTED') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-100">
        <h3 className="font-semibold">Verificación rechazada</h3>
        {rejectionReason && (
          <p className="text-sm text-red-200/80 mt-1">
            Motivo: <span className="text-white">{rejectionReason}</span>
          </p>
        )}
        <p className="text-sm text-red-200/80 mt-2">
          Si crees que hubo un error, escríbenos a{' '}
          <a href="mailto:soporte@appapacho.cl" className="underline">
            soporte@appapacho.cl
          </a>{' '}
          para iniciar una apelación.
        </p>
      </div>
    )
  }
  if (status === 'RESUBMISSION_REQUIRED') {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-amber-100">
        <h3 className="font-semibold">Necesitamos nuevos documentos</h3>
        {rejectionReason && (
          <p className="text-sm text-amber-200/80 mt-1">
            Motivo: <span className="text-white">{rejectionReason}</span>
          </p>
        )}
        <p className="text-sm text-amber-200/80 mt-2">
          Vuelve a subir tus documentos tomando en cuenta el motivo indicado.
        </p>
      </div>
    )
  }
  // PENDING
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h3 className="font-semibold">Aún no has enviado tu verificación</h3>
      <p className="text-sm text-white/60 mt-1">
        Completa el formulario. Necesitamos 3 fotos: frente y reverso de tu cédula, y una
        selfie tuya sosteniendo la cédula junto a tu cara.
      </p>
    </div>
  )
}

function FileSlotInput({
  slot,
  state,
  onChange,
}: {
  slot: FileSlot
  state: FileState[FileSlot]
  onChange: (slot: FileSlot, file: File | null) => void
}) {
  const copy = SLOT_COPY[slot]
  return (
    <div className="border border-white/10 rounded-xl p-4 bg-black/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium">{copy.title}</h3>
          <p className="text-xs text-white/50 mt-1">{copy.description}</p>
        </div>
        {state.file && (
          <button
            type="button"
            onClick={() => onChange(slot, null)}
            className="text-xs text-white/60 hover:text-white underline"
          >
            Cambiar
          </button>
        )}
      </div>

      {state.preview ? (
        <div className="mt-3">
          {/* Preview is a local blob URL; safe to use <img>. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.preview}
            alt={copy.title}
            className="max-h-48 rounded-lg border border-white/10"
          />
          <p className="text-xs text-white/50 mt-2">
            {state.file?.name} · {((state.file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <label className="block mt-3 cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => onChange(slot, e.target.files?.[0] ?? null)}
          />
          <span className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
            Seleccionar archivo
          </span>
        </label>
      )}
      {state.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
    </div>
  )
}
