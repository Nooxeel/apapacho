'use client'

/**
 * CookieConsent — Ley 21.719 (Group 3.3 refactor).
 *
 * Behaviour change vs. the previous version (R0-era):
 *  - Appears IMMEDIATELY on first visit (no longer waits for the age gate).
 *    Ley 21.719 art. 12-13 require informed consent before any non-essential
 *    processing, which includes the analytics/marketing cookies that fire as
 *    soon as the page loads.
 *  - 4 categories instead of 3: Essentials (always on, non-toggleable),
 *    Preferences, Analytics, Marketing.
 *  - For logged-in users, choices are persisted to the backend via
 *    POST /api/users/me/consents (purposes COOKIES_*) so they outlive the
 *    browser. Anonymous users only persist to localStorage; once they log in
 *    we sync the local choice up.
 *  - Persists a versioned object so a future re-prompt is straightforward.
 *
 * Public API kept stable: `useCookieConsent()` still returns the same shape
 * with `canUseAnalytics` / `canUsePreferences` plus a new `canUseMarketing`.
 */

import { useState, useEffect, useCallback, useRef, useId } from 'react'
import Link from 'next/link'
import { X, Cookie, Shield, BarChart3, Settings, Megaphone } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { consentsApi } from '@/lib/api/consents'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const CONSENT_KEY = 'apapacho-cookie-consent'
const CONSENT_VERSION = 2 // bump if categories change semantically

export interface CookiePreferences {
  essential: true // always true; here for type completeness
  preferences: boolean
  analytics: boolean
  marketing: boolean
}

interface ConsentData {
  version: number
  accepted: boolean
  preferences: CookiePreferences
  timestamp: number
  /** True once we've sent these prefs to the backend (post-login). */
  syncedToServer: boolean
}

const DEFAULT_PREFS: CookiePreferences = {
  essential: true,
  preferences: false,
  analytics: false,
  marketing: false,
}

function readConsent(): ConsentData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentData
    // If the version increased, treat the stored consent as stale and
    // re-prompt — Ley 21.719 demands fresh consent for new purposes.
    if (parsed?.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function writeConsent(data: ConsentData) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data))
  } catch {
    // localStorage may be disabled (private mode, quota); silent fallback.
  }
}

/**
 * Push the cookie preferences to the backend if the user is logged in.
 * Fire-and-forget — failure does NOT roll back the local UI state because
 * the local copy is the source of truth for the current session.
 */
