'use client'

/**
 * /settings/privacy/preferences — granular consent management UI (Ley 21.719, Group 3.3).
 *
 * Surfaces the four signup finalities + the three cookie purposes as
 * independent toggles. Includes an audit trail (last 20 transitions) and
 * shortcuts to the ARCO-P workflow (`/derechos`) and the data export +
 * account deletion flows that already exist.
 *
 * SERVICE_EXECUTION is intentionally NOT shown as a toggle — it cannot be
 * withdrawn without closing the account. The page links to the existing
 * deletion flow at `/settings` instead.
 *
 * Reached from the Privacy Dashboard landing at /settings/privacy/overview.
 */

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Mail,
  Sparkles,
  Globe,
  BarChart3,
  Settings as SettingsIcon,
  Cookie,
  History,
  Download,
  FileText,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import {
  consentsApi,
  type ConsentPurpose,
  type ConsentState,
  type ConsentHistoryEntry,
} from '@/lib/api/consents'

interface ToggleConfig {
  purpose: ConsentPurpose
  label: string
  description: string
  icon: React.ElementType
  group: 'data' | 'cookies'
}

// Order matches the signup form so the user sees the same finalities they
// agreed to (or declined) at registration time.
const TOGGLES: ToggleConfig[] = [
  {
    purpose: 'MARKETING',
    label: 'Marketing y novedades',
    description: 'Comunicaciones por email sobre nuevas funciones, creadores y promociones.',
    icon: Mail,
    group: 'data',
  },
  {
    purpose: 'PROFILING',
    label: 'Personalización y recomendaciones',
    description: 'Permitir que usemos tus datos para sugerir creadores y contenido.',
    icon: Sparkles,
    group: 'data',
  },
  {
    purpose: 'INTERNATIONAL_TRANSFER',
    label: 'Transferencia internacional',
    description: 'Procesamiento por proveedores fuera de Chile (EE.UU.) bajo cláusulas contractuales tipo.',
    icon: Globe,
    group: 'data',
  },
  {
    purpose: 'COOKIES_PREFERENCES',
    label: 'Cookies de preferencias',
    description: 'Recordar tus configuraciones (idioma, modo oscuro, etc.).',
    icon: SettingsIcon,
    group: 'cookies',
  },
  {
    purpose: 'COOKIES_ANALYTICS',
    label: 'Cookies de analítica',
    description: 'Métricas anónimas sobre el uso del sitio para mejorarlo.',
    icon: BarChart3,
    group: 'cookies',
  },
  {
    purpose: 'COOKIES_MARKETING',
    label: 'Cookies de marketing',
    description: 'Publicidad personalizada en plataformas externas.',
    icon: Cookie,
    group: 'cookies',
  },
]

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

function isCurrentlyGranted(c: ConsentState): boolean {
  // The latest row decides — granted true AND not withdrawn.
  return c.granted && !c.withdrawnAt
}

