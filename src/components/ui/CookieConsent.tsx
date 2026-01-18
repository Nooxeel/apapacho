'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie, Shield, BarChart3, Settings } from 'lucide-react'

const CONSENT_KEY = 'apapacho-cookie-consent'

interface CookiePreferences {
  essential: boolean // Always true, can't be disabled
  analytics: boolean
  preferences: boolean
}

interface ConsentData {
  accepted: boolean
  preferences: CookiePreferences
  timestamp: number
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    preferences: false,
  })

  useEffect(() => {
    // Check if user has already consented
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) {
      // Show banner after a small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData: ConsentData = {
      accepted: true,
      preferences: prefs,
      timestamp: Date.now(),
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData))
    setIsVisible(false)
  }

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      preferences: true,
    })
  }

  const acceptSelected = () => {
    saveConsent(preferences)
  }

  const rejectOptional = () => {
    saveConsent({
      essential: true,
      analytics: false,
      preferences: false,
    })
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Main Banner */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-pink-500" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                🍪 Usamos cookies
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Utilizamos cookies para mejorar tu experiencia en Apapacho. Las cookies esenciales son necesarias 
                para el funcionamiento del sitio. Puedes elegir aceptar todas las cookies o personalizar tus preferencias.
                {' '}
                <Link href="/privacidad" className="text-pink-400 hover:text-pink-300 underline">
                  Más información
                </Link>
              </p>
            </div>

            <button
              onClick={rejectOptional}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cookie Details (expandable) */}
          {showDetails && (
            <div className="mt-6 space-y-4 pt-4 border-t border-white/10">
              {/* Essential */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-white font-medium">Esenciales</p>
                    <p className="text-sm text-gray-400">Necesarias para el funcionamiento del sitio</p>
                  </div>
                </div>
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                  Siempre activas
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-white font-medium">Analíticas</p>
                    <p className="text-sm text-gray-400">Nos ayudan a mejorar el sitio</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              {/* Preferences */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-white font-medium">Preferencias</p>
                    <p className="text-sm text-gray-400">Recuerdan tus configuraciones</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.preferences}
                    onChange={(e) => setPreferences(prev => ({ ...prev, preferences: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2.5 text-gray-300 hover:text-white border border-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              {showDetails ? 'Ocultar opciones' : 'Personalizar'}
            </button>
            
            {showDetails ? (
              <button
                onClick={acceptSelected}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Guardar preferencias
              </button>
            ) : (
              <button
                onClick={rejectOptional}
                className="px-4 py-2.5 text-gray-300 hover:text-white border border-white/20 rounded-lg transition-colors text-sm font-medium"
              >
                Solo esenciales
              </button>
            )}
            
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

// Hook to check cookie preferences
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) {
      try {
        setConsent(JSON.parse(stored))
      } catch {
        setConsent(null)
      }
    }
  }, [])

  return {
    hasConsented: consent?.accepted ?? false,
    canUseAnalytics: consent?.preferences.analytics ?? false,
    canUsePreferences: consent?.preferences.preferences ?? false,
    resetConsent: () => {
      localStorage.removeItem(CONSENT_KEY)
      setConsent(null)
    }
  }
}
