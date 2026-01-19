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
          <h1 className="text-3xl font-bold text-white mb-8">
            Términos y Condiciones de Uso
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <p className="text-sm text-gray-400">
              Última actualización: 26 de diciembre de 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. GENERALIDADES</h2>
              <p>
                El presente documento regula los términos y condiciones generales aplicables al acceso y uso que el Usuario 
                realizará del Sitio Web: www.appapacho.cl (en adelante "Appapacho", "www.appapacho.cl", o "el sitio web" 
                indistintamente), así como a cualquier tipo de información, contenido, imagen, video, audio y otro material 
                comunicado o presente en el sitio web, así como todo servicio ofrecido por Appapacho.
              </p>
              <p className="mt-4">
                Appapacho es un sitio web que facilita a los profesionales, aficionados, artistas o creadores de contenido, 
                un lugar donde fundar su propia comunidad de seguidores, subir imágenes, videos y archivos, y generar ingresos 
                por medio de la venta de contenido digital y de suscripciones a su perfil.
              </p>
              <p className="mt-4">
                El acceso y uso del sitio web y del contenido relacionado o anexo, se regirá íntegramente por las leyes de 
                la República de Chile. De particular importancia resultan la aplicación de la Ley No. 19.628 de Protección 
                de Datos Personales y la Ley No. 19.496 sobre Derechos del Consumidor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. REGISTRO DE USUARIO</h2>
              <p>
                Será requisito necesario para el uso del sitio web la aceptación de los presentes Términos y Condiciones 
                al momento del registro por parte del Usuario. Adicionalmente, el Usuario deberá designar una clave o 
                contraseña de acceso.
              </p>
              <p className="mt-4">
                Se entenderán conocidos y aceptados estos Términos y Condiciones por el sólo hecho de registrarse el Usuario, 
                acto en el cual se incluirá una manifestación expresa del Usuario sobre el conocimiento de las presentes 
                condiciones de uso.
              </p>
              <p className="mt-4">
                Una vez registrado, el Usuario tendrá a su disposición un nombre de usuario y una contraseña o clave secreta, 
                por medio de los cuales podrá ingresar al Sitio Web y tener acceso a sus contenidos, así como un acceso 
                personalizado, confidencial y seguro.
              </p>
              <p className="mt-4">
                El Usuario asume totalmente su responsabilidad por el mantenimiento de la confidencialidad de su contraseña 
                o clave secreta registrada en el Sitio Web. Dicha contraseña o clave secreta es de uso personal, por lo que 
                su entrega voluntaria a terceros por parte del Usuario no conlleva responsabilidad alguna por parte de Appapacho.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. RESPONSABILIDAD DE LOS USUARIOS</h2>
              <p>
                Appapacho entrega al Usuario un servicio caracterizado por la diversidad del contenido proporcionado. 
                El Usuario asume su responsabilidad al ingresar al Sitio Web, para realizar un correcto uso de este y 
                sus contenidos. Así, esta responsabilidad se extenderá a:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  Usar la información, los contenidos y/o servicios y datos ofrecidos por Appapacho, sin que sea contrario 
                  a estos Términos y condiciones, así como al Ordenamiento Jurídico Chileno, la Moral y el Orden Público.
                </li>
                <li>
                  La veracidad y licitud de los datos e información aportados por el usuario en los formularios de registro 
                  presentes en el Sitio Web.
                </li>
                <li>
                  Notificar de forma inmediata a Appapacho acerca de cualquier hecho relacionado con el uso indebido de 
                  información registrada, tales como robo, hurto, extravío, acceso no autorizado a identificadores y/o contraseñas.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. CAPACIDAD LEGAL</h2>
              <p>
                El Usuario declara ser mayor de edad, por tanto, tener capacidad legal necesaria y suficiente para vincularse 
                por los presentes Términos y condiciones. Por lo tanto, Appapacho no se dirige a menores de edad, declinando 
                cualquier responsabilidad por el incumplimiento de este requisito.
              </p>
              <p className="mt-4">
                En Appapacho los Creadores pueden ofrecer contenido no apto para menores de edad, por lo que usted, como usuario, 
                declara y garantiza tener 18 años o la mayoría de edad correspondiente a su país de origen para registrarse 
                y usar el sitio web como Creador y formar parte de un contrato vinculante con Appapacho.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. FUNCIONAMIENTO DEL SITIO</h2>
              <p>
                Appapacho es una red social de pago, un sitio web de venta de contenido digital y debe ser utilizada únicamente 
                para este fin. Para convertirse en usuario, debe registrarse proporcionando una dirección de correo válida, 
                un nombre de usuario y una contraseña. Es una condición de uso del sitio web que toda la información suministrada 
                sea correcta, verídica, actual y completa.
              </p>
              <p className="mt-4">
                La suscripción da acceso al "Contenido Exclusivo" subido anteriormente por el creador o la creadora al sitio web, 
                y a todo el contenido que suba en el futuro hasta la fecha de caducidad de la suscripción. Esto no obliga al 
                creador a subir más contenido.
              </p>
              <p className="mt-4">
                El creador acepta dar acceso a todo el "Contenido Exclusivo" nuevo o recientemente publicado a todos los usuarios 
                que mantengan suscripciones activas a su perfil de creador al momento de la publicación del nuevo contenido.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. PAGOS Y RETIROS</h2>
              <p>
                El creador podrá solicitar el retiro de sus ganancias cuando desee, directamente desde su menú de usuario. 
                Los pagos se realizarán mediante transferencia bancaria u otros medios de pago disponibles en la plataforma.
              </p>
              <p className="mt-4">
                Appapacho declara cumplir con todas las obligaciones tributarias que se devenguen por la prestación de los 
                servicios incluidos en el sitio web. No es responsabilidad ni obligación de Appapacho el pago de los impuestos 
                con cargo a las utilidades que los y las creadoras puedan obtener por sus ventas a través del sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. USOS PROHIBIDOS</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>El uso de fotos de contenido sexual explícito como imágenes de perfil y/o imagen de portada.</li>
                <li>La publicación de números de teléfono o de contacto directo en publicaciones o biografía.</li>
                <li>La incitación o invitación a adquirir contenido fuera del sitio web.</li>
                <li>La publicación de comentarios o mensajes de hostigamiento, difamatorios, discriminatorios de cualquier tipo.</li>
                <li>La realización de publicaciones ajenas a la finalidad y función principal de Appapacho.</li>
                <li>La extracción de contenido de cualquier forma desde el sitio web.</li>
                <li>Hacer mal uso de la herramienta de reportes de usuarios o publicaciones.</li>
                <li>La publicación y/o venta de contenido de terceras personas sin su consentimiento.</li>
                <li>Publicar contenido ilegal, incluyendo pero no limitado a: pornografía infantil, contenido que infrinja derechos de autor.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. DERECHOS DEL USUARIO</h2>
              <p>
                El Usuario gozará de todos los derechos que le reconoce la legislación sobre protección al consumidor vigente 
                en Chile, adicionalmente a los derechos que le otorgan estos Términos y Condiciones. El Usuario dispondrá en 
                todo momento de los derechos de información, rectificación y cancelación de los datos personales conforme a 
                lo dispuesto por la Ley No. 19.628 sobre Protección de Datos Personales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. LIMITACIÓN DE RESPONSABILIDAD</h2>
              <p>
                Appapacho no responderá por:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Uso indebido que Usuarios realicen del contenido almacenado.</li>
                <li>Daños y perjuicios causados a Usuarios derivados del funcionamiento de las herramientas de búsqueda.</li>
                <li>Contenido de los Sitios Web a las que los Usuarios puedan acceder sin autorización.</li>
                <li>Pérdida, mal uso o uso no autorizado de contraseñas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. PROTECCIÓN DE DATOS PERSONALES</h2>
              <p>
                En conformidad con lo establecido en la Ley No. 19.628 sobre la Protección de Datos Personales, los datos 
                que se suministren al Sitio Web, pasan a formar parte de una base de datos perteneciente a Appapacho y serán 
                destinados exclusivamente para los fines que motivaron su entrega. Estos datos nunca serán comunicados o 
                compartidos con otras empresas sin expresa autorización de su titular.
              </p>
              <p className="mt-4">
                Appapacho garantiza a todos sus Usuarios el libre ejercicio de los derechos contemplados en la Ley No. 19.628 
                sobre la Protección de Datos Personales en lo relativo a la información, modificación, cancelación y bloqueo 
                de sus datos personales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">11. PROPIEDAD INTELECTUAL</h2>
              <p>
                Los derechos presentes en el Sitio Web, incluyendo la Propiedad Intelectual respecto al mismo Sitio Web, 
                páginas y otro tipo de contenido (textos, material gráfico o audiovisual, logos, íconos, material descargable, 
                códigos fuente) son de propiedad de Appapacho.
              </p>
              <p className="mt-4">
                El contenido subido por los creadores es de su propiedad y ellos son responsables de tener los derechos 
                necesarios para su publicación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">12. LEY APLICABLE</h2>
              <p>
                Estos Términos y Condiciones se rigen por las leyes de la República de Chile. El Usuario fija su domicilio 
                en Chile y se somete a la jurisdicción de sus tribunales de justicia.
              </p>
              <p className="mt-4">
                Es de completa responsabilidad del usuario leer estos términos antes de hacer uso del sitio web. El usuario 
                acepta en completa conformidad los acuerdos pactados en estos términos al momento de registrarse en Appapacho 
                y hacer uso de este.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">13. CONTACTO</h2>
              <p>
                Para cualquier tipo de comunicación, consulta o reclamo relacionado con el uso o funcionamiento del Sitio Web, 
                puede contactarnos a través del correo electrónico: <span className="text-fuchsia-400">contacto@appapacho.cl</span>
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
