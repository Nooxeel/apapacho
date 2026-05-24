'use client'

import Link from 'next/link'

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Versión 1.0 · Vigente desde el 6 de mayo de 2026
          </p>

          {/* Banner: Apapacho SpA constitution pending placeholders */}
          <div
            role="alert"
            aria-label="Aviso sobre campos pendientes del Responsable"
            className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
          >
            <p className="font-semibold mb-1">Aviso importante</p>
            <p>
              Los datos del Responsable marcados como{' '}
              <strong>[PENDIENTE COMPLETAR]</strong> serán publicados antes del
              lanzamiento público de la Plataforma. Esta política es vinculante
              una vez completados todos los campos del Responsable. Hasta entonces,
              cualquier consulta puede dirigirse a{' '}
              <a href="mailto:privacidad@appapacho.cl" className="underline">
                privacidad@appapacho.cl
              </a>.
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. INTRODUCCIÓN</h2>
              <p>
                La presente Política de Privacidad describe cómo Apapacho recolecta, utiliza, almacena, comparte y
                protege los datos personales de sus Usuarios. Este documento da cumplimiento a las disposiciones de la
                {' '}<strong>Ley N° 19.628</strong> sobre Protección de la Vida Privada y, especialmente, a la
                {' '}<strong>Ley N° 21.719</strong> que actualiza el régimen chileno de protección de datos personales y
                lo equipara a estándares internacionales equivalentes al Reglamento General de Protección de Datos
                (GDPR) europeo.
              </p>
              <p className="mt-4">
                La presente Política forma parte integrante de nuestros{' '}
                <Link href="/terminos" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  Términos y Condiciones
                </Link>. Si no está de acuerdo con alguna de sus disposiciones, debe abstenerse de utilizar la
                Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. IDENTIDAD DEL RESPONSABLE DEL TRATAMIENTO</h2>
              <ul className="list-none space-y-2">
                <li>
                  <strong>Razón social:</strong>{' '}
                  <span className="text-amber-300">[PENDIENTE COMPLETAR — al constituir Apapacho SpA en SII]</span>
                </li>
                <li>
                  <strong>RUT:</strong>{' '}
                  <span className="text-amber-300">[PENDIENTE COMPLETAR]</span>
                </li>
                <li>
                  <strong>Domicilio legal:</strong>{' '}
                  <span className="text-amber-300">[PENDIENTE COMPLETAR]</span>
                </li>
                <li><strong>Representante legal:</strong> Jorge Moya</li>
                <li>
                  <strong>Sitio web:</strong>{' '}
                  <a href="https://appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    https://appapacho.cl
                  </a>
                </li>
                <li>
                  <strong>Email general:</strong>{' '}
                  <a href="mailto:contacto@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    contacto@appapacho.cl
                  </a>
                </li>
                <li>
                  <strong>Email DPO / privacidad:</strong>{' '}
                  <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    privacidad@appapacho.cl
                  </a>
                </li>
                <li>
                  <strong>Delegado de Protección de Datos (DPO):</strong>{' '}
                  <span className="text-amber-300">[PENDIENTE COMPLETAR — contratar abogado externo]</span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-400">
                Los datos marcados como <strong>[PENDIENTE COMPLETAR]</strong> serán completados
                antes del lanzamiento público. Esta política es vinculante una vez completados
                todos los campos del Responsable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. DELEGADO DE PROTECCIÓN DE DATOS (DPD)</h2>
              <p>
                Apapacho ha designado un canal específico para la atención de consultas, reclamos y solicitudes
                relacionadas con el tratamiento de datos personales (derechos ARCO-P y derechos adicionales reconocidos
                por la Ley N° 21.719).
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>Email del DPD:</strong> <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">privacidad@appapacho.cl</a></li>
                <li><strong>Responsabilidad:</strong> atender consultas y solicitudes ARCO-P, supervisar el cumplimiento normativo y servir de punto de contacto con la autoridad de control.</li>
              </ul>
              <p className="mt-4 text-sm text-gray-400">
                Nota: la designación nominativa del DPD externo se publicará en el campo del Responsable
                arriba una vez formalizado el contrato con el abogado externo. Hasta entonces, el canal
                <code className="text-fuchsia-300 bg-white/5 px-1 mx-1 rounded">privacidad@appapacho.cl</code>
                opera bajo supervisión directa del representante legal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. DATOS QUE TRATAMOS</h2>
              <p>Categorizamos los datos personales tratados de la siguiente forma:</p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.1 Identidad y contacto</h3>
              <p>Nombre, correo electrónico, nombre de usuario (puede ser pseudónimo), fecha de nacimiento, dirección IP, identificadores de dispositivo.</p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.2 Datos de pago</h3>
              <p>Tarjeta tokenizada (Transbank Oneclick), cuenta bancaria del Creador para retiros (cifrada en reposo), historial transaccional.</p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.3 Datos sensibles (categoría especial Ley 21.719)</h3>
              <p>
                Por la naturaleza de la Plataforma, podemos tratar datos calificados como sensibles:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><strong>Vida afectiva y sexual:</strong> derivada de las preferencias de contenido, suscripciones a Creadores específicos e interacciones del Usuario en la Plataforma.</li>
                <li><strong>Datos biométricos:</strong> derivados del proceso KYC obligatorio para Creadores (selfie con cédula, comparación de rasgos faciales).</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.4 Documentos de identidad (KYC)</h3>
              <p>Cédula de identidad chilena (frente y reverso), selfie con documento, RUT, dirección de facturación.</p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.5 Contenido publicado</h3>
              <p>Publicaciones, mensajes privados, comentarios, fotografías y videos subidos por Usuarios y Creadores.</p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.6 Datos de uso</h3>
              <p>Páginas visitadas, tiempo de permanencia, suscripciones activas, donaciones, interacciones, historial de navegación dentro de la Plataforma.</p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">4.7 Cookies y dispositivos</h3>
              <p>Información sobre el navegador, sistema operativo, idioma, zona horaria, identificadores de cookies. Detalle completo en nuestra <Link href="/cookies" className="text-fuchsia-400 hover:text-fuchsia-300 underline">Política de Cookies</Link>.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. FINALIDADES Y BASES DE LICITUD</h2>
              <p>
                Cada finalidad del tratamiento se sustenta en una base de licitud específica conforme a la Ley N° 21.719:
              </p>
              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Finalidad</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Base de licitud</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Datos involucrados</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Ejecución del servicio (autenticación, contenido, pagos)</td>
                      <td className="px-3 py-2">Ejecución del contrato</td>
                      <td className="px-3 py-2">Identidad, pago, contenido</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Cumplimiento de obligaciones legales (KYC, antifraude, registros tributarios)</td>
                      <td className="px-3 py-2">Obligación legal (Ley 19.913, Ley 19.846, Código Tributario)</td>
                      <td className="px-3 py-2">KYC, transacciones</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Marketing y comunicaciones promocionales</td>
                      <td className="px-3 py-2">Consentimiento explícito</td>
                      <td className="px-3 py-2">Email, preferencias</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Personalización de contenido (perfilamiento)</td>
                      <td className="px-3 py-2">Consentimiento explícito</td>
                      <td className="px-3 py-2">Datos de uso</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Transferencia internacional a procesadores</td>
                      <td className="px-3 py-2">Consentimiento + cláusulas contractuales tipo (SCC)</td>
                      <td className="px-3 py-2">Todos</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Tratamiento de datos sensibles</td>
                      <td className="px-3 py-2">Consentimiento explícito y por escrito</td>
                      <td className="px-3 py-2">Vida sexual, biométricos KYC</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. DATOS SENSIBLES — TRATAMIENTO REFORZADO</h2>
              <p>
                Reconocemos que la actividad propia de Apapacho conlleva el tratamiento de datos calificados como
                sensibles por la Ley N° 21.719: información derivada de la vida afectiva y sexual del Usuario y datos
                biométricos del proceso KYC. Por ello, aplicamos medidas de seguridad reforzadas:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Cifrado en reposo:</strong> AES-256-GCM para documentos KYC, cuentas bancarias y todo dato sensible almacenado en base de datos.</li>
                <li><strong>Signed URLs con TTL corto:</strong> el acceso a media privada se efectúa mediante URLs firmadas con caducidad de 15 minutos.</li>
                <li><strong>Acceso restringido:</strong> sólo administradores con KYC interno aprobado y autenticación reforzada pueden visualizar documentos KYC, dejando trazabilidad completa en el registro de auditoría.</li>
                <li><strong>Segregación de ambientes:</strong> los datos sensibles no se replican fuera de los entornos productivos cifrados.</li>
              </ul>
              <p className="mt-4">
                <strong>Derecho a retirar el consentimiento:</strong> el Usuario puede revocar en cualquier momento el
                consentimiento para el tratamiento de datos sensibles. Esta revocación implica que la cuenta no podrá
                continuar operando, en cuanto el funcionamiento del servicio depende necesariamente de dichos datos.
                Procederemos al cierre de la cuenta y a la aplicación de los plazos de retención legales mínimos
                indicados más abajo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. DESTINATARIOS DE TUS DATOS</h2>
              <p>
                Para operar la Plataforma usamos los siguientes procesadores. Todos ellos están obligados
                contractualmente a tratar tus datos conforme a estándares <strong>equivalentes o superiores</strong>{' '}
                a los exigidos por la Ley 21.719 chilena, ya sea mediante DPAs (Data Processing Agreements)
                firmados directamente o mediante cláusulas contractuales tipo equivalentes.
              </p>
              <div className="overflow-x-auto mt-4 -mx-2 sm:mx-0">
                <table className="min-w-full text-sm border border-white/10 rounded-lg">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Procesador</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">País</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Datos que procesa</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Propósito</th>
                      <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Salvaguardas</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Cloudinary, Inc.</td>
                      <td className="px-3 py-2">Estados Unidos</td>
                      <td className="px-3 py-2">Imágenes, videos, documentos KYC (cifrados)</td>
                      <td className="px-3 py-2">Almacenamiento y entrega de contenido</td>
                      <td className="px-3 py-2">DPA + cifrado en reposo + signed URLs TTL limitado</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Resend, Inc.</td>
                      <td className="px-3 py-2">Estados Unidos</td>
                      <td className="px-3 py-2">Email + nombre del destinatario</td>
                      <td className="px-3 py-2">Envío de emails transaccionales y marketing (con consent)</td>
                      <td className="px-3 py-2">DPA + cláusulas contractuales tipo</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Railway Corp.</td>
                      <td className="px-3 py-2">Estados Unidos</td>
                      <td className="px-3 py-2">Toda la base de datos</td>
                      <td className="px-3 py-2">Hosting backend y Postgres gestionado</td>
                      <td className="px-3 py-2">DPA + cifrado en tránsito y reposo</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Vercel Inc.</td>
                      <td className="px-3 py-2">Estados Unidos</td>
                      <td className="px-3 py-2">Logs de request, edge cache</td>
                      <td className="px-3 py-2">Hosting frontend</td>
                      <td className="px-3 py-2">DPA + cláusulas tipo</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Transbank S.A.</td>
                      <td className="px-3 py-2">Chile</td>
                      <td className="px-3 py-2">Datos de tarjeta (tokenizados)</td>
                      <td className="px-3 py-2">Procesamiento de pagos Webpay</td>
                      <td className="px-3 py-2">Convenio comercial + regulación local</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">MercadoPago</td>
                      <td className="px-3 py-2">Argentina (regional)</td>
                      <td className="px-3 py-2">Datos de transacción</td>
                      <td className="px-3 py-2">Procesamiento de pagos</td>
                      <td className="px-3 py-2">DPA + cláusulas tipo</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2">Google LLC (OAuth)</td>
                      <td className="px-3 py-2">Estados Unidos</td>
                      <td className="px-3 py-2">Email + nombre al iniciar sesión social</td>
                      <td className="px-3 py-2">Autenticación opcional</td>
                      <td className="px-3 py-2">Términos de Google vinculantes</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Sentry, Inc.</td>
                      <td className="px-3 py-2">Estados Unidos</td>
                      <td className="px-3 py-2">Logs de error sin PII (redactados)</td>
                      <td className="px-3 py-2">Monitoreo de errores en producción</td>
                      <td className="px-3 py-2">DPA + redaction obligatoria</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                No vendemos datos personales. Las transferencias hacia Estados Unidos o Argentina se efectúan al
                amparo de <strong>Cláusulas Contractuales Tipo (SCC)</strong> equivalentes a las europeas, suscritas
                con cada procesador. Estas cláusulas obligan al destinatario a aplicar un nivel de protección
                equivalente al exigido por la legislación chilena, y facultan al titular de los datos a hacer valer
                sus derechos directamente frente al procesador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. PLAZOS DE RETENCIÓN</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Cuenta activa:</strong> conservamos los datos mientras la cuenta del Usuario esté activa.</li>
                <li><strong>Mensajes y conversaciones:</strong> 2 años posteriores a su eliminación por el Usuario.</li>
                <li><strong>Registros de auditoría (audit logs):</strong> 5 años desde su generación.</li>
                <li><strong>Registros financieros y tributarios:</strong> 7 años (Código Tributario Art. 17).</li>
                <li><strong>Documentos KYC:</strong> 7 años posteriores a la aprobación o rechazo (cumplimiento Ley N° 19.846 y normativa contra el lavado de activos).</li>
                <li><strong>Brechas de seguridad registradas:</strong> 5 años.</li>
                <li><strong>Post-cancelación general:</strong> 30 días para datos no sujetos a retención fiscal o legal específica, transcurridos los cuales se eliminan o anonimizan irreversiblemente.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. TUS DERECHOS (ARCO-P + LEY 21.719)</h2>
              <p>
                Como titular de datos personales, dispones de los siguientes derechos, que serán atendidos en un plazo
                máximo de <strong>15 días hábiles</strong> desde la recepción de la solicitud:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Acceso:</strong> obtener confirmación sobre si tratamos tus datos y, en su caso, copia íntegra de los mismos.</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos, incompletos o desactualizados.</li>
                <li><strong>Cancelación (derecho al olvido):</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios para los fines tratados o exista causa legal.</li>
                <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos para fines determinados.</li>
                <li><strong>Portabilidad:</strong> obtener tus datos en formato estructurado y de uso común (descarga ZIP que incluye JSON con perfil, posts, mensajes, transacciones, consentimientos y carpeta media/).</li>
                <li><strong>Derecho a no ser objeto de decisiones automatizadas:</strong> incluyendo el perfilamiento (recomendaciones algorítmicas), con derecho a obtener intervención humana, expresar tu punto de vista e impugnar la decisión.</li>
                <li><strong>Derecho de oposición a tratamientos específicos:</strong> sin necesidad de justificar la oposición, particularmente respecto del marketing directo.</li>
                <li><strong>Derecho a retirar el consentimiento:</strong> en cualquier momento, sin afectar la licitud del tratamiento previo a la revocación.</li>
              </ul>
              <p className="mt-4">
                Para ejercer cualquiera de estos derechos puedes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Utilizar el formulario habilitado en{' '}
                  <Link href="/derechos" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                    /derechos
                  </Link>.
                </li>
                <li>Escribir directamente a{' '}
                  <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                    privacidad@appapacho.cl
                  </a>.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. NOTIFICACIÓN DE BRECHAS DE SEGURIDAD</h2>
              <p>
                Conforme al principio de <strong>accountability</strong> (responsabilidad proactiva) consagrado en la
                Ley N° 21.719, Apapacho se compromete a:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Notificar a la <strong>Agencia de Protección de Datos</strong> (cuando se encuentre operativa) y, mientras tanto, a la autoridad chilena competente, dentro de las <strong>72 horas</strong> contadas desde el conocimiento efectivo de una brecha que represente un riesgo para los derechos de los Usuarios.</li>
                <li>Notificar a los <strong>Usuarios afectados</strong> dentro del mismo plazo de 72 horas, indicando la naturaleza de la brecha, los datos comprometidos, las medidas adoptadas y las recomendaciones de mitigación.</li>
                <li>Mantener un registro interno de todas las brechas detectadas (registradas o no notificables), con sus métricas de tiempo de detección, contención y notificación.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">11. DECISIONES AUTOMATIZADAS Y PERFILAMIENTO</h2>
              <p>
                Apapacho utiliza recomendaciones algorítmicas para personalizar la experiencia en las secciones
                {' '}<code className="text-fuchsia-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">/discover</code> y en el
                feed personalizado del Usuario.
              </p>
              <p className="mt-4">
                <strong>Lógica empleada:</strong> filtrado por intereses declarados o inferidos del comportamiento de
                navegación, popularidad del contenido (engagement) y recencia de la publicación. No se aplican
                decisiones automatizadas con efectos jurídicos que afecten significativamente al Usuario sin
                intervención humana.
              </p>
              <p className="mt-4">
                <strong>Tus derechos sobre estas decisiones:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Oponerte al perfilamiento sin necesidad de justificarlo.</li>
                <li>Solicitar intervención humana en la revisión de cualquier decisión automatizada.</li>
                <li>Expresar tu punto de vista e impugnar la decisión.</li>
              </ul>
              <p className="mt-4">
                Puedes ejercer estos derechos en{' '}
                <Link href="/settings/privacy" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  /settings/privacy
                </Link>{' '}
                (opt-out de personalización) o desde el formulario en{' '}
                <Link href="/derechos" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  /derechos
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">12. COOKIES</h2>
              <p>
                Utilizamos cookies esenciales para el funcionamiento del sitio y, sujeto a tu consentimiento, cookies de
                preferencias y analíticas. Detalle completo, listado nominal de cookies y herramientas de gestión en
                nuestra{' '}
                <Link href="/cookies" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                  Política de Cookies
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">13. PROTECCIÓN DE MENORES DE EDAD</h2>
              <p>
                La plataforma de Apapacho está <strong>estrictamente prohibida</strong> para menores de 18 años.
                Implementamos múltiples barreras técnicas para prevenir su acceso:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Verificación de mayoría de edad obligatoria al ingresar al sitio (age gate).</li>
                <li>Confirmación de fecha de nacimiento al registrarse.</li>
                <li>Verificación de identidad con cédula chilena para Creadores de contenido (KYC con selfie biométrica).</li>
                <li>Monitoreo continuo de patrones que sugieran cuentas de menores.</li>
              </ul>
              <p className="mt-4">
                Si descubres que un menor de 18 años está usando la plataforma, contáctanos inmediatamente a{' '}
                <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  privacidad@appapacho.cl
                </a>
                . Procederemos a:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Suspender la cuenta dentro de las <strong>24 horas</strong>.</li>
                <li>Eliminar toda la información personal del menor de manera expedita.</li>
                <li>
                  Si el menor produjo o consumió contenido sensible: reportar a las autoridades correspondientes
                  (<strong>PDI Cyber Chile</strong>, <strong>NCMEC CyberTipline</strong>) según la
                  Ley 21.515 y normativas internacionales.
                </li>
              </ol>
              <p className="mt-4">
                Si crees que tu hijo o tutelado ha accedido a la plataforma sin tu autorización, puedes ejercer su
                derecho de eliminación contactándonos con documentación que acredite la tutela.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">14. PROGRAMA DE CUMPLIMIENTO DE PRIVACIDAD</h2>
              <p>
                Apapacho mantiene un programa documentado de cumplimiento de privacidad alineado con la Ley N° 21.719,
                que incluye, sin limitarse a:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Políticas internas de seguridad de la información y protección de datos.</li>
                <li>Entrenamiento periódico al equipo y a los administradores con acceso a datos sensibles.</li>
                <li>Auditoría periódica de accesos, cifrado y procesos de retención/eliminación.</li>
                <li>Cifrado en reposo (AES-256-GCM) para datos sensibles y financieros.</li>
                <li>Signed URLs con TTL corto (15 minutos) para media privada.</li>
                <li>Segregación estricta de privilegios administrativos.</li>
                <li>Registro de todas las actividades de tratamiento conforme al principio de accountability.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">15. CAMBIOS A ESTA POLÍTICA</h2>
              <p>
                Esta política puede actualizarse para reflejar cambios legales, técnicos o de servicio. Cuando hagamos
                cambios sustanciales:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Te notificaremos por email al menos <strong>15 días</strong> antes de la entrada en vigor.</li>
                <li>
                  Verás un <strong>aviso destacado</strong> al iniciar sesión que te permitirá revisar los cambios
                  y reaceptar.
                </li>
                <li>Las versiones anteriores quedan archivadas y disponibles bajo solicitud.</li>
              </ul>
              <p className="mt-4">
                Si la modificación implica una <strong>nueva finalidad</strong> de tratamiento o un cambio en la base de
                licitud, solicitaremos un <strong>nuevo consentimiento expreso</strong>. La continuidad en el uso de la
                Plataforma luego de la entrada en vigor implica aceptación de los cambios que no requieran nuevo
                consentimiento.
              </p>
              <p className="mt-4 text-sm text-gray-400">
                Versión actual: <strong>1.0</strong> · Vigente desde el <strong>6 de mayo de 2026</strong>.
                Para consultar versiones anteriores escribe a{' '}
                <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  privacidad@appapacho.cl
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">16. CONTACTO</h2>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>Delegado de Protección de Datos (DPD):</strong> <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">privacidad@appapacho.cl</a></li>
                <li><strong>Asuntos legales / cumplimiento:</strong> <a href="mailto:legal@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">legal@appapacho.cl</a></li>
                <li><strong>Notificaciones DMCA / propiedad intelectual:</strong> <a href="mailto:dmca@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">dmca@appapacho.cl</a></li>
              </ul>
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
            href="/cookies"
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Política de Cookies
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
