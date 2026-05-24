'use client'

/**
 * /settings/privacy/overview — Privacy Dashboard landing (Ley 21.719).
 *
 * Single page that consolidates everything the user can see, do, and request
 * about their personal data:
 *   • Footprint stats (posts, messages, subscriptions, member since)
 *   • Public vs. subscribers-only vs. private data buckets
 *   • Quick actions: async export, rectification, deletion, consent history,
 *     active sessions
 *   • Retention policy applicable to the account
 *   • Link to the public privacy policy that lists processors
 *
 * Auth-gated: redirects to /login when no token is present after hydration.
 * The summary is fetched client-side because the rest of the auth flow lives
 * client-side (cookie auth + Zustand store). When the backend ships a
 * dedicated /users/me/privacy-summary endpoint, swap `usersApi.getPrivacySummary`
 * to read from it.
 */

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  AlertCircle,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Download,
  Pencil,
  Trash2,
  History,
  Smartphone,
  Server,
  CheckCircle2,
  Cookie,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usersApi, type PrivacySummaryStats } from '@/lib/api/users'
import { consentsApi, type ConsentHistoryEntry, type ConsentPurpose } from '@/lib/api/consents'
import { requestDataExport } from '@/lib/api/legal'
import { useToast } from '@/hooks/useToast'

// ---------------------------------------------------------------------------
// Labels shared with the preferences page so transitions look consistent.
// ---------------------------------------------------------------------------

