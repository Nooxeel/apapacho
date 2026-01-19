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
          <h1 className="text-3xl font-bold text-white mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <p className="text-sm text-gray-400">
              Última actualización: 18 de enero de 2026
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. INTRODUCCIÓN</h2>
              <p>
                En Appapacho (en adelante "nosotros", "nuestro" o "la plataforma") nos comprometemos a proteger 
                la privacidad de nuestros usuarios. Esta Política de Privacidad explica cómo recopilamos, usamos, 
                divulgamos y protegemos su información personal cuando utiliza nuestro sitio web www.appapacho.cl 
                y servicios relacionados.
              </p>
              <p className="mt-4">
                Al utilizar Appapacho, usted acepta las prácticas descritas en esta política. Si no está de acuerdo 
                con esta política, por favor no utilice nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. INFORMACIÓN QUE RECOPILAMOS</h2>
              
              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.1 Información que usted proporciona</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Datos de registro:</strong> nombre de usuario, correo electrónico, contraseña (encriptada), fecha de nacimiento.</li>
                <li><strong>Información de perfil:</strong> foto de perfil, biografía, enlaces a redes sociales.</li>
                <li><strong>Contenido:</strong> fotos, videos, textos y otros materiales que suba a la plataforma.</li>
                <li><strong>Información de pago:</strong> datos necesarios para procesar transacciones a través de Webpay Plus (Transbank).</li>
                <li><strong>Comunicaciones:</strong> mensajes que envíe a otros usuarios o a nuestro equipo de soporte.</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.2 Información recopilada automáticamente</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Datos de uso:</strong> páginas visitadas, tiempo de permanencia, interacciones con el contenido.</li>
                <li><strong>Información del dispositivo:</strong> tipo de navegador, sistema operativo, dirección IP.</li>
                <li><strong>Cookies:</strong> utilizamos cookies esenciales para el funcionamiento del sitio y cookies de análisis para mejorar nuestros servicios.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. CÓMO USAMOS SU INFORMACIÓN</h2>
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Proporcionar, mantener y mejorar nuestros servicios.</li>
                <li>Procesar transacciones y enviar notificaciones relacionadas.</li>
                <li>Verificar su identidad y edad (mayores de 18 años).</li>
                <li>Enviar comunicaciones sobre su cuenta, actualizaciones de la plataforma y, con su consentimiento, ofertas promocionales.</li>
                <li>Prevenir fraudes y actividades ilegales.</li>
                <li>Cumplir con obligaciones legales.</li>
                <li>Responder a sus consultas y solicitudes de soporte.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. COMPARTIR INFORMACIÓN</h2>
              <p>No vendemos su información personal. Podemos compartir su información con:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Proveedores de servicios:</strong> empresas que nos ayudan a operar la plataforma (procesamiento de pagos, almacenamiento en la nube, envío de emails).</li>
                <li><strong>Autoridades legales:</strong> cuando sea requerido por ley o para proteger nuestros derechos.</li>
                <li><strong>Con su consentimiento:</strong> en cualquier otra circunstancia con su autorización expresa.</li>
              </ul>
              <p className="mt-4">
                Los creadores de contenido pueden ver información limitada de sus suscriptores (nombre de usuario, 
                foto de perfil) para gestionar su comunidad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. COOKIES Y TECNOLOGÍAS SIMILARES</h2>
              <p>Utilizamos cookies para:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento del sitio (autenticación, seguridad).</li>
                <li><strong>Cookies de preferencias:</strong> recordar sus configuraciones y preferencias.</li>
                <li><strong>Cookies de análisis:</strong> entender cómo los usuarios interactúan con nuestro sitio para mejorarlo.</li>
              </ul>
              <p className="mt-4">
                Puede gestionar sus preferencias de cookies a través del banner de consentimiento o la configuración 
                de su navegador. Tenga en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. SEGURIDAD DE LA INFORMACIÓN</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información, incluyendo:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Encriptación de contraseñas mediante algoritmos seguros (bcrypt).</li>
                <li>Conexiones HTTPS para todas las comunicaciones.</li>
                <li>Tokens de autenticación seguros (JWT) con cookies httpOnly.</li>
                <li>Almacenamiento seguro de datos en servidores protegidos.</li>
                <li>Acceso restringido a datos personales solo a personal autorizado.</li>
              </ul>
              <p className="mt-4">
                Sin embargo, ningún método de transmisión por Internet es 100% seguro. Hacemos nuestro mejor esfuerzo 
                para proteger su información, pero no podemos garantizar seguridad absoluta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. SUS DERECHOS</h2>
              <p>De acuerdo con la Ley No. 19.628 de Protección de Datos Personales de Chile, usted tiene derecho a:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Acceso:</strong> solicitar una copia de los datos personales que tenemos sobre usted.</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
                <li><strong>Eliminación:</strong> solicitar la eliminación de sus datos personales.</li>
                <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos para fines específicos.</li>
              </ul>
              <p className="mt-4">
                Para ejercer estos derechos, contáctenos a través de <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">privacidad@appapacho.cl</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. RETENCIÓN DE DATOS</h2>
              <p>
                Conservamos su información personal mientras su cuenta esté activa o según sea necesario para 
                proporcionarle servicios. Si elimina su cuenta, eliminaremos o anonimizaremos su información 
                personal dentro de 30 días, excepto cuando debamos retenerla por obligaciones legales o para 
                resolver disputas.
              </p>
              <p className="mt-4">
                Los datos de transacciones financieras se conservan por el período requerido por la ley chilena 
                (generalmente 6 años para fines tributarios).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. MENORES DE EDAD</h2>
              <p>
                Appapacho está destinado exclusivamente a usuarios mayores de 18 años. No recopilamos 
                intencionalmente información de menores de edad. Si descubrimos que hemos recopilado datos 
                de un menor, los eliminaremos inmediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. TRANSFERENCIAS INTERNACIONALES</h2>
              <p>
                Sus datos pueden ser procesados en servidores ubicados fuera de Chile (por ejemplo, servicios 
                de nube en Estados Unidos o Europa). En tales casos, nos aseguramos de que existan salvaguardas 
                apropiadas para proteger su información conforme a la legislación aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">11. CAMBIOS A ESTA POLÍTICA</h2>
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios 
                significativos publicando la nueva política en esta página y, cuando sea apropiado, enviándole 
                un correo electrónico. Le recomendamos revisar esta página regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">12. CONTACTO</h2>
              <p>
                Si tiene preguntas sobre esta Política de Privacidad o sobre cómo manejamos sus datos personales, 
                puede contactarnos a:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>Email:</strong> <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">privacidad@appapacho.cl</a></li>
                <li><strong>Sitio web:</strong> www.appapacho.cl</li>
              </ul>
            </section>

            <section className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Esta Política de Privacidad se rige por las leyes de la República de Chile, en particular 
                por la Ley No. 19.628 sobre Protección de la Vida Privada.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/terminos" 
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
          >
            Ver Términos y Condiciones
          </Link>
        </div>
      </div>
    </div>
  )
}
