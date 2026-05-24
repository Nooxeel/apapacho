import type { Metadata } from 'next'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: 'Empresa — Sobre Apapacho',
    description:
      'Apapacho es la plataforma chilena de creadores de contenido adulto que opera bajo normativa local: privacidad real, pseudonimia respetada y monetización justa con jurisdicción chilena.',
    keywords: [
      'sobre apapacho',
      'empresa apapacho',
      'plataforma creadores chile',
      'apapacho spa',
      'mision apapacho',
      'equipo apapacho',
    ],
    openGraph: {
      title: 'Sobre Apapacho | Empresa',
      description:
        'Construimos la plataforma de creadores adultos para Chile, con privacidad chilena.',
      type: 'website',
      locale: 'es_CL',
    },
    alternates: {
      canonical: '/empresa',
    },
  }
}

export default function EmpresaPage() {
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
            Construimos la plataforma de creadores adultos para Chile, con privacidad chilena
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Sobre Apapacho · Versión 1.0
          </p>

          {/* Banner: Apapacho SpA constitution pending placeholders */}
          <div
            role="alert"
            aria-label="Aviso sobre campos pendientes del Responsable"
            className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
          >
            <p className="font-semibold mb-1">Aviso importante</p>
            <p>
              Los datos corporativos marcados como <strong>[PENDIENTE COMPLETAR]</strong> se publicarán
              una vez formalizada la constitución de Apapacho SpA. Hasta entonces, cualquier consulta
              puede dirigirse a{' '}
              <a href="mailto:contacto@appapacho.cl" className="underline">
                contacto@appapacho.cl
              </a>.
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Identidad corporativa</h2>
              <ul className="list-none space-y-2">
                <li>
                  <strong>Razón social:</strong>{' '}
                  <span className="text-amber-300">[PENDIENTE COMPLETAR — Apapacho SpA al constituir]</span>
                </li>
                <li>
                  <strong>RUT:</strong>{' '}
                  <span className="text-amber-300">[PENDIENTE COMPLETAR]</span>
                </li>
                <li>
                  <strong>Domicilio legal:</strong>{' '}
                  <span className="text-amber-300">[PENDIENTE COMPLETAR]</span>
                </li>
                <li><strong>País de operación:</strong> Chile</li>
                <li><strong>Representante legal:</strong> Jorge Moya</li>
                <li>
                  <strong>Sitio web:</strong>{' '}
                  <a href="https://appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    https://appapacho.cl
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Nuestra misión</h2>
              <p>
                Apapacho existe para entregar a los creadores chilenos de contenido para adultos una
                alternativa <strong>local, transparente y bajo normativa nacional</strong>. Creemos que
                la independencia económica y la libertad creativa no deberían depender de plataformas
                extranjeras que operan bajo jurisdicciones lejanas, comisiones poco claras y políticas
                ajenas a la realidad latinoamericana.
              </p>
              <p className="mt-4">
                Por eso construimos una plataforma con privacidad real, monetización justa, pagos en
                pesos chilenos, jurisdicción local y cumplimiento estricto de la Ley N° 21.719. El
                objetivo no es replicar lo que existe afuera: es ofrecer una opción mejor, pensada
                desde Chile y para Chile.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Nuestros valores</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Privacidad como derecho</strong>, no como feature opcional. Cifrado por
                  defecto, minimización de datos y consentimientos granulares verificables.
                </li>
                <li>
                  <strong>Pseudonimia respetada</strong>: el nombre legal queda en custodia interna
                  protegida por cifrado. Sólo nosotros y, cuando la ley lo exija, las autoridades
                  competentes, conocen tu identidad civil.
                </li>
                <li>
                  <strong>Pago justo a creadores</strong>: comisión publicada y estable, con aviso de
                  30 días ante cualquier modificación. Sin sorpresas en payouts.
                </li>
                <li>
                  <strong>Operación bajo ley chilena</strong>: jurisdicción local, tribunales chilenos,
                  obligaciones tributarias en SII y normativa nacional aplicable.
                </li>
                <li>
                  <strong>Tolerancia cero a CSAM y contenido ilegal</strong>: escaneo automatizado en
                  cada upload, reporte inmediato a PDI Cyber Chile y NCMEC, suspensión irrevocable y
                  freeze de evidencia.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. El equipo</h2>
              <p>
                Apapacho se encuentra actualmente en su <strong>fase inicial</strong>. El equipo se
                expandirá en los próximos meses con perfiles de ingeniería, soporte y cumplimiento
                normativo a medida que crezca la operación.
              </p>
              <p className="mt-4 text-amber-300">
                [PENDIENTE COMPLETAR — presentación nominativa del equipo cuando esté formado]
              </p>
              <p className="mt-4 text-sm text-gray-400">
                Mientras tanto, las funciones operacionales clave (representación legal, decisiones de
                producto, supervisión KYC) se concentran en el representante legal con apoyo de un{' '}
                <strong>Delegado de Protección de Datos externo</strong> en proceso de contratación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Línea de tiempo</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>2026 H1 — Lanzamiento:</strong> apertura de registro, primeros creadores
                  onboarded vía KYC manual, pagos vía Webpay y MercadoPago, programa de
                  consentimientos granulares en producción.
                </li>
                <li>
                  <strong>2026 H2:</strong>{' '}
                  <span className="text-amber-300">
                    [PENDIENTE COMPLETAR — hitos planeados, p. ej. apertura a otros países LATAM,
                    integración Fintoc, KYC automatizado]
                  </span>
                </li>
                <li>
                  <strong>2027:</strong>{' '}
                  <span className="text-amber-300">
                    [PENDIENTE COMPLETAR — objetivos de escalamiento e iniciativas de certificación
                    ISO 27001]
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Contacto</h2>
              <ul className="list-none mt-4 space-y-2">
                <li>
                  <strong>General:</strong>{' '}
                  <a href="mailto:contacto@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    contacto@appapacho.cl
                  </a>
                </li>
                <li>
                  <strong>Prensa:</strong>{' '}
                  <a href="mailto:prensa@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    prensa@appapacho.cl
                  </a>
                </li>
                <li>
                  <strong>Privacidad / DPO:</strong>{' '}
                  <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    privacidad@appapacho.cl
                  </a>
                </li>
                <li>
                  <strong>Legal:</strong>{' '}
                  <a href="mailto:legal@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    legal@appapacho.cl
                  </a>
                </li>
                <li>
                  <strong>Soporte:</strong>{' '}
                  <a href="mailto:soporte@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    soporte@appapacho.cl
                  </a>
                </li>
                <li>
                  <strong>Seguridad / reporte de vulnerabilidades:</strong>{' '}
                  <a href="mailto:security@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    security@appapacho.cl
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Inversores y partners</h2>
              <p className="text-amber-300">
                [PENDIENTE COMPLETAR — listado de inversores, alianzas estratégicas y partners
                comerciales cuando aplique]
              </p>
              <p className="mt-4 text-sm text-gray-400">
                Si representas a una organización interesada en una alianza o ronda de inversión,
                escribe a{' '}
                <a href="mailto:contacto@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  contacto@appapacho.cl
                </a>{' '}
                con el asunto &quot;Inversión / Partnership&quot;.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Última revisión: mayo de 2026 · Apapacho · Operamos bajo legislación de la República de Chile.
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
