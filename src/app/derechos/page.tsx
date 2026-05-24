'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import {
  submitArcopRequest,
  listMyArcopRequests,
  getProfileForArcop,
  submitThirdPartyArcopRequest,
  ARCOP_TYPE_LABELS,
  ARCOP_STATUS_LABELS,
  ARCOP_RELATIONSHIP_LABELS,
  type ArcopRightType,
  type ArcopRequestRecord,
  type ArcopRequestStatus,
  type ArcopProfilePrefill,
  type ArcopThirdPartyRelationship,
} from '@/lib/api/legal'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

interface RectifyField {
  key: string
  value: string
}

const RIGHT_DESCRIPTIONS: Record<ArcopRightType, string> = {
  ACCESS: 'Solicita una copia de los datos personales que tratamos sobre ti.',
  RECTIFICATION: 'Corrige datos inexactos, incompletos o desactualizados.',
  CANCELLATION: 'Solicita la eliminación de tus datos cuando ya no sean necesarios.',
  OPPOSITION: 'Opónte a un tratamiento específico (por ejemplo, marketing o perfilamiento).',
  PORTABILITY: 'Recibe tus datos en formato estructurado (ZIP con JSON + media).',
}

const ALL_RIGHTS: ArcopRightType[] = [
  'ACCESS',
  'RECTIFICATION',
  'CANCELLATION',
  'OPPOSITION',
  'PORTABILITY',
]

const ALL_RELATIONSHIPS: ArcopThirdPartyRelationship[] = [
  'legal_representative',
  'parent',
  'guardian',
  'executor',
  'other',
]

const STATUS_FILTERS: Array<{ id: 'ALL' | ArcopRequestStatus; label: string }> = [
  { id: 'ALL', label: 'Todas' },
  { id: 'PENDING', label: 'Recibidas' },
  { id: 'IN_PROGRESS', label: 'En proceso' },
  { id: 'COMPLETED', label: 'Completadas' },
  { id: 'REJECTED', label: 'Rechazadas' },
]

const STATUS_BADGE_CLASS: Record<ArcopRequestStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-200',
  RECEIVED: 'bg-yellow-500/20 text-yellow-200',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-200',
  COMPLETED: 'bg-green-500/20 text-green-200',
  REJECTED: 'bg-red-500/20 text-red-200',
}

const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_EVIDENCE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]