const PURPOSE_LABELS: Record<ConsentPurpose, string> = {
  SERVICE_EXECUTION: 'Ejecución del servicio',
  MARKETING: 'Marketing',
  PROFILING: 'Personalización',
  INTERNATIONAL_TRANSFER: 'Transferencia internacional',
  THIRD_PARTY_TRANSFER: 'Transferencia a terceros',
  SENSITIVE_DATA: 'Datos sensibles',
  COOKIES_ANALYTICS: 'Cookies — analítica',
  COOKIES_PREFERENCES: 'Cookies — preferencias',
  COOKIES_MARKETING: 'Cookies — marketing',
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export default function PrivacyOverviewPage() {
  const router = useRouter()
  const { token, hasHydrated, user } = useAuthStore()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<PrivacySummaryStats | null>(null)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<ConsentHistoryEntry[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  const [exporting, setExporting] = useState(false)

  // Auth guard + initial data load — runs once auth state is hydrated.
  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login?redirect=/settings/privacy/overview')
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const summary = await usersApi.getPrivacySummary(token ?? undefined)
        if (!cancelled) setStats(summary)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'No se pudieron cargar tus estadísticas')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [hasHydrated, token, router])

  const isCreator = !!user?.isCreator
  const memberSince = stats?.memberSince ?? (user as any)?.createdAt ?? null

  // Stat cards data — derived once so the JSX stays tight.
  const statCards = useMemo(
    () => [
      {
        icon: FileText,
        label: 'Publicaciones',
        value: stats?.totalPosts ?? 0,
        accent: 'text-pink-400 bg-pink-500/10',
      },
      {
        icon: MessageSquare,
        label: 'Mensajes enviados',
        value: stats?.totalMessages ?? 0,
        accent: 'text-sky-400 bg-sky-500/10',
      },
      {
        icon: Users,
        label: 'Suscripciones activas',
        value: stats?.activeSubscriptions ?? 0,
        accent: 'text-emerald-400 bg-emerald-500/10',
      },
      {
        icon: Calendar,
        label: 'Miembro desde',
        value: formatDate(memberSince),
        accent: 'text-purple-400 bg-purple-500/10',
        isText: true,
      },
    ],
    [stats, memberSince]
  )

  async function handleDataExport() {
    if (!token) return
    setExporting(true)
    try {
      const result = await requestDataExport(token)
      toast.success(
        result.message ||
          'Te enviaremos un correo cuando el archivo ZIP esté listo (suele tardar pocos minutos).',
        { title: 'Exportación en curso', duration: 8000 }
      )
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo iniciar la exportación. Intenta más tarde.')
    } finally {
      setExporting(false)
    }
  }

  async function openHistoryModal() {
    setHistoryOpen(true)
    if (history !== null || !token) return
    setHistoryLoading(true)
    try {
      const data = await consentsApi.getMyConsents(token)
      setHistory(data.history)
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo cargar el historial de consentimientos')
      setHistoryOpen(false)
    } finally {
      setHistoryLoading(false)
    }
  }

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" aria-label="Cargando" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-[#222]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#222] rounded-lg transition focus:outline-none focus:ring-2 focus:ring-pink-500/60"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-white" aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-pink-400" aria-hidden="true" />
              Tu huella digital con Apapacho
            </h1>
            <p className="text-xs text-gray-500">
              Todo lo que sabemos de ti, en un solo lugar (Ley 21.719)
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {error && (
          <div
            role="alert"
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300 flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Stats */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            Estadísticas
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" aria-label="Cargando estadísticas" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statCards.map(({ icon: Icon, label, value, accent, isText }) => (
                <div
                  key={label}
                  className="bg-[#1a1a1a] border border-[#222] rounded-xl p-4 flex flex-col gap-2"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className={`font-semibold text-white ${isText ? 'text-sm' : 'text-2xl'}`}>
                    {value}
                  </p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Visibility buckets */}
        <section aria-labelledby="visibility-heading" className="space-y-3">
          <h2 id="visibility-heading" className="text-lg font-semibold text-white">
            Quién puede ver tus datos
          </h2>

          <DataBucket
            icon={Eye}
            accent="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            title="Visible públicamente"
            description="Cualquier persona que visite tu perfil puede ver esto."
            items={[
              'username, displayName, bio',
              'avatar, coverImage',
              'Tus posts marcados como públicos',
              isCreator ? 'Badge "Verificado" (si KYC aprobado)' : null,
            ].filter(Boolean) as string[]}
          />

          <DataBucket
            icon={Lock}
            accent="text-pink-400 bg-pink-500/10 border-pink-500/20"
            title="Solo para tus suscriptores"
            description="Visible para usuarios con una suscripción activa a tu contenido."
            items={['Posts subscribers-only', 'Mensajes directos']}
          />

          <DataBucket
            icon={EyeOff}
            accent="text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
            title="Solo tú y Apapacho"
            description="Datos sensibles cifrados en reposo. No los compartimos con nadie."
            items={[
              'Email',
              'Fecha de nacimiento',
              isCreator ? 'Tu RUT (cifrado)' : null,
              isCreator ? 'Datos bancarios (cifrados)' : null,
              'Audit log de tu actividad',
            ].filter(Boolean) as string[]}
          />
        </section>

        {/* Section 3: Quick actions */}
        <section aria-labelledby="actions-heading" className="space-y-3">
          <h2 id="actions-heading" className="text-lg font-semibold text-white">
            Acciones rápidas
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <ActionButton
              icon={Download}
              title="Descargar todos mis datos"
              description="Recibe un ZIP con tu información completa (Art. 5, derecho de portabilidad)."
              onClick={handleDataExport}
              loading={exporting}
            />
            <ActionLink
              icon={Pencil}
              title="Rectificar mi información"
              description="Solicita corregir datos inexactos o incompletos."
              href="/derechos?type=RECTIFICATION"
            />
            <ActionLink
              icon={History}
              title="Historial de consentimientos"
              description="Últimas decisiones que tomaste sobre tus datos."
              onClick={openHistoryModal}
              as="button"
            />
            <ActionLink
              icon={Smartphone}
              title="Mis sesiones activas"
              description="Dispositivos donde tu cuenta tiene sesión abierta."
              href="/settings/security#sessions"
            />
            <ActionLink
              icon={Cookie}
              title="Preferencias granulares"
              description="Marketing, personalización, cookies — el panel completo."
              href="/settings/privacy/preferences"
            />
            <ActionLink
              icon={Trash2}
              title="Eliminar mi cuenta"
              description="Borrado permanente con anonimización fiscal."
              // The deletion flow lives inside the main /settings page under
              // its account section (uses /users/me/deletion-check + DELETE).
              href="/settings#account"
              danger
            />
          </div>
        </section>

        {/* Section 4: Retention */}
        <section aria-labelledby="retention-heading" className="space-y-3">
          <h2 id="retention-heading" className="text-lg font-semibold text-white">
            Política de retención que se te aplica
          </h2>
          <ul className="bg-[#1a1a1a] border border-[#222] rounded-xl divide-y divide-[#222]">
            <RetentionRow
              label="Tus mensajes"
              detail="Conservados hasta 2 años de inactividad. Luego se eliminan automáticamente."
            />
            <RetentionRow
              label="Tu cuenta"
              detail="Al eliminarla, anonimizamos todos los registros vinculados a tu identidad."
            />
            <RetentionRow
              label="Tus pagos"
              detail="Retenidos 7 años por obligación fiscal (Servicio de Impuestos Internos)."
            />
            <RetentionRow
              label="Logs de seguridad"
              detail="Conservados 12 meses para investigación de incidentes."
            />
          </ul>
        </section>

        {/* Section 5: Processors */}
        <section aria-labelledby="processors-heading" className="space-y-3">
          <h2 id="processors-heading" className="text-lg font-semibold text-white">
            Procesadores que tratan tus datos
          </h2>
          <p className="text-sm text-gray-400">
            Trabajamos con proveedores cuidadosamente seleccionados para entregar el servicio.
            Cada uno está cubierto por contratos de tratamiento de datos.
          </p>
          <Link
            href="/privacidad"
            className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 underline focus:outline-none focus:ring-2 focus:ring-pink-500/60 rounded"
          >
            <Server className="h-4 w-4" aria-hidden="true" />
            Ver lista completa en la Política de Privacidad
          </Link>
        </section>

        {/* Footer */}
        <p className="text-xs text-gray-600 pt-4 border-t border-[#222]">
          ¿Dudas sobre cómo tratamos tus datos? Escribe a{' '}
          <a
            href="mailto:privacidad@appapacho.cl"
            className="text-pink-400 hover:text-pink-300 underline"
          >
            privacidad@appapacho.cl
          </a>
          . Plazo legal de respuesta: 15 días hábiles.
        </p>
      </main>

      {historyOpen && (
        <ConsentHistoryModal
          history={history}
          loading={historyLoading}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

interface DataBucketProps {
  icon: React.ElementType
  title: string
  description: string
  items: string[]
  accent: string
}

function DataBucket({ icon: Icon, title, description, items, accent }: DataBucketProps) {
  return (
    <div className={`bg-[#1a1a1a] border ${accent.split(' ').slice(-1)[0]} rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          <ul className="mt-3 space-y-1.5">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-200">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-gray-500 flex-shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

interface ActionLinkProps {
  icon: React.ElementType
  title: string
  description: string
  href?: string
  onClick?: () => void
  as?: 'link' | 'button'
  danger?: boolean
}

function ActionLink({ icon: Icon, title, description, href, onClick, as = 'link', danger }: ActionLinkProps) {
  const borderClass = danger ? 'border-red-500/30 hover:border-red-500/60' : 'border-[#333] hover:border-pink-500/50'
  const iconClass = danger ? 'text-red-400' : 'text-pink-400'

  const content = (
    <>
      <Icon className={`h-5 w-5 ${iconClass} mb-2 group-hover:scale-110 transition`} aria-hidden="true" />
      <p className="text-white text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </>
  )

  const className = `block w-full text-left p-4 bg-[#1a1a1a] border ${borderClass} rounded-xl transition group focus:outline-none focus:ring-2 focus:ring-pink-500/60`

  if (as === 'button' || onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }

  return (
    <Link href={href ?? '#'} className={className}>
      {content}
    </Link>
  )
}

interface ActionButtonProps {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
  loading?: boolean
}

function ActionButton({ icon: Icon, title, description, onClick, loading }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="block w-full text-left p-4 bg-[#1a1a1a] border border-[#333] hover:border-pink-500/50 rounded-xl transition group disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/60"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 text-pink-400 mb-2 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="h-5 w-5 text-pink-400 mb-2 group-hover:scale-110 transition" aria-hidden="true" />
      )}
      <p className="text-white text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </button>
  )
}

function RetentionRow({ label, detail }: { label: string; detail: string }) {
  return (
    <li className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
      <span className="text-white font-medium">{label}</span>
      <span className="text-gray-400 text-xs sm:text-right sm:max-w-[60%]">{detail}</span>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Consent history modal — focus-trapped enough for keyboard users.
// ---------------------------------------------------------------------------

interface ConsentHistoryModalProps {
  history: ConsentHistoryEntry[] | null
  loading: boolean
  onClose: () => void
}

function ConsentHistoryModal({ history, loading, onClose }: ConsentHistoryModalProps) {
  // Escape-to-close + body scroll lock for the duration of the modal.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-[#222]">
          <h3 id="history-title" className="text-white font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-pink-400" aria-hidden="true" />
            Historial de consentimientos
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="overflow-y-auto p-3 flex-1">
          {loading || history === null ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" aria-label="Cargando historial" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-400 italic p-3">No hay registros aún.</p>
          ) : (
            <ul className="divide-y divide-[#222]">
              {history.map((entry) => (
                <li key={entry.id} className="p-3 text-sm flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white">
                      {PURPOSE_LABELS[entry.purpose]}{' '}
                      <span className={entry.granted && !entry.withdrawnAt ? 'text-green-400' : 'text-gray-500'}>
                        — {entry.withdrawnAt ? 'revocado' : entry.granted ? 'otorgado' : 'rechazado'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {entry.source ? `Fuente: ${entry.source}` : 'Fuente desconocida'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 text-right flex-shrink-0">
                    <p>{formatDateTime(entry.grantedAt)}</p>
                    {entry.withdrawnAt && (
                      <p className="text-gray-600">→ {formatDateTime(entry.withdrawnAt)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="p-3 border-t border-[#222] flex justify-end">
          <Link
            href="/settings/privacy/preferences"
            className="text-xs text-pink-400 hover:text-pink-300 underline focus:outline-none focus:ring-2 focus:ring-pink-500/60 rounded"
          >
            Gestionar preferencias granulares
          </Link>
        </footer>
      </div>
    </div>
  )
}
