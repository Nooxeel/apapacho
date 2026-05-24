import type { Metadata } from 'next'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: 'Seguridad — Cómo protegemos tus datos',
    description:
      'Conoce cómo Apapacho protege tu información: cifrado AES-256-GCM en reposo, TLS 1.3 en tránsito, autenticación robusta, detección automática de contenido ilegal y cumplimiento de la Ley 21.719.',
    keywords: [
      'seguridad apapacho',
      'cifrado de datos',
      'proteccion datos personales chile',
      'ley 21719',
      'AES-256-GCM',
      'TLS 1.3',
      'CSAM scanning',
    ],
    openGraph: {
      title: 'Seguridad | Apapacho',
      description:
        'Cifrado AES-256-GCM en reposo, TLS 1.3 en tránsito, MFA, detección CSAM y notificación de brechas en 72h. Así protegemos tus datos.',
      type: 'website',
      locale: 'es_CL',
    },
    alternates: {
      canonical: '/seguridad',
    },
  }
}

export default function SeguridadPage() {
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
            Tu privacidad es nuestro compromiso técnico
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Cómo protegemos tus datos en Apapacho · Versión 1.0
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">

            <section>
              <p>
                La seguridad de la información no es un módulo opcional ni un punto en una lista de
                marketing: es parte de la arquitectura del producto. En esta página describimos las
                medidas técnicas y organizativas que aplicamos para proteger los datos personales y
                el contenido alojado en la Plataforma, en cumplimiento de la Ley N° 19.628 y la Ley
                N° 21.719 sobre Protección de Datos Personales en Chile.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Cifrado de extremo a extremo en reposo</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>AES-256-GCM</strong> para datos sensibles almacenados en base de datos:
                  RUT, cuentas bancarias de retiros, mensajes privados con información personal y
                  todo dato de la categoría especial de la Ley 21.719.
                </li>
                <li>
                  <strong>Claves rotables</strong> gestionadas mediante variables de entorno seguras
                  y almacenadas <em>separadamente</em> del dato cifrado. La rotación de claves no
                  requiere migración de datos.
                </li>
                <li>
                  Documentos KYC (cédula de identidad, selfie biométrica) se almacenan en{' '}
                  <strong>Cloudinary con <code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">access_mode: authenticated</code></strong>,
                  exigiendo firma temporal para cada visualización.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Cifrado en tránsito</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>TLS 1.3</strong> en todas las comunicaciones entre el navegador, el frontend, el backend y los procesadores externos.</li>
                <li><strong>HSTS preload</strong> para evitar ataques de degradación de protocolo (downgrade) y forzar siempre HTTPS.</li>
                <li><strong>WebSockets seguros (WSS)</strong> para el chat en tiempo real entre fans y creadores. La autenticación del socket se valida en el handshake.</li>
                <li><strong>Signed URLs</strong> con caducidad de 15 minutos para el acceso a media privada (posts pagados, KYC, archivos adjuntos en mensajes).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Autenticación robusta</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Las contraseñas se almacenan con <strong>bcrypt (factor 12)</strong>. Nunca guardamos contraseñas en claro ni reversibles.</li>
                <li>
                  Las sesiones se transportan en <strong>cookies httpOnly Secure SameSite</strong>,
                  resistentes a XSS y a robo desde JavaScript del navegador.
                </li>
                <li>
                  <strong>MFA (TOTP)</strong> opcional para todos los usuarios y{' '}
                  <strong>obligatorio para administradores</strong> con acceso a datos KYC.
                </li>
                <li>
                  <strong>Theft detection</strong> en refresh tokens: si un token rotado se reutiliza,
                  invalidamos toda la familia de sesiones del usuario y exigimos re-autenticación.
                </li>
                <li>Rate limit estricto en endpoints de autenticación (5 intentos / 15 minutos) para mitigar fuerza bruta.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Control granular de tu información</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>4 consentimientos separados</strong> al registrarte (servicio, marketing,
                  perfilamiento, transferencia internacional). Puedes aceptar el servicio sin tener
                  que aceptar los demás.
                </li>
                <li>
                  Toggle individual de cada finalidad desde{' '}
                  <Link href="/settings/privacy" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                    /settings/privacy
                  </Link>{' '}
                  en cualquier momento.
                </li>
                <li>
                  <strong>Sesiones activas</strong> visibles en tus ajustes, con la opción de cerrarlas
                  remotamente desde cualquier dispositivo.
                </li>
                <li>
                  <strong>Opt-out del perfilamiento</strong>: al desactivarlo recibes un feed cronológico
                  sin recomendaciones algorítmicas.
                </li>
                <li>
                  Ejercicio completo de derechos ARCO-P (Acceso, Rectificación, Cancelación, Oposición,
                  Portabilidad) desde{' '}
                  <Link href="/derechos" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                    /derechos
                  </Link>{' '}
                  con SLA de 15 días hábiles.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Detección automática de contenido ilegal</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Escaneo CSAM</strong> automatizado en cada upload mediante{' '}
                  <strong>Cloudflare CSAM Scanning Tool</strong>, integrado con la red de
                  organizaciones internacionales (NCMEC, IWF).
                </li>
                <li>
                  Clasificación NSFW automática que <em>flagea</em> contenido potencialmente violento o
                  no-consensuado para revisión manual antes de su publicación.
                </li>
                <li>Escaneo antivirus en archivos subidos (validación de magic bytes + scanner externo).</li>
                <li>
                  Cualquier match positivo de CSAM dispara: cancelación inmediata de la cuenta, freeze
                  de evidencia (ZIP firmado con SHA-256) y reporte a <strong>PDI Cyber Chile</strong>{' '}
                  y <strong>NCMEC CyberTipline</strong>, conforme a la Ley 21.515.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Auditoría y logs</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  Cada acción crítica (login, cambio de password, acceso a KYC, retiro, decisión
                  administrativa) queda registrada con <strong>timestamp + IP enmascarada</strong>{' '}
                  + identificador de actor.
                </li>
                <li>Los <strong>audit logs</strong> se retienen <strong>5 años</strong> para fines de auditoría regulatoria.</li>
                <li>
                  Política estricta de <strong>minimización</strong>: nunca almacenamos contraseñas en
                  claro ni números completos de tarjeta. Las tarjetas se manejan como tokens Oneclick
                  de Transbank; sólo conservamos los últimos 4 dígitos para identificación.
                </li>
                <li>Los logs de errores enviados a Sentry pasan por una capa de <em>redaction</em> obligatoria que elimina PII antes del envío.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Monitoreo de incidentes</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Notificación de brechas en 72 horas</strong> a la autoridad y a los titulares
                  afectados, conforme al Art. 23 quater de la Ley N° 21.719.
                </li>
                <li>
                  <strong>Plan de Respuesta a Incidentes</strong> documentado, con cron de control que
                  alerta si una brecha lleva más de 24 horas sin notificación efectiva.
                </li>
                <li><strong>Sentry</strong> integrado para detección proactiva de errores de producción y trazabilidad de stack traces sin PII.</li>
                <li><strong>Backups diarios cifrados</strong> con drill trimestral de restauración para validar que los respaldos efectivamente son recuperables.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. Cumplimiento normativo</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Ley N° 19.628</strong> sobre Protección de la Vida Privada (Chile).</li>
                <li><strong>Ley N° 21.719</strong> sobre Protección de Datos Personales, vigencia plena diciembre 2026 (Chile).</li>
                <li>Estándares equivalentes al <strong>GDPR</strong> europeo en lo relativo a derechos del titular, accountability y notificación de brechas.</li>
                <li><strong>Ley N° 21.515</strong> sobre prevención de CSAM y trata.</li>
                <li>
                  Roadmap futuro: certificaciones <strong>ISO/IEC 27001</strong> y{' '}
                  <strong>SOC 2 Type II</strong> una vez consolidada la operación.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. ¿Cómo reportar una vulnerabilidad?</h2>
              <p>
                Si crees haber encontrado una falla de seguridad, te pedimos seguir nuestro programa de{' '}
                <Link href="/security/disclosure" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  Responsible Disclosure
                </Link>. Allí encontrarás el alcance, las reglas, los plazos de respuesta y el canal de
                contacto seguro. Valoramos profundamente la colaboración de la comunidad de
                investigadores de seguridad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. Sin garantías absolutas, sí compromiso continuo</h2>
              <p>
                Ningún sistema es invulnerable. La seguridad de la información es un ejercicio
                permanente de mitigación, detección y respuesta. Nuestro compromiso con quienes nos
                confían sus datos se resume en tres principios:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Minimizar el riesgo</strong> mediante diseño seguro por defecto, minimización de datos y revisión periódica de privilegios.</li>
                <li><strong>Detectar rápido</strong> con monitoreo continuo, audit logs y revisión humana de alertas críticas.</li>
                <li><strong>Responder con transparencia</strong>: notificación inmediata ante incidentes, reportes públicos trimestrales y comunicación honesta sobre limitaciones.</li>
              </ul>
            </section>

            <section className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Última revisión: mayo de 2026 · Para reportes de seguridad escribe a{' '}
                <a href="mailto:security@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  security@appapacho.cl
                </a>{' '}
                · Para asuntos de privacidad a{' '}
                <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  privacidad@appapacho.cl
                </a>.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center space-x-4">
          <Link
            href="/privacidad"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Política de Privacidad
          </Link>
          <span className="text-white/30">·</span>
          <Link
            href="/security/disclosure"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Reporte de vulnerabilidades
          </Link>
          <span className="text-white/30">·</span>
          <Link
            href="/transparencia"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Transparency Report
          </Link>
        </div>
      </div>
    </div>
  )
}
