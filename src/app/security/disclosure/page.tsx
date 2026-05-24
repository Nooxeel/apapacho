import type { Metadata } from 'next'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: 'Responsible Disclosure — Programa de reporte de vulnerabilidades',
    description:
      'Programa de Responsible Disclosure de Apapacho. Alcance, reglas, canal de reporte, SLAs por severidad y safe harbor para investigadores de seguridad que colaboren de buena fe.',
    keywords: [
      'responsible disclosure',
      'reporte vulnerabilidades apapacho',
      'security disclosure',
      'bug bounty chile',
      'safe harbor',
      'CVSS',
    ],
    openGraph: {
      title: 'Responsible Disclosure | Apapacho',
      description:
        'Programa de Reporte Responsable de Vulnerabilidades — reglas, alcance y safe harbor.',
      type: 'website',
      locale: 'es_CL',
    },
    alternates: {
      canonical: '/security/disclosure',
    },
  }
}

export default function SecurityDisclosurePage() {
  return (
    <div className="min-h-screen bg-[#0f0f14] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/seguridad"
          className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Seguridad
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white mb-2">
            Programa de Reporte Responsable de Vulnerabilidades
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Responsible Disclosure · Versión 1.0
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Bienvenida a la comunidad de seguridad</h2>
              <p>
                Valoramos profundamente el trabajo de la comunidad de investigadores de seguridad.
                Reportar una vulnerabilidad de manera responsable es una contribución significativa al
                bienestar de nuestros usuarios y al ecosistema chileno de protección de datos. Esta
                página describe la mejor forma de hacerlo: cómo, dónde, bajo qué reglas y con qué
                compromiso de respuesta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Alcance del programa</h2>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.1 In-scope</h3>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">appapacho.cl</code> y sus subdominios productivos.</li>
                <li><code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">api.appapacho.cl</code> cuando esté disponible bajo ese dominio.</li>
                <li><code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">apapacho-backend-production.up.railway.app</code> (dominio actual del backend).</li>
                <li>Todos los endpoints <code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">/api/*</code>.</li>
                <li>Flujos de autenticación, autorización, manejo de sesiones, KYC, pagos, mensajería y suscripciones.</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.2 Out-of-scope</h3>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Phishing o ingeniería social a empleados, contratistas o usuarios.</li>
                <li>Ataques de denegación de servicio (DoS / DDoS). <strong>No testees disponibilidad.</strong></li>
                <li>Vulnerabilidades en frameworks de terceros (Next.js, Express, etc.) sin un POC específico que demuestre impacto en Apapacho.</li>
                <li>Spam masivo de formularios públicos.</li>
                <li>Reportes de buenas prácticas sin impacto demostrado (p. ej. ausencia de cabeceras no críticas, política CSP discutible sin POC, ausencia de SPF/DMARC en dominios no productivos).</li>
                <li>Vulnerabilidades que requieran acceso físico al dispositivo de la víctima.</li>
                <li>Ataques contra usuarios sin su consentimiento explícito.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Reglas del programa</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>No accedas a datos de otros usuarios reales.</strong> Crea cuentas de test
                  para validar tus hallazgos. Si por accidente accedes a datos reales, detén la prueba
                  e infórmanos.
                </li>
                <li><strong>No ejecutes payloads destructivos</strong> (borrado de datos, manipulación de transacciones, escalada con efectos en producción).</li>
                <li>
                  <strong>No divulgues</strong> la vulnerabilidad públicamente antes de que la
                  arreglemos o haya transcurrido el plazo de coordinación.
                </li>
                <li>
                  <strong>Plazo de coordinación:</strong> 90 días desde la recepción del reporte para
                  el fix antes de un eventual <em>full disclosure</em>. Si el bug es crítico y no
                  hemos respondido en plazo razonable, podemos acordar extensiones.
                </li>
                <li>
                  Nuestros compromisos hacia ti: <strong>24 horas</strong> para confirmar recepción del
                  reporte y <strong>7 días</strong> para clasificar severidad y comunicar el plan de
                  fix.
                </li>
                <li>Trabajaremos contigo, no contra ti. Tu reporte ayuda a proteger a nuestros usuarios.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Cómo reportar</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Email seguro:</strong>{' '}
                  <a href="mailto:security@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    security@appapacho.cl
                  </a>
                </li>
                <li>
                  <strong>PGP key (opcional):</strong>{' '}
                  <span className="text-amber-300">[PENDIENTE COMPLETAR — generar y publicar fingerprint en este sitio]</span>
                </li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.1 Información mínima por incluir</h3>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><strong>Descripción</strong> clara de la vulnerabilidad y su naturaleza.</li>
                <li><strong>Pasos para reproducir</strong> de manera determinista (ideal: ambiente test).</li>
                <li><strong>Impacto estimado</strong>: qué datos se pueden ver, modificar o destruir, qué privilegios se pueden escalar, qué usuarios se ven afectados.</li>
                <li><strong>Sugerencia de fix</strong> si la tienes (opcional pero apreciada).</li>
                <li><strong>Identificador de tu cuenta de test</strong> y de cualquier IP de origen utilizada.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Compensación</h2>
              <p>
                Apapacho <strong>no opera</strong> un programa de bug bounty pagado por el momento.
                Reconocemos públicamente a los investigadores que colaboren con nosotros mediante un
                <strong> Hall of Fame</strong> con su nombre o alias, fecha de reporte y severidad
                clasificada. Cuando el negocio madure consideraremos formalizar un programa con
                recompensas monetarias.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Severidad y prioridad</h2>
              <p>
                Clasificamos los reportes con una escala inspirada en el estándar{' '}
                <strong>CVSS v3.1</strong>. El SLA de fix se mide desde la clasificación de severidad,
                no desde el reporte inicial.
              </p>
              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Severidad</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Ejemplos</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">SLA de fix</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">CRITICAL</span></td>
                      <td className="px-3 py-2">RCE, exfiltración masiva de KYC o datos financieros, bypass de autenticación de administrador</td>
                      <td className="px-3 py-2">&lt; 72 horas</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">HIGH</span></td>
                      <td className="px-3 py-2">Account Takeover (ATO), XSS persistente con impacto, escalada de privilegios horizontal o vertical</td>
                      <td className="px-3 py-2">&lt; 7 días</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">MEDIUM</span></td>
                      <td className="px-3 py-2">IDOR menores, information disclosure no sensible, CSRF con impacto limitado</td>
                      <td className="px-3 py-2">&lt; 30 días</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">LOW</span></td>
                      <td className="px-3 py-2">Hardening de cabeceras, mejoras de defense in depth, bugs cosméticos de seguridad</td>
                      <td className="px-3 py-2">&lt; 90 días</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Hall of Fame</h2>
              <p className="text-amber-300">
                [PENDIENTE COMPLETAR — comenzaremos a poblar esta sección tras el primer reporte
                responsable. Se listará: nombre o alias del investigador, fecha del reporte, severidad
                clasificada y, si el investigador lo autoriza, un enlace a su perfil profesional.]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. Safe harbor</h2>
              <p>
                Si reportas en <strong>buena fe</strong> siguiendo las reglas de este programa, no
                perseguiremos acciones legales en tu contra ni cooperaremos con un tercero que las
                inicie con motivo de tu investigación. Nuestro compromiso es:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Trabajar contigo de manera respetuosa y técnica.</li>
                <li>Mantenerte informado del proceso de fix con un punto de contacto único.</li>
                <li>Reconocer públicamente tu colaboración cuando lo autorices.</li>
                <li>No iniciar acciones legales contra investigaciones que cumplan el alcance y las reglas aquí definidas.</li>
              </ul>
              <p className="mt-4">
                Esta cláusula no aplica a actividades fuera de alcance, ataques destructivos, accesos
                deliberados a datos de usuarios reales sin necesidad técnica o extorsión basada en
                hallazgos de seguridad. Tampoco puede invocarse para evadir la aplicación de la
                legislación penal chilena vigente.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Última revisión: mayo de 2026 · Canal de seguridad:{' '}
                <a href="mailto:security@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  security@appapacho.cl
                </a>{' '}
                · Asuntos legales:{' '}
                <a href="mailto:legal@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  legal@appapacho.cl
                </a>.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center space-x-4">
          <Link
            href="/seguridad"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Cómo protegemos tus datos
          </Link>
          <span className="text-white/30">·</span>
          <Link
            href="/transparencia"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Transparency Report
          </Link>
          <span className="text-white/30">·</span>
          <Link
            href="/privacidad"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  )
}