function formatDate(value: string | null | undefined): string {
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

export default function PrivacySettingsPage() {
  const router = useRouter()
  const { token, hasHydrated, user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [consents, setConsents] = useState<ConsentState[]>([])
  const [history, setHistory] = useState<ConsentHistoryEntry[]>([])
  const [updatingPurpose, setUpdatingPurpose] = useState<ConsentPurpose | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login')
      return
    }
    void loadConsents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, token])

  async function loadConsents() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await consentsApi.getMyConsents(token)
      setConsents(data.consents)
      setHistory(data.history)
    } catch (err: any) {
      setError(err?.message || 'Error al cargar tus preferencias')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(purpose: ConsentPurpose, nextValue: boolean) {
    if (!token) return
    setUpdatingPurpose(purpose)
    setError(null)
    try {
      await consentsApi.updateConsent(purpose, nextValue, token)
      // Reload to pick up the new history entry + canonical state.
      await loadConsents()
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar el consentimiento')
    } finally {
      setUpdatingPurpose(null)
    }
  }

  // O(1) lookup by purpose for rendering toggle state.
  const consentByPurpose = useMemo(() => {
    const map = new Map<ConsentPurpose, ConsentState>()
    consents.forEach((c) => map.set(c.purpose, c))
    return map
  }, [consents])

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  const dataToggles = TOGGLES.filter((t) => t.group === 'data')
  const cookieToggles = TOGGLES.filter((t) => t.group === 'cookies')

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-[#222]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#222] rounded-lg transition"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-pink-400" />
              Privacidad
            </h1>
            <p className="text-xs text-gray-500">
              Gestiona tus consentimientos y derechos según la Ley 21.719
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : (
          <>
            {/* === Section 1: Data preferences === */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-1">
                Mis preferencias de privacidad
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Estas opciones controlan cómo tratamos tus datos personales. Puedes activarlas o desactivarlas en cualquier momento.
              </p>
              <div className="space-y-2">
                {dataToggles.map((t) => (
                  <ToggleRow
                    key={t.purpose}
                    config={t}
                    state={consentByPurpose.get(t.purpose)}
                    isUpdating={updatingPurpose === t.purpose}
                    onChange={(next) => handleToggle(t.purpose, next)}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                La finalidad &quot;Ejecución del servicio&quot; es indispensable y no puede revocarse aquí.
                Si deseas dejar de usar Appapacho, puedes{' '}
                <Link href="/settings" className="text-pink-400 hover:text-pink-300 underline">
                  eliminar tu cuenta
                </Link>
                .
              </p>
            </section>

            {/* === Section 2: Cookies === */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-1">Cookies</h2>
              <p className="text-sm text-gray-400 mb-4">
                Las cookies esenciales son necesarias para que el sitio funcione y no se pueden desactivar.
              </p>
              <div className="space-y-2">
                {cookieToggles.map((t) => (
                  <ToggleRow
                    key={t.purpose}
                    config={t}
                    state={consentByPurpose.get(t.purpose)}
                    isUpdating={updatingPurpose === t.purpose}
                    onChange={(next) => handleToggle(t.purpose, next)}
                  />
                ))}
              </div>
            </section>

            {/* === Section 3: My rights === */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-1">Mis derechos</h2>
              <p className="text-sm text-gray-400 mb-4">
                Acceso, rectificación, cancelación, oposición y portabilidad. Plazo legal de respuesta: 15 días hábiles.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <Link
                  href="/derechos"
                  className="block p-4 bg-[#1a1a1a] border border-[#333] rounded-xl hover:border-pink-500/50 transition group"
                >
                  <FileText className="h-5 w-5 text-pink-400 mb-2 group-hover:scale-110 transition" />
                  <p className="text-white text-sm font-medium">Ejercer mis derechos</p>
                  <p className="text-xs text-gray-500 mt-1">Solicitar acceso, rectificación o eliminación.</p>
                </Link>

                <Link
                  href="/settings"
                  className="block p-4 bg-[#1a1a1a] border border-[#333] rounded-xl hover:border-pink-500/50 transition group"
                >
                  <Download className="h-5 w-5 text-pink-400 mb-2 group-hover:scale-110 transition" />
                  <p className="text-white text-sm font-medium">Descargar mis datos</p>
                  <p className="text-xs text-gray-500 mt-1">Exportación completa en formato portable.</p>
                </Link>

                <Link
                  href="/settings"
                  className="block p-4 bg-[#1a1a1a] border border-red-500/30 rounded-xl hover:border-red-500/60 transition group"
                >
                  <Trash2 className="h-5 w-5 text-red-400 mb-2 group-hover:scale-110 transition" />
                  <p className="text-white text-sm font-medium">Eliminar mi cuenta</p>
                  <p className="text-xs text-gray-500 mt-1">Borrado permanente con anonimización fiscal.</p>
                </Link>
              </div>
            </section>

            {/* === Section 4: History === */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-400" />
                Historial de consentimientos
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Últimas 20 transiciones. Esta información también se incluye en la exportación de datos.
              </p>
              {history.length === 0 ? (
                <div className="text-sm text-gray-500 italic p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
                  No hay registros aún.
                </div>
              ) : (
                <div className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden">
                  <ul className="divide-y divide-[#222]">
                    {history.map((entry) => (
                      <li key={entry.id} className="p-3 flex items-start justify-between gap-3 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="text-white">
                            {PURPOSE_LABELS[entry.purpose]}{' '}
                            <span
                              className={
                                entry.granted && !entry.withdrawnAt
                                  ? 'text-green-400'
                                  : 'text-gray-500'
                              }
                            >
                              — {entry.withdrawnAt
                                ? 'revocado'
                                : entry.granted
                                ? 'otorgado'
                                : 'rechazado'}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {entry.source ? `Fuente: ${entry.source}` : 'Fuente desconocida'}
                            {entry.ipAddress ? ` · IP: ${entry.ipAddress}` : ''}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 text-right flex-shrink-0">
                          <p>{formatDate(entry.grantedAt)}</p>
                          {entry.withdrawnAt && (
                            <p className="text-gray-600">→ {formatDate(entry.withdrawnAt)}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Footer note */}
            <p className="text-xs text-gray-600 pt-4 border-t border-[#222]">
              Para consultas sobre el tratamiento de tus datos, escribe a{' '}
              <a
                href="mailto:privacidad@appapacho.cl"
                className="text-pink-400 hover:text-pink-300 underline"
              >
                privacidad@appapacho.cl
              </a>
              .
            </p>
          </>
        )}
      </main>

      {/* Avoid unused `user` import in some lint configs */}
      <span className="hidden">{user?.id || ''}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Subcomponent: a single accessible toggle row
// ---------------------------------------------------------------------------

interface ToggleRowProps {
  config: ToggleConfig
  state: ConsentState | undefined
  isUpdating: boolean
  onChange: (next: boolean) => void
}

function ToggleRow({ config, state, isUpdating, onChange }: ToggleRowProps) {
  const Icon = config.icon
  const granted = state ? isCurrentlyGranted(state) : false
  const lastChange = state?.withdrawnAt || state?.grantedAt

  return (
    <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-pink-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{config.label}</p>
        <p className="text-xs text-gray-400 mt-1">{config.description}</p>
        {state && (
          <p className="text-[10px] text-gray-600 mt-2">
            {granted ? 'Otorgado' : 'Revocado'} · {formatDate(lastChange)}
          </p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          checked={granted}
          disabled={isUpdating}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
          aria-label={config.label}
        />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500 peer-disabled:opacity-50"></div>
      </label>
    </div>
  )
}
