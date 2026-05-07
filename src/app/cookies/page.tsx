'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCookieConsent } from '@/components/ui/CookieConsent'

interface CookieRow {
  name: string
  type: 'Esencial' | 'Preferencias' | 'Analítica' | 'Marketing'
  purpose: string
  duration: string
  thirdParty: string
}

const COOKIES: CookieRow[] = [
  {
    name: 'apapacho_token',
    type: 'Esencial',
    purpose: 'Token de autenticación de sesión (JWT) entregado por el backend tras iniciar sesión.',
    duration: '15 minutos',
    thirdParty: 'Apapacho (primera parte)',
  },
  {
    name: 'apapacho_refresh',
    type: 'Esencial',
    purpose: 'Token de refresh para renovar la sesión sin pedir credenciales nuevamente.',
    duration: '30 días',
    thirdParty: 'Apapacho (primera parte)',
  },
  {
    name: 'apapacho-cookie-consent',
    type: 'Esencial',
    purpose: 'Almacena las preferencias del banner de cookies (qué categorías aceptaste).',
    duration: '12 meses',
    thirdParty: 'Apapacho (primera parte)',
  },
  {
    name: 'ageVerified',
    type: 'Preferencias',
    purpose: 'Recuerda que el Usuario verificó ser mayor de 18 años para no volver a mostrar el modal.',
    duration: '12 meses',
    thirdParty: 'Apapacho (primera parte)',
  },
  {
    name: 'theme',
    type: 'Preferencias',
    purpose: 'Recuerda la preferencia visual (modo oscuro/claro) del Usuario.',
    duration: 'Sin caducidad (hasta limpieza manual)',
    thirdParty: 'Apapacho (primera parte)',
  },
]

export default function CookiesPage() {
  const { resetConsent } = useCookieConsent()
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const handleReset = () => {
    resetConsent()
    setResetMessage('Tus preferencias de cookies fueron eliminadas. Recarga la página para ver el banner nuevamente.')
    setTimeout(() => setResetMessage(null), 6000)
  }

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
            Política de Cookies
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Versión 1.0 · Vigente desde el 6 de mayo de 2026
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. INTRODUCCIÓN</h2>
              <p>
                La presente Política de Cookies describe en detalle las cookies y tecnologías equivalentes que utiliza
                {' '}<strong>Apapacho</strong> en su sitio web. Forma parte integrante de nuestra{' '}
                <Link href="/privacidad" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  Política de Privacidad
                </Link>{' '}y se proporciona en cumplimiento del principio de transparencia de la Ley N° 21.719.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. ¿QUÉ SON LAS COOKIES?</h2>
              <p>
                Las cookies son pequeños archivos de texto que el sitio web almacena en tu dispositivo (computadora,
                teléfono, tablet) cuando lo visitas. Permiten recordar información sobre tu visita, como tu idioma
                preferido, si has iniciado sesión y otras opciones de configuración. Esto puede mejorar tu experiencia y
                hacer que el sitio sea más útil para ti.
              </p>
              <p className="mt-4">
                Junto a las cookies, podemos utilizar tecnologías equivalentes como <code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">localStorage</code>{' '}
                del navegador, que cumplen una función similar de almacenamiento local.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. COOKIES QUE UTILIZAMOS</h2>

              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Nombre</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Tipo</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Propósito</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Duración</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Tercero</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {COOKIES.map((cookie) => (
                      <tr key={cookie.name} className="border-b border-white/10 last:border-b-0">
                        <td className="px-3 py-2 font-mono text-fuchsia-300 text-xs">{cookie.name}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            cookie.type === 'Esencial'
                              ? 'bg-green-500/20 text-green-400'
                              : cookie.type === 'Preferencias'
                              ? 'bg-blue-500/20 text-blue-400'
                              : cookie.type === 'Analítica'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-pink-500/20 text-pink-400'
                          }`}>
                            {cookie.type}
                          </span>
                        </td>
                        <td className="px-3 py-2">{cookie.purpose}</td>
                        <td className="px-3 py-2 text-xs">{cookie.duration}</td>
                        <td className="px-3 py-2 text-xs">{cookie.thirdParty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">3.1 Categorías</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Esenciales:</strong> imprescindibles para que la Plataforma funcione (autenticación, almacenamiento de tu consentimiento). No requieren consentimiento previo conforme al criterio del propio servicio solicitado por el Usuario.</li>
                <li><strong>Preferencias:</strong> recuerdan tus elecciones (verificación de edad, tema visual). Solo se activan si las aceptas en el banner.</li>
                <li><strong>Analíticas (opt-in):</strong> ninguna activa actualmente. Si en el futuro integramos herramientas como Google Analytics, será notificado y solo se activará con tu consentimiento expreso.</li>
                <li><strong>Marketing (opt-in):</strong> ninguna activa actualmente. Cuando integremos pixeles publicitarios (Meta, Google Ads, etc.), serán agregados a esta tabla y solo se activarán con tu consentimiento explícito.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. CÓMO GESTIONAR TUS PREFERENCIAS</h2>
              <p>
                Puedes modificar tus preferencias de cookies en cualquier momento. Al pulsar el botón siguiente,
                eliminaremos tu configuración actual y se mostrará nuevamente el banner de cookies para que ajustes tus
                opciones:
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-medium rounded-xl transition-colors"
                >
                  Gestionar Cookies
                </button>
                {resetMessage && (
                  <p className="mt-3 text-sm text-green-400">
                    {resetMessage}
                  </p>
                )}
              </div>

              <p className="mt-6 text-sm text-gray-400">
                También puedes revisar y modificar tus preferencias generales de privacidad (consentimientos para
                marketing, perfilamiento, transferencia internacional) en{' '}
                <Link href="/settings/privacy" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  /settings/privacy
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. COOKIES DEL NAVEGADOR</h2>
              <p>
                La mayoría de los navegadores aceptan cookies por defecto, pero permiten configurar su manejo, eliminar
                las existentes o bloquear nuevas. Recuerda que deshabilitar las cookies esenciales puede impedir que la
                Plataforma funcione correctamente (por ejemplo, no podrás iniciar sesión).
              </p>
              <p className="mt-4">Instrucciones por navegador:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/es/kb/proteccion-antirrastreo-mejorada-firefox-escritori"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. CAMBIOS A ESTA POLÍTICA</h2>
              <p>
                Cualquier cambio relevante en el uso de cookies (por ejemplo, integración de herramientas analíticas o
                publicitarias nuevas) se reflejará en esta página y en la tabla del punto 3, y será notificado mediante
                el banner de cookies, que volverá a aparecer para solicitar tu consentimiento informado.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Versión 1.0 · Vigente desde el 6 de mayo de 2026 · Apapacho SpA · Conforme a Ley N° 19.628 y Ley N° 21.719.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center space-x-4">
          <Link
            href="/terminos"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Términos y Condiciones
          </Link>
          <span className="text-white/30">·</span>
          <Link
            href="/privacidad"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Política de Privacidad
          </Link>
          <span className="text-white/30">·</span>
          <Link
            href="/derechos"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Ejercer mis derechos
          </Link>
        </div>
      </div>
    </div>
  )
}
