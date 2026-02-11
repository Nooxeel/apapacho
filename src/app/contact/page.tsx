'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Mail, MessageCircle, Send, ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '56912345678' // Número de WhatsApp de contacto
const CONTACT_EMAIL = 'contacto@appapacho.cl'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const subjects: Record<string, string> = {
    general: 'Consulta general',
    support: 'Soporte técnico',
    payments: 'Pagos y facturación',
    creator: 'Quiero ser creador/a',
    report: 'Reportar un problema',
    business: 'Alianzas comerciales',
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Por favor completa todos los campos requeridos.')
      setStatus('error')
      return
    }

    setStatus('sending')
    setErrorMessage('')

    try {
      // Enviar por mailto como fallback (se puede conectar a un backend o servicio como Resend)
      const mailtoSubject = encodeURIComponent(`[Appapacho] ${subjects[formData.subject]} - ${formData.name}`)
      const mailtoBody = encodeURIComponent(
        `Nombre: ${formData.name}\nEmail: ${formData.email}\nAsunto: ${subjects[formData.subject]}\n\nMensaje:\n${formData.message}`
      )
      
      window.open(`mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`, '_self')
      
      setStatus('success')
      setFormData({ name: '', email: '', subject: 'general', message: '' })
    } catch {
      setStatus('error')
      setErrorMessage('Hubo un error al enviar el mensaje. Intenta de nuevo o contáctanos por WhatsApp.')
    }
  }

  const openWhatsApp = () => {
    const text = encodeURIComponent('¡Hola! Me gustaría contactar con el equipo de Appapacho.')
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contáctanos
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ti.
            Elige el canal que prefieras.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Email card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-fuchsia-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Correo electrónico</h3>
                <p className="text-white/50 text-sm">Respuesta en 24-48 horas</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Escríbenos para consultas detalladas, soporte técnico o temas comerciales.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium transition-colors underline decoration-fuchsia-400/30 hover:decoration-fuchsia-300"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* WhatsApp card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">WhatsApp</h3>
                <p className="text-white/50 text-sm">Respuesta inmediata</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Para consultas rápidas o si necesitas ayuda urgente, escríbenos por WhatsApp.
            </p>
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Abrir WhatsApp
            </button>
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-2">Envíanos un mensaje</h2>
          <p className="text-white/50 text-sm mb-8">
            Completa el formulario y te responderemos lo antes posible.
          </p>

          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">
                ¡Mensaje preparado! Se abrirá tu cliente de correo para enviarlo. Si no se abrió,{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-medium">
                  haz clic aquí
                </a>.
              </p>
            </div>
          )}

          {status === 'error' && errorMessage && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                  Nombre <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/25 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Correo electrónico <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/25 transition-colors"
                />
              </div>
            </div>

            {/* Asunto */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                Asunto
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/25 transition-colors [&>option]:bg-[#1a1a2e] [&>option]:text-white"
              >
                {Object.entries(subjects).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mensaje */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                Mensaje <span className="text-fuchsia-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Cuéntanos en qué podemos ayudarte..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/25 transition-colors resize-none"
              />
            </div>

            {/* Submit button */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
                {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
              <span className="text-white/40 text-xs">
                Se abrirá tu cliente de correo para enviar el mensaje.
              </span>
            </div>
          </form>
        </div>

        {/* Horarios */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-fuchsia-400" />
            <h3 className="text-white font-semibold">Horarios de atención</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/80 font-medium">Lunes a Viernes</p>
              <p className="text-white/50">9:00 - 18:00 hrs (Chile)</p>
            </div>
            <div>
              <p className="text-white/80 font-medium">Sábado y Domingo</p>
              <p className="text-white/50">Solo WhatsApp — respuesta en el siguiente día hábil</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