type ActiveTab = 'new' | 'history' | 'third-party'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DerechosPage() {
  const { user, token, isAuthenticated, hasHydrated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<ActiveTab>('new')

  // Pre-fill profile data for the personal form
  const [profilePrefill, setProfilePrefill] = useState<ArcopProfilePrefill | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // History tab
  const [previousRequests, setPreviousRequests] = useState<ArcopRequestRecord[]>([])
  const [loadingPrevious, setLoadingPrevious] = useState(false)
  const [previousError, setPreviousError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | ArcopRequestStatus>('ALL')

  const loadPreviousRequests = useCallback(async () => {
    if (!isAuthenticated) return
    setLoadingPrevious(true)
    setPreviousError(null)
    try {
      const response = await listMyArcopRequests(token ?? undefined)
      setPreviousRequests(response.requests ?? [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar tu historial.'
      setPreviousError(message)
    } finally {
      setLoadingPrevious(false)
    }
  }, [isAuthenticated, token])

  const loadProfilePrefill = useCallback(async () => {
    if (!isAuthenticated || !token) return
    setProfileLoading(true)
    try {
      const prefill = await getProfileForArcop(token)
      setProfilePrefill(prefill)
    } catch {
      // Pre-fill is best-effort; the form falls back to manual entry.
      setProfilePrefill(null)
    } finally {
      setProfileLoading(false)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    if (!hasHydrated) return
    if (isAuthenticated) {
      loadPreviousRequests()
      loadProfilePrefill()
    } else {
      setProfilePrefill(null)
      setPreviousRequests([])
    }
  }, [hasHydrated, isAuthenticated, loadPreviousRequests, loadProfilePrefill])

  // When the user is not authenticated, default to the third-party tab since
  // the personal tab requires login.
  useEffect(() => {
    if (hasHydrated && !isAuthenticated && activeTab === 'history') {
      setActiveTab('third-party')
    }
  }, [hasHydrated, isAuthenticated, activeTab])

  return (
    <div className="min-h-screen bg-[#0f0f14] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white mb-2">
            Ejercer mis derechos sobre datos personales
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Conforme a la Ley N° 19.628 y la Ley N° 21.719 — SLA de respuesta: 15 días hábiles
          </p>

          <RightsOverview />

          <Tabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAuthenticated={isAuthenticated}
            hasHydrated={hasHydrated}
          />

          <div className="mt-8">
            {activeTab === 'new' && (
              <NewRequestTab
                isAuthenticated={isAuthenticated}
                hasHydrated={hasHydrated}
                token={token}
                profile={profilePrefill}
                profileLoading={profileLoading}
                onSubmitted={loadPreviousRequests}
              />
            )}

            {activeTab === 'history' && isAuthenticated && (
              <HistoryTab
                requests={previousRequests}
                loading={loadingPrevious}
                error={previousError}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                username={user?.username}
              />
            )}

            {activeTab === 'third-party' && <ThirdPartyTab />}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-sm text-gray-400 space-y-2">
            <p>
              <strong className="text-gray-200">Delegado de Protección de Datos (DPD):</strong>{' '}
              <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                privacidad@appapacho.cl
              </a>
            </p>
            <p>
              Para conocer en detalle las finalidades, plazos de retención y bases de licitud, consulta nuestra{' '}
              <Link href="/privacidad" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                Política de Privacidad
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RightsOverview() {
  return (
    <section className="text-gray-300">
      <h2 className="text-xl font-semibold text-white mt-2 mb-4">¿Qué derechos puedes ejercer?</h2>
      <p>
        Como titular de datos personales, dispones de los derechos clásicos <strong>ARCO-P</strong>{' '}
        (Acceso, Rectificación, Cancelación, Oposición y Portabilidad), reforzados por la Ley N° 21.719
        con derechos adicionales como la oposición al perfilamiento y a las decisiones automatizadas.
      </p>
      <ul className="list-disc list-inside mt-4 space-y-2">
        {ALL_RIGHTS.map((r) => (
          <li key={r}>
            <strong>{ARCOP_TYPE_LABELS[r]}:</strong> {RIGHT_DESCRIPTIONS[r]}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-gray-400">
        Responderemos a tu solicitud dentro de un plazo máximo de <strong>15 días hábiles</strong>{' '}
        contados desde su recepción.
      </p>
    </section>
  )
}

interface TabsProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  isAuthenticated: boolean
  hasHydrated: boolean
}

function Tabs({ activeTab, setActiveTab, isAuthenticated, hasHydrated }: TabsProps) {
  const tabs: Array<{ id: ActiveTab; label: string; show: boolean }> = [
    { id: 'new', label: 'Nueva solicitud', show: true },
    { id: 'history', label: 'Mis solicitudes anteriores', show: hasHydrated && isAuthenticated },
    { id: 'third-party', label: 'Solicitud por tercero', show: true },
  ]

  return (
    <div className="mt-8 flex gap-2 border-b border-white/10 flex-wrap">
      {tabs
        .filter((t) => t.show)
        .map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${
              activeTab === tab.id
                ? 'border-fuchsia-400 text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
    </div>
  )
}

interface NewRequestTabProps {
  isAuthenticated: boolean
  hasHydrated: boolean
  token: string | null
  profile: ArcopProfilePrefill | null
  profileLoading: boolean
  onSubmitted: () => Promise<void>
}

function NewRequestTab({
  isAuthenticated,
  hasHydrated,
  token,
  profile,
  profileLoading,
  onSubmitted,
}: NewRequestTabProps) {
  const [rightType, setRightType] = useState<ArcopRightType>('ACCESS')
  const [motive, setMotive] = useState('')
  const [rectifyFields, setRectifyFields] = useState<RectifyField[]>([{ key: '', value: '' }])
  const [notRobot, setNotRobot] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const updateRectifyField = (index: number, key: string, value: string) => {
    setRectifyFields((fields) => {
      const next = [...fields]
      next[index] = { key, value }
      return next
    })
  }

  const addRectifyField = () => {
    setRectifyFields((fields) => [...fields, { key: '', value: '' }])
  }

  const removeRectifyField = (index: number) => {
    setRectifyFields((fields) => fields.filter((_, i) => i !== index))
  }

  const buildDataToRectify = (): Record<string, string> | undefined => {
    if (rightType !== 'RECTIFICATION') return undefined
    const entries = rectifyFields
      .map((f) => [f.key.trim(), f.value.trim()] as [string, string])
      .filter(([k, v]) => k.length > 0 && v.length > 0)
    if (entries.length === 0) return undefined
    return Object.fromEntries(entries)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!isAuthenticated) {
      setSubmitError('Debes iniciar sesión para enviar una solicitud vinculada a tu cuenta.')
      return
    }

    if (!notRobot) {
      setSubmitError('Confirma que no eres un bot antes de enviar la solicitud.')
      return
    }

    if (rightType === 'RECTIFICATION') {
      const dataToRectify = buildDataToRectify()
      if (!dataToRectify) {
        setSubmitError('Indica al menos un campo a rectificar (clave y valor nuevo).')
        return
      }
    }

    setSubmitting(true)
    try {
      const result = await submitArcopRequest(
        {
          type: rightType,
          motive: motive.trim() || undefined,
          dataToRectify: buildDataToRectify(),
        },
        token ?? undefined
      )

      setSubmitSuccess(
        `Solicitud recibida. N° de ticket: ${result.request.id}. Recibirás una respuesta dentro de 15 días hábiles en el correo asociado a tu cuenta.`
      )
      setMotive('')
      setRectifyFields([{ key: '', value: '' }])
      setNotRobot(false)
      await onSubmitted()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar la solicitud.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      {hasHydrated && !isAuthenticated && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 mb-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">
            Inicia sesión para ejercer tus derechos
          </h3>
          <p className="text-sm text-yellow-100/80">
            Para enviar una solicitud vinculada a tu cuenta debes iniciar sesión. Si actúas en
            representación de otra persona (representante legal, tutor o albacea), usa la
            pestaña <strong>Solicitud por tercero</strong>.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center mt-4 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      )}

      {isAuthenticated && profile && (
        <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl p-4 mb-6 text-sm text-gray-300">
          <p className="text-xs uppercase tracking-wider text-fuchsia-300/80 mb-2">
            Datos pre-llenados desde tu cuenta
          </p>
          <dl className="grid sm:grid-cols-2 gap-2">
            <div>
              <dt className="text-gray-500 text-xs">Nombre</dt>
              <dd>{profile.displayName}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs">Email de notificación</dt>
              <dd className="break-all">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs">Username</dt>
              <dd>@{profile.username}</dd>
            </div>
            {profile.birthYear && (
              <div>
                <dt className="text-gray-500 text-xs">Año de nacimiento</dt>
                <dd>{profile.birthYear}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500 text-xs">Tipo de cuenta</dt>
              <dd>{profile.isCreator ? 'Creador/a' : 'Usuario/a'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs">Cuenta creada</dt>
              <dd>{new Date(profile.accountCreatedAt).toLocaleDateString('es-CL')}</dd>
            </div>
          </dl>
        </div>
      )}

      {isAuthenticated && !profile && profileLoading && (
        <p className="text-xs text-gray-500 mb-4">Cargando tus datos…</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="rightType" className="block text-sm font-medium text-gray-200 mb-2">
            Tipo de derecho a ejercer
          </label>
          <select
            id="rightType"
            value={rightType}
            onChange={(e) => setRightType(e.target.value as ArcopRightType)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            disabled={!isAuthenticated || submitting}
          >
            {ALL_RIGHTS.map((r) => (
              <option key={r} value={r} className="bg-[#1a1a25]">
                {ARCOP_TYPE_LABELS[r]}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-400">{RIGHT_DESCRIPTIONS[rightType]}</p>
        </div>

        <div>
          <label htmlFor="motive" className="block text-sm font-medium text-gray-200 mb-2">
            Motivo (opcional)
          </label>
          <textarea
            id="motive"
            value={motive}
            onChange={(e) => setMotive(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Describe brevemente el motivo o contexto de tu solicitud."
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            disabled={!isAuthenticated || submitting}
          />
        </div>

        {rightType === 'RECTIFICATION' && (
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Datos a rectificar
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Indica el nombre del campo (por ejemplo: <code className="text-fuchsia-300">email</code>,{' '}
              <code className="text-fuchsia-300">displayName</code>) y el valor correcto.
            </p>
            <div className="space-y-2">
              {rectifyFields.map((field, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Campo"
                    value={field.key}
                    onChange={(e) => updateRectifyField(idx, e.target.value, field.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    disabled={!isAuthenticated || submitting}
                  />
                  <input
                    type="text"
                    placeholder="Valor correcto"
                    value={field.value}
                    onChange={(e) => updateRectifyField(idx, field.key, e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    disabled={!isAuthenticated || submitting}
                  />
                  {rectifyFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRectifyField(idx)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg"
                      aria-label="Eliminar campo"
                      disabled={!isAuthenticated || submitting}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRectifyField}
              className="mt-2 text-sm text-fuchsia-400 hover:text-fuchsia-300"
              disabled={!isAuthenticated || submitting}
            >
              + Añadir otro campo
            </button>
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notRobot}
              onChange={(e) => setNotRobot(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500"
              disabled={!isAuthenticated || submitting}
            />
            <span className="text-sm text-gray-300">
              No soy un bot{' '}
              <span className="text-xs text-gray-500">
                (verificación reCAPTCHA pendiente de integración)
              </span>
            </span>
          </label>
        </div>

        {submitError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm">
            {submitSuccess}
          </div>
        )}

        <button
          type="submit"
          disabled={!isAuthenticated || submitting}
          className="w-full px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-fuchsia-500/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {submitting ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </form>
    </section>
  )
}

interface HistoryTabProps {
  requests: ArcopRequestRecord[]
  loading: boolean
  error: string | null
  statusFilter: 'ALL' | ArcopRequestStatus
  onStatusFilterChange: (s: 'ALL' | ArcopRequestStatus) => void
  username?: string
}

function HistoryTab({
  requests,
  loading,
  error,
  statusFilter,
  onStatusFilterChange,
  username,
}: HistoryTabProps) {
  const filtered =
    statusFilter === 'ALL'
      ? requests
      : requests.filter((r) => r.status === statusFilter)

  return (
    <section>
      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Filtros por estado">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onStatusFilterChange(f.id)}
            className={`px-3 py-1.5 text-xs rounded-md border transition ${
              statusFilter === f.id
                ? 'border-fuchsia-400 bg-fuchsia-500/20 text-white'
                : 'border-white/10 text-white/60 hover:text-white hover:border-white/30'
            }`}
            aria-pressed={statusFilter === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Cargando historial…</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-gray-400">
          {statusFilter === 'ALL'
            ? `Aún no has enviado ninguna solicitud${username ? `, ${username}` : ''}.`
            : 'No hay solicitudes con este estado.'}
        </p>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="min-w-full text-sm border border-white/10 rounded-lg">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">
                  Tipo
                </th>
                <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">
                  Estado
                </th>
                <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">
                  Recibida
                </th>
                <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">
                  Vence
                </th>
                <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">
                  Adjunto
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {filtered.map((req) => (
                <tr key={req.id} className="border-b border-white/10 last:border-b-0">
                  <td className="px-3 py-2">{ARCOP_TYPE_LABELS[req.type]}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md ${STATUS_BADGE_CLASS[req.status]}`}
                    >
                      {ARCOP_STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {new Date(req.createdAt).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {new Date(req.dueBy).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {req.attachmentUrl ? (
                      <a
                        href={req.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                      >
                        Descargar
                      </a>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function ThirdPartyTab() {
  const [rightType, setRightType] = useState<ArcopRightType>('ACCESS')
  const [motive, setMotive] = useState('')
  const [thirdPartyName, setThirdPartyName] = useState('')
  const [thirdPartyEmail, setThirdPartyEmail] = useState('')
  const [thirdPartyIdNumber, setThirdPartyIdNumber] = useState('')
  const [relationship, setRelationship] = useState<ArcopThirdPartyRelationship>(
    'legal_representative'
  )
  const [targetName, setTargetName] = useState('')
  const [targetEmail, setTargetEmail] = useState('')
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [evidenceError, setEvidenceError] = useState<string | null>(null)
  const [swornStatement, setSwornStatement] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setEvidenceError(null)
    if (!file) {
      setEvidenceFile(null)
      return
    }
    if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
      setEvidenceError('Solo se aceptan archivos PDF, JPG o PNG.')
      setEvidenceFile(null)
      return
    }
    if (file.size > MAX_EVIDENCE_BYTES) {
      setEvidenceError('El archivo no puede exceder 10MB.')
      setEvidenceFile(null)
      return
    }
    setEvidenceFile(file)
  }

  const resetForm = () => {
    setRightType('ACCESS')
    setMotive('')
    setThirdPartyName('')
    setThirdPartyEmail('')
    setThirdPartyIdNumber('')
    setRelationship('legal_representative')
    setTargetName('')
    setTargetEmail('')
    setEvidenceFile(null)
    setSwornStatement(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!evidenceFile) {
      setSubmitError('Debes adjuntar el documento que acredita tu condición.')
      return
    }
    if (motive.trim().length < 10) {
      setSubmitError('Describe el motivo de la solicitud (mínimo 10 caracteres).')
      return
    }
    if (!swornStatement) {
      setSubmitError('Debes aceptar la declaración jurada para continuar.')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitThirdPartyArcopRequest({
        type: rightType,
        motive: motive.trim(),
        targetEmail: targetEmail.trim().toLowerCase(),
        targetName: targetName.trim(),
        thirdPartyName: thirdPartyName.trim(),
        thirdPartyEmail: thirdPartyEmail.trim().toLowerCase(),
        thirdPartyIdNumber: thirdPartyIdNumber.trim(),
        thirdPartyRelationship: relationship,
        evidenceFile,
        swornStatement: true,
      })

      const dueByStr = new Date(result.dueBy).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      setSubmitSuccess(
        `Solicitud recibida. N° de ticket: ${result.requestId}. Plazo máximo de respuesta: ${dueByStr}.`
      )
      resetForm()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar la solicitud.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 mb-6 text-sm text-gray-300">
        <h3 className="text-base font-semibold text-blue-200 mb-2">
          ¿Cuándo usar este formulario?
        </h3>
        <p className="mb-2">
          Si actúas en representación de otra persona (por ejemplo, en nombre de un familiar
          fallecido, como tutor de un menor o como representante legal mediante mandato), debes usar
          este formulario en lugar del personal.
        </p>
        <p className="text-gray-400 text-xs">
          Si actúas en representación de un <strong>fallecido</strong>, adjunta el certificado de
          defunción + documento que acredite tu condición (heredero, ejecutor testamentario). Para{' '}
          <strong>menores</strong>, adjunta el acta de nacimiento que acredite tu vinculación parental
          o el documento de tutela legal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-white uppercase tracking-wider">
            Tus datos (representante)
          </legend>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tpName" className="block text-xs text-gray-300 mb-1">
                Nombre completo *
              </label>
              <input
                id="tpName"
                type="text"
                value={thirdPartyName}
                onChange={(e) => setThirdPartyName(e.target.value)}
                required
                maxLength={200}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="tpEmail" className="block text-xs text-gray-300 mb-1">
                Email *
              </label>
              <input
                id="tpEmail"
                type="email"
                value={thirdPartyEmail}
                onChange={(e) => setThirdPartyEmail(e.target.value)}
                required
                maxLength={255}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="tpRut" className="block text-xs text-gray-300 mb-1">
                RUT *
              </label>
              <input
                id="tpRut"
                type="text"
                value={thirdPartyIdNumber}
                onChange={(e) => setThirdPartyIdNumber(e.target.value)}
                required
                placeholder="12.345.678-9"
                maxLength={15}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="tpRelationship" className="block text-xs text-gray-300 mb-1">
                Relación con el titular *
              </label>
              <select
                id="tpRelationship"
                value={relationship}
                onChange={(e) =>
                  setRelationship(e.target.value as ArcopThirdPartyRelationship)
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                disabled={submitting}
              >
                {ALL_RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel} className="bg-[#1a1a25]">
                    {ARCOP_RELATIONSHIP_LABELS[rel]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-white uppercase tracking-wider">
            Datos del titular (por quien actúas)
          </legend>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="targetName" className="block text-xs text-gray-300 mb-1">
                Nombre completo del titular *
              </label>
              <input
                id="targetName"
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                required
                maxLength={200}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="targetEmail" className="block text-xs text-gray-300 mb-1">
                Email del titular *
              </label>
              <input
                id="targetEmail"
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                required
                maxLength={255}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                disabled={submitting}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-white uppercase tracking-wider">
            Solicitud
          </legend>

          <div>
            <label htmlFor="tpRightType" className="block text-xs text-gray-300 mb-1">
              Derecho a ejercer *
            </label>
            <select
              id="tpRightType"
              value={rightType}
              onChange={(e) => setRightType(e.target.value as ArcopRightType)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              disabled={submitting}
            >
              {ALL_RIGHTS.map((r) => (
                <option key={r} value={r} className="bg-[#1a1a25]">
                  {ARCOP_TYPE_LABELS[r]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">{RIGHT_DESCRIPTIONS[rightType]}</p>
          </div>

          <div>
            <label htmlFor="tpMotive" className="block text-xs text-gray-300 mb-1">
              Motivo (mínimo 10 caracteres) *
            </label>
            <textarea
              id="tpMotive"
              value={motive}
              onChange={(e) => setMotive(e.target.value)}
              required
              rows={4}
              minLength={10}
              maxLength={5000}
              placeholder="Describe el motivo, contexto y datos relevantes para procesar la solicitud."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="tpEvidence" className="block text-xs text-gray-300 mb-1">
              Documento de acreditación (PDF, JPG o PNG — máx 10MB) *
            </label>
            <input
              id="tpEvidence"
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              required
              className="w-full text-sm text-gray-300 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-fuchsia-500/30 file:text-white hover:file:bg-fuchsia-500/40 file:cursor-pointer"
              disabled={submitting}
            />
            {evidenceFile && !evidenceError && (
              <p className="mt-1 text-xs text-green-300">
                Archivo seleccionado: {evidenceFile.name} (
                {(evidenceFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {evidenceError && (
              <p className="mt-1 text-xs text-red-300">{evidenceError}</p>
            )}
          </div>
        </fieldset>

        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={swornStatement}
              onChange={(e) => setSwornStatement(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500"
              disabled={submitting}
              required
            />
            <span className="text-sm text-gray-300">
              <strong className="text-white">Declaración jurada:</strong> Declaro bajo juramento que
              la información proporcionada es verídica y que tengo la facultad legal para representar
              al titular de los datos en virtud del documento adjunto. Entiendo que la presentación
              de antecedentes falsos puede constituir un delito.
            </span>
          </label>
        </div>

        {submitError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm">
            {submitSuccess}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !evidenceFile || !swornStatement}
          className="w-full px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-fuchsia-500/40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {submitting ? 'Enviando…' : 'Enviar solicitud por tercero'}
        </button>
      </form>
    </section>
  )
}