async function syncToBackend(prefs: CookiePreferences, token: string) {
  await Promise.allSettled([
    consentsApi.updateConsent('COOKIES_PREFERENCES', prefs.preferences, token),
    consentsApi.updateConsent('COOKIES_ANALYTICS', prefs.analytics, token),
    consentsApi.updateConsent('COOKIES_MARKETING', prefs.marketing, token),
  ])
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFS)

  const { token, hasHydrated } = useAuthStore()
  // Guard so we only attempt to sync once per token transition.
  const lastSyncedToken = useRef<string | null>(null)
  // Focus trap so users tabbing through the banner cycle inside it (the banner
  // is a privacy notice that must be acknowledged — letting Tab leak into the
  // page chrome behind it confused screen-reader users in QA).
  const bannerRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useFocusTrap(bannerRef, isVisible)

  // First mount — show the banner immediately if no stored consent exists.
  // (Note: we deliberately do NOT wait for age verification — Ley 21.719
  // requires consent BEFORE any non-essential processing.)
  useEffect(() => {
    const stored = readConsent()
    if (!stored) {
      setIsVisible(true)
    }
  }, [])

  // After login: sync local consent to backend exactly once per token.
  useEffect(() => {
    if (!hasHydrated || !token) return
    if (lastSyncedToken.current === token) return
    const stored = readConsent()
    if (!stored || stored.syncedToServer) {
      lastSyncedToken.current = token
      return
    }
    void syncToBackend(stored.preferences, token).then(() => {
      writeConsent({ ...stored, syncedToServer: true })
      lastSyncedToken.current = token
    })
  }, [token, hasHydrated])

  const persist = useCallback(
    (prefs: CookiePreferences) => {
      const data: ConsentData = {
        version: CONSENT_VERSION,
        accepted: true,
        preferences: prefs,
        timestamp: Date.now(),
        syncedToServer: false,
      }
      writeConsent(data)
      setIsVisible(false)

      // If the user is already logged in, sync immediately.
      if (token) {
        void syncToBackend(prefs, token).then(() => {
          writeConsent({ ...data, syncedToServer: true })
          lastSyncedToken.current = token
        })
      }
    },
    [token]
  )

  const acceptAll = () =>
    persist({ essential: true, preferences: true, analytics: true, marketing: true })

  const acceptSelected = () => persist(preferences)

  const rejectOptional = () =>
    persist({ essential: true, preferences: false, analytics: false, marketing: false })

  if (!isVisible) return null

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Consentimiento de cookies"
      aria-labelledby={titleId}
      className="fixed bottom-0 left-0 right-0 z-[60] p-4"
    >
      <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <Cookie className="w-6 h-6 text-pink-500" />
            </div>

            <div className="flex-1">
              <h3 id={titleId} className="text-lg font-semibold text-white mb-2">Usamos cookies</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Usamos cookies esenciales para el funcionamiento del sitio y, con tu consentimiento,
                otras cookies para analítica, preferencias y marketing. Puedes aceptarlas todas,
                rechazar las opcionales o personalizar tu elección. Más detalles en nuestra{' '}
                <Link href="/cookies" className="text-pink-400 hover:text-pink-300 underline">
                  Política de Cookies
                </Link>{' '}
                y{' '}
                <Link href="/privacidad" className="text-pink-400 hover:text-pink-300 underline">
                  Política de Privacidad
                </Link>
                .
              </p>
            </div>

            <button
              onClick={rejectOptional}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Rechazar opcionales y cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showDetails && (
            <div className="mt-6 space-y-3 pt-4 border-t border-white/10">
              {/* Essentials — always on */}
              <CategoryRow
                icon={Shield}
                iconClass="text-green-500"
                title="Esenciales"
                description="Necesarias para autenticación, seguridad y funcionamiento básico."
                control={
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                    Siempre activas
                  </span>
                }
              />

              <CategoryRow
                icon={Settings}
                iconClass="text-purple-400"
                title="Preferencias"
                description="Recuerdan tus configuraciones (idioma, tema, etc.)."
                control={
                  <Toggle
                    checked={preferences.preferences}
                    onChange={(v) => setPreferences((p) => ({ ...p, preferences: v }))}
                    label="Preferencias"
                  />
                }
              />

              <CategoryRow
                icon={BarChart3}
                iconClass="text-blue-400"
                title="Analítica"
                description="Métricas anónimas que nos ayudan a mejorar el producto."
                control={
                  <Toggle
                    checked={preferences.analytics}
                    onChange={(v) => setPreferences((p) => ({ ...p, analytics: v }))}
                    label="Analítica"
                  />
                }
              />

              <CategoryRow
                icon={Megaphone}
                iconClass="text-pink-400"
                title="Marketing"
                description="Publicidad personalizada y medición de campañas."
                control={
                  <Toggle
                    checked={preferences.marketing}
                    onChange={(v) => setPreferences((p) => ({ ...p, marketing: v }))}
                    label="Marketing"
                  />
                }
              />
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowDetails((s) => !s)}
              className="px-4 py-2.5 text-gray-300 hover:text-white border border-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              {showDetails ? 'Ocultar opciones' : 'Personalizar'}
            </button>

            {showDetails && (
              <button
                onClick={acceptSelected}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Guardar preferencias
              </button>
            )}

            <button
              onClick={rejectOptional}
              className="px-4 py-2.5 text-gray-300 hover:text-white border border-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              Rechazar opcionales
            </button>

            <button
              onClick={acceptAll}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

interface CategoryRowProps {
  icon: React.ElementType
  iconClass: string
  title: string
  description: string
  control: React.ReactNode
}

function CategoryRow({ icon: Icon, iconClass, title, description, control }: CategoryRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-white font-medium text-sm">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  )
}

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
        aria-label={label}
      />
      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
    </label>
  )
}

// ---------------------------------------------------------------------------
// Public consumer hook
// ---------------------------------------------------------------------------

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentData | null>(null)

  useEffect(() => {
    setConsent(readConsent())
  }, [])

  return {
    hasConsented: consent?.accepted ?? false,
    canUsePreferences: consent?.preferences.preferences ?? false,
    canUseAnalytics: consent?.preferences.analytics ?? false,
    canUseMarketing: consent?.preferences.marketing ?? false,
    resetConsent: () => {
      try {
        localStorage.removeItem(CONSENT_KEY)
      } catch {
        // ignore
      }
      setConsent(null)
    },
  }
}
