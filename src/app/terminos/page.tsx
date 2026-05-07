'use client'

import Link from 'next/link'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#0f0f14] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white mb-2">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Versión 1.0 · Vigente desde el 6 de mayo de 2026
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. GENERALIDADES</h2>
              <p>
                Los presentes Términos y Condiciones de Uso (en adelante, los &quot;Términos&quot;) regulan la relación
                comercial entre <strong>Apapacho SpA</strong> (en adelante, &quot;Apapacho&quot;, &quot;nosotros&quot;
                o &quot;la Plataforma&quot;), sociedad chilena con razón social [Apapacho SpA — RUT por completar] y
                domicilio en [A completar], y toda persona natural mayor de edad que acceda, navegue, se registre o
                contrate cualquiera de los servicios disponibles en el sitio web <span className="text-fuchsia-400">www.appapacho.cl</span>
                {' '}y sus aplicaciones asociadas (en adelante, el &quot;Usuario&quot;, indistintamente para Usuarios
                consumidores y Creadores de contenido).
              </p>
              <p className="mt-4">
                Apapacho es una plataforma chilena de creadores de contenido para personas adultas, que facilita a
                Creadores publicar y monetizar su contenido digital, y a Usuarios suscriptores acceder a dicho contenido
                mediante suscripciones, propinas o pagos individuales. La presente normativa regula exclusivamente la
                relación comercial entre las partes; el tratamiento de datos personales se rige por nuestra
                {' '}<Link href="/privacidad" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  Política de Privacidad
                </Link>, parte integrante de estos Términos.
              </p>
              <p className="mt-4">
                El acceso o uso de cualquier funcionalidad de la Plataforma implica la aceptación íntegra y sin reservas
                de los presentes Términos. Si el Usuario no está de acuerdo con alguna parte, debe abstenerse de utilizar
                la Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. CAPACIDAD LEGAL Y EDAD MÍNIMA</h2>
              <p>
                Apapacho está dirigido <strong>exclusivamente a personas mayores de 18 años</strong>. Al registrarse, el
                Usuario declara <strong>bajo juramento</strong> tener cumplidos los 18 años de edad y poseer la capacidad
                legal necesaria para celebrar contratos vinculantes conforme a la legislación chilena.
              </p>
              <p className="mt-4">
                La declaración falsa sobre la edad constituye una infracción grave que faculta a Apapacho a cancelar la
                cuenta de inmediato, retener fondos hasta esclarecer la situación y comunicar los hechos a las autoridades
                competentes cuando corresponda. El proceso de KYC (Know Your Customer) obligatorio para Creadores incluye
                verificación documental de edad mediante cédula de identidad chilena vigente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. REGISTRO Y CUENTA DE USUARIO</h2>
              <p>
                El registro requiere proporcionar un correo electrónico válido, una contraseña segura y un nombre de
                usuario único. Los Usuarios pueden utilizar <strong>pseudónimos</strong> u otros nombres distintos a su
                identidad civil para construir su comunidad en la Plataforma; sin embargo, los datos verídicos de
                identidad serán recolectados y verificados internamente cuando la ley o el proceso de KYC así lo exijan.
              </p>
              <p className="mt-4">
                Cada persona natural sólo puede mantener <strong>una (1) cuenta activa</strong>. La creación de cuentas
                múltiples por una misma persona, salvo autorización expresa de Apapacho, constituye causal de suspensión.
                El Usuario es responsable de mantener la confidencialidad de su contraseña y de toda actividad realizada
                desde su cuenta. Cualquier uso indebido detectado debe ser notificado de inmediato a
                {' '}<a href="mailto:contacto@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  contacto@appapacho.cl
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. SUSCRIPCIONES, PAGOS Y RETIROS</h2>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.1 Pagos por Usuarios</h3>
              <p>
                Los pagos se procesan a través de pasarelas autorizadas: <strong>Webpay/Transbank</strong> y
                {' '}<strong>Fintoc</strong> (Chile) y <strong>MercadoPago</strong> (Chile/Argentina). Las suscripciones
                pueden ser de renovación automática mensual; el Usuario puede cancelarlas en cualquier momento desde su
                panel sin que ello implique reembolso de períodos ya pagados, salvo que la ley lo exija.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.2 Comisión de la Plataforma</h3>
              <p>
                Apapacho retiene una comisión sobre cada transacción neta percibida por el Creador. El porcentaje vigente
                se publica en la sección Pricing de la Plataforma y se notificará con al menos <strong>30 días de
                antelación</strong> ante cualquier modificación.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.3 Retiros de Creadores</h3>
              <p>
                El Creador podrá solicitar retiros de los fondos disponibles en su saldo siempre que cumpla con: (i) KYC
                aprobado, (ii) saldo mínimo establecido en su panel y (iii) método de pago bancario verificado. Los
                retiros se procesan dentro del ciclo de pagos publicado (típicamente quincenal). Apapacho declara cumplir
                con las obligaciones tributarias propias derivadas de la prestación de su servicio; cada Creador es
                responsable de declarar y pagar los tributos que correspondan a las utilidades obtenidas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. CONDUCTA ESPERADA DEL USUARIO</h2>
              <p>El Usuario suscriptor se obliga a:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Utilizar la Plataforma de buena fe, conforme al Ordenamiento Jurídico Chileno, la moral y el orden público.</li>
                <li>Tratar al contenido publicado por los Creadores como material para uso personal, sin extraerlo, redistribuirlo o reproducirlo fuera de la Plataforma.</li>
                <li>No utilizar el contenido con fines comerciales sin un acuerdo expreso y por escrito con el Creador titular.</li>
                <li>Abstenerse de cualquier conducta de hostigamiento, difamación, discriminación o explotación hacia los Creadores u otros usuarios.</li>
                <li>No intentar identificar la identidad civil de un Creador que utilice pseudónimo, ni divulgar información personal de terceros.</li>
                <li>Reportar contenido ilícito o conductas indebidas mediante las herramientas habilitadas o al correo <a href="mailto:contacto@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">contacto@appapacho.cl</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. CONDUCTA ESPERADA DEL CREADOR</h2>
              <p>El Creador se obliga, además de las reglas aplicables a todo Usuario, a:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Completar y mantener vigente el proceso <strong>KYC</strong> (verificación de identidad y edad mediante cédula chilena y selfie).</li>
                <li>Publicar únicamente contenido <strong>lícito</strong>, sobre el que ostente la titularidad de los derechos de autor o cuente con autorización expresa para su explotación.</li>
                <li><strong>Prohibición absoluta</strong> de publicar material de abuso sexual infantil (CSAM) o cualquier contenido que represente, sexualice o involucre a personas menores de 18 años. Cualquier hallazgo en este sentido será reportado de inmediato a las autoridades chilenas competentes y derivará en la cancelación irrevocable de la cuenta.</li>
                <li>No publicar contenido que exhiba a terceros sin consentimiento expreso, escrito y verificable de cada persona representada.</li>
                <li>No incitar a contratar fuera de la Plataforma con fines de evadir comisiones o controles de seguridad.</li>
                <li>Mantener actualizada la información tributaria y bancaria asociada a sus retiros.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. LIMITACIÓN DE RESPONSABILIDAD</h2>
              <p>
                Apapacho actúa como intermediario tecnológico que provee la infraestructura para que los Creadores
                publiquen su contenido y los Usuarios accedan al mismo. Apapacho no es autor del contenido publicado por
                los Creadores ni responde por las opiniones, declaraciones o materiales que éstos suban a la Plataforma.
              </p>
              <p className="mt-4">
                Sin perjuicio de lo anterior, y en cumplimiento del principio de <strong>accountability</strong>
                consagrado en la Ley N° 21.719, Apapacho asume responsabilidad directa por:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>La debida diligencia en la moderación de contenido manifiestamente ilícito una vez notificado.</li>
                <li>La seguridad de la información personal tratada (cifrado en reposo, controles de acceso, registros de auditoría).</li>
                <li>El cumplimiento de los SLA comprometidos para solicitudes ARCO-P (15 días hábiles) y DMCA (7 días hábiles).</li>
                <li>La notificación oportuna de brechas de seguridad (dentro de las 72 horas desde su conocimiento) a la autoridad y a los usuarios afectados.</li>
              </ul>
              <p className="mt-4">
                Apapacho <strong>no</strong> incluye cláusulas de exoneración absolutas ni renuncias a derechos
                irrenunciables del consumidor reconocidos por la Ley N° 19.496.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. SUSPENSIÓN Y TERMINACIÓN DE CUENTA</h2>
              <p>
                Apapacho podrá suspender o cancelar una cuenta cuando concurra alguna de las siguientes causales:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Incumplimiento grave o reiterado de los presentes Términos.</li>
                <li>Uso fraudulento de medios de pago, contracargos abusivos o lavado de activos.</li>
                <li>Publicación de contenido ilícito (CSAM, contenido sin consentimiento de terceros, infracciones de propiedad intelectual reiteradas).</li>
                <li>Falsedad en la edad o en la documentación KYC.</li>
                <li>Solicitud expresa de la autoridad judicial o administrativa.</li>
              </ul>
              <p className="mt-4">
                <strong>Derecho de apelación:</strong> el Usuario afectado podrá apelar la suspensión enviando
                antecedentes a <a href="mailto:legal@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  legal@appapacho.cl
                </a> dentro de los 30 días siguientes a la notificación. Apapacho responderá de manera fundada en un plazo
                máximo de 15 días hábiles. Los fondos legítimamente devengados al momento de la cancelación serán
                liquidados conforme al ciclo de pagos, salvo retención judicial o administrativa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. MODIFICACIONES A LOS TÉRMINOS</h2>
              <p>
                Apapacho podrá modificar los presentes Términos en cualquier momento. Toda modificación será notificada
                con al menos <strong>30 días de antelación</strong> a su entrada en vigor mediante: (i) correo
                electrónico al Usuario y (ii) banner visible en la Plataforma. Si el cambio implica la incorporación de
                nuevas finalidades de tratamiento de datos, se solicitará un nuevo consentimiento expreso conforme a la
                Política de Privacidad.
              </p>
              <p className="mt-4">
                El uso continuado de la Plataforma con posterioridad a la entrada en vigor de los nuevos Términos
                constituye aceptación de los mismos. El Usuario que no esté de acuerdo podrá cancelar su cuenta sin
                penalización.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. LEY APLICABLE Y JURISDICCIÓN</h2>
              <p>
                Los presentes Términos se rigen íntegramente por las leyes de la <strong>República de Chile</strong>,
                incluyendo de manera particular la Ley N° 19.496 sobre Derechos del Consumidor, la Ley N° 19.628 y la
                Ley N° 21.719 sobre Protección de Datos Personales, la Ley N° 17.336 sobre Propiedad Intelectual y demás
                normativa aplicable.
              </p>
              <p className="mt-4">
                Las partes fijan su domicilio en la ciudad de Santiago de Chile y se someten a la jurisdicción de sus
                tribunales ordinarios de justicia para todo conflicto derivado de la interpretación o ejecución de los
                presentes Términos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">11. CONTACTO</h2>
              <p>
                Para consultas comerciales, soporte general o reclamos relacionados con el uso de la Plataforma:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>Soporte general:</strong> <a href="mailto:contacto@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">contacto@appapacho.cl</a></li>
                <li><strong>Asuntos legales / cumplimiento:</strong> <a href="mailto:legal@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">legal@appapacho.cl</a></li>
                <li><strong>Privacidad y datos personales:</strong> <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">privacidad@appapacho.cl</a></li>
                <li><strong>Notificaciones DMCA / propiedad intelectual:</strong> <a href="mailto:dmca@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">dmca@appapacho.cl</a></li>
              </ul>
              <p className="mt-4 text-sm text-gray-400">
                El tratamiento de tus datos personales se rige por nuestra
                {' '}<Link href="/privacidad" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  Política de Privacidad
                </Link>, parte integrante de estos Términos.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Versión 1.0 · Vigente desde el 6 de mayo de 2026 · Apapacho SpA
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-medium rounded-xl transition-colors"
            >
              Volver al Registro
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
