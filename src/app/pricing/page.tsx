'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button, Card } from '@/components/ui';
import Link from 'next/link';
import { Check, Shield, Server, Lock, Headphones, Palette, Crown, ArrowRight, DollarSign, Calendar, Wallet, BadgeCheck } from 'lucide-react';

const HOLD_DIAS = 7;
const FRECUENCIA_PAGO = 'semanal';
const MIN_RETIRO = '$20.000';
const EMAIL_SOPORTE = 'soporte@apapacho.com';

export default function TarifasPage() {
  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Tarifas simples para <span className="gradient-text">creadores en Chile</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Tú cobras. Nosotros cobramos una comisión clara.<br />
              Sin costos ocultos y con herramientas pro de personalización: temas, colores, música desde YouTube, favoritos y más.
            </p>
          </div>

          {/* Comisiones destacadas */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <Card variant="solid" className="p-8 text-center border-2 border-white/10">
              <div className="text-5xl font-bold gradient-text mb-3">10%</div>
              <h3 className="text-2xl font-bold text-white mb-2">Creador Estándar</h3>
              <p className="text-white/60">Comisión por transacción</p>
            </Card>
            <Card variant="solid" className="p-8 text-center border-2 border-fuchsia-500/50 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <Crown className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div className="text-5xl font-bold text-fuchsia-400 mb-3">7%</div>
              <h3 className="text-2xl font-bold text-white mb-2">Creador VIP</h3>
              <p className="text-white/60">Comisión reducida</p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
                Crear cuenta de creador
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#vip-requirements">
              <Button size="lg" variant="outline">
                Ver requisitos VIP
              </Button>
            </a>
          </div>
        </div>

        {/* ¿Qué incluye la comisión? */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            ¿Qué incluye la comisión?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="solid" className="p-6">
              <Server className="w-10 h-10 text-fuchsia-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Infraestructura de contenido</h3>
              <p className="text-white/60 text-sm">Hosting y entrega rápida de tu contenido a todos tus fans</p>
            </Card>
            <Card variant="solid" className="p-6">
              <DollarSign className="w-10 h-10 text-fuchsia-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Procesamiento de pagos</h3>
              <p className="text-white/60 text-sm">Integración y operación de pasarelas de pago seguras</p>
            </Card>
            <Card variant="solid" className="p-6">
              <Shield className="w-10 h-10 text-fuchsia-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Seguridad y antifraude</h3>
              <p className="text-white/60 text-sm">Monitoreo constante y protección contra fraudes</p>
            </Card>
            <Card variant="solid" className="p-6">
              <Headphones className="w-10 h-10 text-fuchsia-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Soporte a creadores</h3>
              <p className="text-white/60 text-sm">Asistencia técnica y ayuda cuando la necesites</p>
            </Card>
            <Card variant="solid" className="p-6 md:col-span-2 lg:col-span-2">
              <Palette className="w-10 h-10 text-fuchsia-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Herramientas de producto</h3>
              <p className="text-white/60 text-sm">Personalización del perfil, música, favoritos, contenido bloqueable (PPV), propinas y suscripciones</p>
            </Card>
          </div>
        </div>

        {/* Planes */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Elige tu plan
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Estándar */}
            <Card variant="solid" className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Creador Estándar</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold gradient-text">10%</span>
                  <span className="text-white/60">de comisión</span>
                </div>
                <p className="text-white/70">Para todos los creadores que ingresan a Apapacho</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Perfil totalmente personalizable</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Música de YouTube (hasta 3 tracks)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Suscripciones mensuales</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Contenido pay-per-view (PPV)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Propinas de fans</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Analíticas básicas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Pagos {FRECUENCIA_PAGO}s</span>
                </li>
              </ul>

              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">Empezar gratis</Button>
              </Link>
            </Card>

            {/* VIP */}
            <Card variant="solid" className="p-8 border-2 border-fuchsia-500/50 relative">
              <div className="absolute -top-3 right-6">
                <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  VIP
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-white">Creador VIP</h3>
                  <Crown className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-fuchsia-400">7%</span>
                  <span className="text-white/60">de comisión</span>
                </div>
                <p className="text-white/70">Para creadores establecidos con alto desempeño</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 font-medium">Todo lo de Estándar, más:</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80"><strong>3% de comisión menos</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Insignia VIP en tu perfil</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Aparición destacada en explorar</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Soporte prioritario</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Analíticas avanzadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">Acceso anticipado a funciones</span>
                </li>
              </ul>

              <a href="#vip-requirements" className="block">
                <Button className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
                  Ver requisitos
                </Button>
              </a>
            </Card>
          </div>
        </div>

        {/* Ejemplos de cálculo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Ejemplos de cálculo
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Ejemplo Estándar */}
            <Card variant="solid" className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Creador Estándar (10%)</h3>
              <div className="space-y-3 text-white/80">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Ingreso bruto del mes:</span>
                  <span className="font-semibold">$500.000 CLP</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Comisión Apapacho (10%):</span>
                  <span className="text-red-400">- $50.000 CLP</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Recibes neto:</span>
                  <span className="text-green-400">$450.000 CLP</span>
                </div>
              </div>
            </Card>

            {/* Ejemplo VIP */}
            <Card variant="solid" className="p-6 border-2 border-fuchsia-500/30">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-bold text-white">Creador VIP (7%)</h3>
                <Crown className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div className="space-y-3 text-white/80">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Ingreso bruto del mes:</span>
                  <span className="font-semibold">$500.000 CLP</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Comisión Apapacho (7%):</span>
                  <span className="text-red-400">- $35.000 CLP</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Recibes neto:</span>
                  <span className="text-green-400">$465.000 CLP</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg">
                <p className="text-sm text-fuchsia-300 font-medium">
                  💰 Ahorras $15.000 CLP extra cada mes con VIP
                </p>
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Todos los ejemplos son en pesos chilenos (CLP). Comisión se aplica sobre cada transacción.
            </p>
          </div>
        </div>

        {/* Pagos a creadores */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Cómo y cuándo recibes tus pagos
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card variant="solid" className="p-6 text-center">
              <Calendar className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Frecuencia</h3>
              <p className="text-white/70">Pagos {FRECUENCIA_PAGO}s automáticos</p>
            </Card>
            <Card variant="solid" className="p-6 text-center">
              <Lock className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Período de retención</h3>
              <p className="text-white/70">{HOLD_DIAS} días desde cada venta</p>
            </Card>
            <Card variant="solid" className="p-6 text-center">
              <Wallet className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Mínimo de retiro</h3>
              <p className="text-white/70">{MIN_RETIRO} CLP</p>
            </Card>
          </div>

          <Card variant="solid" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Detalles importantes</h3>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Retención de {HOLD_DIAS} días:</strong> Cada transacción se retiene {HOLD_DIAS} días para protección contra devoluciones y fraudes.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Pagos automáticos {FRECUENCIA_PAGO}s:</strong> Transferimos tu saldo disponible cada semana a tu cuenta bancaria o método de pago configurado.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Saldo mínimo:</strong> Necesitas al menos {MIN_RETIRO} CLP acumulados para recibir el pago (si no lo alcanzas, se suma a la siguiente semana).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Métodos de pago:</strong> Transferencia bancaria (Chile), PayPal, u otros procesadores según región.
                </div>
              </li>
            </ul>
          </Card>
        </div>

        {/* Cómo ser VIP */}
        <div id="vip-requirements" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <Crown className="w-16 h-16 text-fuchsia-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Cómo convertirme en creador VIP?
            </h2>
            <p className="text-xl text-white/70">
              Requisitos para acceder a la tarifa reducida del 7%
            </p>
          </div>

          <Card variant="solid" className="p-8 border-2 border-fuchsia-500/30">
            <h3 className="text-2xl font-bold text-white mb-6">Requisitos VIP</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                <BadgeCheck className="w-6 h-6 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Ingresos consistentes</h4>
                  <p className="text-white/70">Mínimo $1.500.000 CLP/mes de ingresos brutos durante 3 meses consecutivos</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                <BadgeCheck className="w-6 h-6 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Base de fans activa</h4>
                  <p className="text-white/70">Al menos 500 suscriptores activos o 1.000+ fans recurrentes</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                <BadgeCheck className="w-6 h-6 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Cuenta en regla</h4>
                  <p className="text-white/70">Sin infracciones a nuestros términos de servicio</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                <BadgeCheck className="w-6 h-6 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Perfil completado</h4>
                  <p className="text-white/70">Perfil 100% completo (foto, descripción, contenido regular)</p>
                </div>
              </div>
            </div>

            <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-fuchsia-400" />
                Proceso de solicitud
              </h4>
              <p className="text-white/80 mb-4">
                Si cumples los requisitos, puedes solicitar el estatus VIP desde tu panel de creador. 
                Revisamos manualmente cada solicitud y respondemos en 3-5 días hábiles.
              </p>
              <p className="text-sm text-white/60">
                Una vez aprobado, la tarifa del 7% se aplica automáticamente a todas tus nuevas transacciones.
              </p>
            </div>
          </Card>
        </div>

        {/* Para fans */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
            ¿Qué pagan los fans?
          </h2>
          <Card variant="solid" className="p-8">
            <p className="text-xl text-white/80 mb-6 text-center">
              <strong className="text-white">Los fans solo pagan lo que elijan:</strong> el precio de suscripción, el contenido PPV o las propinas que decidan dar.
            </p>
            <ul className="space-y-3 text-white/80 max-w-2xl mx-auto">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><strong>Sin cargos ocultos:</strong> El fan ve siempre el precio final antes de pagar</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><strong>La comisión la absorbe el creador:</strong> Los porcentajes (10% o 7%) se descuentan del ingreso del creador, no del pago del fan</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><strong>Navegación gratuita:</strong> Explorar perfiles, ver muestras y agregar favoritos es 100% gratis</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <Card variant="solid" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Hay cuota mensual o costo de inscripción?
              </h3>
              <p className="text-white/70">
                No. Apapacho es 100% gratuito para empezar como creador. Solo cobramos el porcentaje (10% o 7%) sobre cada transacción exitosa que realices. Si no vendes nada, no pagas nada.
              </p>
            </Card>

            <Card variant="solid" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Cuándo veo el dinero en mi cuenta?
              </h3>
              <p className="text-white/70">
                Cada venta tiene un período de retención de {HOLD_DIAS} días. Después de eso, el dinero se suma a tu saldo disponible. Hacemos pagos {FRECUENCIA_PAGO}s automáticos cuando alcanzas el mínimo de {MIN_RETIRO} CLP.
              </p>
            </Card>

            <Card variant="solid" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Por qué retienen {HOLD_DIAS} días cada venta?
              </h3>
              <p className="text-white/70">
                Este período nos permite resolver posibles devoluciones de pago, fraudes o disputas antes de liberar los fondos. Es un estándar de la industria para proteger tanto a creadores como a la plataforma.
              </p>
            </Card>

            <Card variant="solid" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Si un fan cancela su suscripción, ¿pierdo el dinero?
              </h3>
              <p className="text-white/70">
                No. Una vez que pasa el período de retención de {HOLD_DIAS} días y el pago se confirma, el dinero es tuyo aunque el fan cancele después. Las suscripciones no son reembolsables una vez iniciado el período.
              </p>
            </Card>

            <Card variant="solid" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Puedo cambiar mis precios libremente?
              </h3>
              <p className="text-white/70">
                Sí. Tú decides el precio de tus suscripciones, contenido PPV y mínimo de propinas. Puedes modificarlos cuando quieras desde tu panel de creador. Los cambios aplican para nuevas transacciones (no afectan suscripciones activas).
              </p>
            </Card>

            <Card variant="solid" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Qué pasa si pierdo mi estatus VIP?
              </h3>
              <p className="text-white/70">
                Si tus ingresos caen bajo el mínimo por 2 meses consecutivos, podemos revertir tu cuenta a Estándar (10%). Te avisaremos con anticipación y siempre podrás volver a solicitarlo cuando cumplas los requisitos nuevamente.
              </p>
            </Card>

            <Card variant="solid" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Puedo ver cuánto he ganado en tiempo real?
              </h3>
              <p className="text-white/70">
                Sí. Tu panel de creador muestra estadísticas en vivo: ingresos brutos, comisiones descontadas, saldo retenido y saldo disponible para retiro. Transparencia total.
              </p>
            </Card>

            <Card variant="solid" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Cobran por subir contenido o por almacenamiento?
              </h3>
              <p className="text-white/70">
                No. Subir fotos, videos y audio es ilimitado y gratuito. No cobramos por almacenamiento ni ancho de banda. La comisión solo se aplica cuando vendes contenido o recibes suscripciones/propinas.
              </p>
            </Card>

            <Card variant="solid" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Qué pasa si tengo un problema o necesito ayuda?
              </h3>
              <p className="text-white/70">
                Escríbenos a <a href={`mailto:${EMAIL_SOPORTE}`} className="text-fuchsia-400 hover:underline">{EMAIL_SOPORTE}</a> y nuestro equipo de soporte te responderá lo antes posible. Los creadores VIP tienen soporte prioritario con respuesta en menos de 24 horas.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Final */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="solid" className="p-12 text-center bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border-2 border-fuchsia-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Empieza a ganar hoy
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Únete a Apapacho y monetiza tu contenido sin costos iniciales. Solo pagas cuando ganas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
                  Crear cuenta gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href={`mailto:${EMAIL_SOPORTE}`}>
                <Button size="lg" variant="outline">
                  Contactar soporte
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
