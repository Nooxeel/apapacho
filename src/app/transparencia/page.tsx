import type { Metadata } from 'next'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: 'Transparencia — Reporte público',
    description:
      'Transparency report de Apapacho: solicitudes ARCO-P, avisos DMCA, reportes de contenido, brechas notificadas, métricas de KYC y requerimientos judiciales. Datos agregados sin información personal.',
    keywords: [
      'transparencia apapacho',
      'transparency report chile',
      'estadisticas arco p',
      'reportes dmca',
      'brechas de seguridad',
      'ley 21719',
    ],
    openGraph: {
      title: 'Transparency Report | Apapacho',
      description:
        'Reporte público de transparencia operacional con datos agregados conforme Art. 17 Ley 21.719.',
      type: 'website',
      locale: 'es_CL',
    },
    alternates: {
      canonical: '/transparencia',
    },
  }
}

export default function TransparenciaPage() {
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
            Transparencia operacional — Reporte público
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Versión 1.0 · Primer reporte programado para el primer trimestre post-lanzamiento
          </p>

          {/* Banner: pre-launch placeholder data notice */}
          <div
            role="alert"
            aria-label="Aviso sobre datos pendientes de primer ciclo"
            className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
          >
            <p className="font-semibold mb-1">Aviso importante</p>
            <p>
              Apapacho se encuentra en fase pre-launch. Las cifras marcadas como{' '}
              <strong>[PENDIENTE]</strong> se publicarán al cierre del primer trimestre operativo y se
              actualizarán con periodicidad trimestral.
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Introducción</h2>
              <p>
                Publicamos este reporte como parte de nuestro compromiso con la transparencia
                operacional. Refleja <strong>datos agregados sin información personal identificable</strong>,
                conforme al Art. 17 de la Ley N° 21.719 y a las mejores prácticas internacionales en
                la materia (transparency reports de Cloudflare, Google, Twitter, Meta y similares).
              </p>
              <p className="mt-4">
                El reporte está diseñado para que cualquier titular de datos, autoridad regulatoria o
                investigador pueda observar el volumen y la respuesta de Apapacho ante solicitudes
                regulatorias, denuncias DMCA, requerimientos judiciales y otros eventos relevantes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Período del reporte</h2>
              <p>
                <strong>Reporte:</strong>{' '}
                <span className="text-amber-300">[PENDIENTE — primer trimestre operativo, año 2026]</span>
              </p>
              <p>
                <strong>Última actualización:</strong>{' '}
                <span className="text-amber-300">[PENDIENTE — fecha de publicación inicial]</span>
              </p>
              <p>
                <strong>Próxima actualización programada:</strong>{' '}
                <span className="text-amber-300">[PENDIENTE — trimestre siguiente]</span>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Estadísticas</h2>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">3.1 Solicitudes ARCO-P (derechos del titular)</h3>
              <p>
                Solicitudes ejercidas conforme a la Ley 19.628 y 21.719, atendidas en un plazo máximo
                de 15 días hábiles desde la recepción.
              </p>
              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Tipo</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Recibidas</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Resueltas</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Tiempo promedio</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Acceso</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Rectificación</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Cancelación</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Oposición</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Portabilidad</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">3.2 Avisos DMCA</h3>
              <p>
                Notificaciones de infracción de propiedad intelectual recibidas conforme a la Ley
                17.336 (Chile) y al estándar DMCA internacional. SLA interno: 7 días hábiles.
              </p>
              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Recibidos</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Procesados</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Take-downs aplicados</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Counter-notices</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">3.3 Reportes de contenido</h3>
              <p>
                Denuncias de usuarios sobre contenido publicado. Categorizadas por tipo. Los reportes
                de CSAM son <strong>cero tolerancia</strong>: cualquier match positivo deriva en
                suspensión inmediata y reporte a PDI Cyber Chile y NCMEC.
              </p>
              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Categoría</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">CSAM (sospecha o match positivo)</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Acoso y conducta abusiva</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Otros (spam, fraude, contenido sin consentimiento)</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">3.4 Brechas de seguridad notificadas</h3>
              <p>
                Incidentes detectados y notificados conforme al Art. 23 quater de la Ley 21.719. La
                obligación de notificación se cumple dentro de las 72 horas desde el conocimiento
                efectivo del incidente.
              </p>
              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Severidad</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Cantidad</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Tiempo promedio de notificación</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Crítica</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Alta</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Media</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Baja</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">3.5 KYC (Know Your Customer)</h3>
              <p>
                Verificaciones de identidad de creadores. Procesadas de manera manual durante la fase
                inicial, con SLA interno de 72 horas hábiles desde la submission.
              </p>
              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Aprobados</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Rechazados</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">En revisión</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Tiempo promedio</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">3.6 Requerimientos judiciales o administrativos</h3>
              <p>
                Solicitudes formales emitidas por tribunales, fiscalía, policía u otra autoridad
                competente. Cada requerimiento se evalúa caso a caso por el área legal antes de
                cumplirse.
              </p>
              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Recibidos</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Cumplidos íntegramente</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Cumplidos parcialmente</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Rechazados</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                      <td className="px-3 py-2 text-amber-300">[PENDIENTE]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Fuente de los datos</h2>
              <p>
                Estas estadísticas se calculan a partir de nuestro <strong>audit log interno</strong> y
                se publican siguiendo principios estrictos de <strong>minimización</strong>: no se
                incluye información personal identificable de los titulares, ni datos que permitan
                identificar directa o indirectamente a usuarios específicos.
              </p>
              <p className="mt-4">
                Los registros base (audit logs) se conservan por 5 años conforme a nuestra Política de
                Retención. Los reportes publicados son derivados agregados de esos registros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Reportes anteriores</h2>
              <p className="text-amber-300">
                [PENDIENTE — el primer reporte se publicará al cierre del primer trimestre
                post-lanzamiento, en formato PDF descargable. Esta sección listará los reportes
                trimestrales anteriores conforme se vayan publicando.]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Metodología</h2>
              <p>Resumen de cómo se calcula cada métrica:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Solicitudes ARCO-P:</strong> conteo de registros del modelo{' '}
                  <code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">DataRightRequest</code>{' '}
                  por tipo y por estado. El tiempo promedio se calcula entre{' '}
                  <code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">createdAt</code>{' '}
                  y{' '}
                  <code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">resolvedAt</code>.
                </li>
                <li>
                  <strong>Avisos DMCA:</strong> conteo del modelo{' '}
                  <code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">DmcaNotice</code>{' '}
                  por estado: recibido, take-down aplicado, counter-notice presentada y resuelta a
                  favor del creador.
                </li>
                <li>
                  <strong>Reportes de contenido:</strong> conteo de denuncias clasificadas por
                  categoría. Los reportes CSAM se contabilizan separadamente y se reportan a la
                  autoridad sin importar el resultado del triaje interno.
                </li>
                <li>
                  <strong>Brechas:</strong> registros del modelo{' '}
                  <code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">DataBreach</code>{' '}
                  con severidad asignada por triaje del equipo de seguridad. El tiempo de
                  notificación se mide entre la detección efectiva y la salida de la notificación a
                  la autoridad y/o titulares afectados.
                </li>
                <li>
                  <strong>KYC:</strong> conteo del modelo{' '}
                  <code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">CreatorKycSubmission</code>{' '}
                  por estado: aprobado, rechazado, pendiente. Tiempo promedio = desde submission a
                  decisión final del DPO.
                </li>
                <li>
                  <strong>Requerimientos judiciales:</strong> conteo manual mantenido por el área
                  legal, cruzado con el audit log de accesos administrativos vinculados a cada
                  requerimiento.
                </li>
              </ul>
            </section>

            <section className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Consultas sobre este reporte:{' '}
                <a href="mailto:legal@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  legal@appapacho.cl
                </a>{' '}
                · Asuntos de privacidad:{' '}
                <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  privacidad@appapacho.cl
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
            Seguridad
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
            href="/empresa"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Sobre nosotros
          </Link>
        </div>
      </div>
    </div>
  )
}
