'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitDmcaNotice, type DmcaNoticeInput } from '@/lib/api/legal'

type IdType = DmcaNoticeInput['notifierIdType']

interface FormState {
  notifierName: string
  notifierEmail: string
  notifierIdType: IdType
  notifierIdNumber: string
  notifierAddress: string
  workDescription: string
  ownershipEvidence: string
  infringingUrlsRaw: string
  sworn: boolean
  acceptedTerms: boolean
}

const INITIAL_STATE: FormState = {
  notifierName: '',
  notifierEmail: '',
  notifierIdType: 'RUT',
  notifierIdNumber: '',
  notifierAddress: '',
  workDescription: '',
  ownershipEvidence: '',
  infringingUrlsRaw: '',
  sworn: false,
  acceptedTerms: false,
}

const ID_TYPE_LABELS: Record<IdType, string> = {
  RUT: 'RUT (Chile)',
  PASSPORT: 'Pasaporte',
  OTHER: 'Otro documento',
}

export default function DmcaPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ noticeId: string; sla: number } | null>(null)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const parseUrls = (raw: string): string[] => {
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Local validation
    const required: Array<[keyof FormState, string]> = [
      ['notifierName', 'Nombre del notificante'],
      ['notifierEmail', 'Email del notificante'],
      ['notifierIdNumber', 'Número de documento'],
      ['notifierAddress', 'Dirección'],
      ['workDescription', 'Descripción de la obra reclamada'],
      ['ownershipEvidence', 'Prueba de titularidad'],
    ]
    for (const [key, label] of required) {
      if (!String(form[key]).trim()) {
        setError(`Falta completar: ${label}.`)
        return
      }
    }

    const urls = parseUrls(form.infringingUrlsRaw)
    if (urls.length === 0) {
      setError('Debes indicar al menos una URL infractora.')
      return
    }

    if (!form.sworn || !form.acceptedTerms) {
      setError('Debes aceptar la declaración jurada y los términos para enviar la notificación.')
      return
    }

    setSubmitting(true)
    try {
      const response = await submitDmcaNotice({
        notifierName: form.notifierName.trim(),
        notifierEmail: form.notifierEmail.trim(),
        notifierIdType: form.notifierIdType,
        notifierIdNumber: form.notifierIdNumber.trim(),
        notifierAddress: form.notifierAddress.trim(),
        workDescription: form.workDescription.trim(),
        ownershipEvidence: form.ownershipEvidence.trim(),
        infringingUrls: urls,
        sworn: form.sworn,
        acceptedTerms: form.acceptedTerms,
      })

      setSuccess({ noticeId: response.noticeId, sla: response.estimatedSlaDays ?? 7 })
      setForm(INITIAL_STATE)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo enviar la notificación.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

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
            Notificación DMCA / Propiedad Intelectual
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Conforme a la Ley N° 17.336 (Chile) y al estándar internacional DMCA — SLA de respuesta: 7 días hábiles
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">

            <section>
              <h2 className="text-xl font-semibold text-white mt-2 mb-4">Antes de enviar tu notificación</h2>
              <p>
                Si consideras que un contenido publicado en Apapacho infringe tus derechos de propiedad intelectual o de
                imagen, completa el siguiente formulario. Procesaremos tu notificación dentro de un plazo máximo de
                {' '}<strong>7 días hábiles</strong>.
              </p>
              <p className="mt-4">
                Las notificaciones <strong>maliciosas o falsas</strong> pueden generar responsabilidad civil y penal
                para el notificante. Verifica que la información proporcionada es verídica y que efectivamente eres
                titular de los derechos reclamados o estás autorizado a actuar en nombre del titular.
              </p>
            </section>

            {success ? (
              <section className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-300 mb-3">
                  Notificación recibida
                </h3>
                <p className="text-sm text-green-100/90">
                  Hemos recibido tu notificación con identificador{' '}
                  <code className="font-mono text-green-200 bg-green-500/20 px-1.5 py-0.5 rounded">
                    {success.noticeId}
                  </code>
                  . Te responderemos al correo indicado dentro de los próximos {success.sla} días hábiles.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(null)}
                  className="mt-4 inline-flex items-center justify-center px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black font-medium rounded-lg transition-colors"
                >
                  Enviar otra notificación
                </button>
              </section>
            ) : (
              <section>
                <h2 className="text-xl font-semibold text-white mt-8 mb-4">Formulario de notificación</h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Notifier */}
                  <fieldset className="border border-white/10 rounded-xl p-5">
                    <legend className="px-2 text-sm font-semibold text-fuchsia-300">
                      1. Datos del notificante
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label htmlFor="notifierName" className="block text-sm font-medium text-gray-200 mb-1">
                          Nombre completo *
                        </label>
                        <input
                          id="notifierName"
                          type="text"
                          value={form.notifierName}
                          onChange={(e) => update('notifierName', e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="notifierEmail" className="block text-sm font-medium text-gray-200 mb-1">
                          Email *
                        </label>
                        <input
                          id="notifierEmail"
                          type="email"
                          value={form.notifierEmail}
                          onChange={(e) => update('notifierEmail', e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="notifierIdType" className="block text-sm font-medium text-gray-200 mb-1">
                          Tipo de documento *
                        </label>
                        <select
                          id="notifierIdType"
                          value={form.notifierIdType}
                          onChange={(e) => update('notifierIdType', e.target.value as IdType)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        >
                          {(Object.keys(ID_TYPE_LABELS) as IdType[]).map((t) => (
                            <option key={t} value={t} className="bg-[#1a1a25]">
                              {ID_TYPE_LABELS[t]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="notifierIdNumber" className="block text-sm font-medium text-gray-200 mb-1">
                          Número de documento *
                        </label>
                        <input
                          id="notifierIdNumber"
                          type="text"
                          value={form.notifierIdNumber}
                          onChange={(e) => update('notifierIdNumber', e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="notifierAddress" className="block text-sm font-medium text-gray-200 mb-1">
                          Dirección *
                        </label>
                        <input
                          id="notifierAddress"
                          type="text"
                          value={form.notifierAddress}
                          onChange={(e) => update('notifierAddress', e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Work claimed */}
                  <fieldset className="border border-white/10 rounded-xl p-5">
                    <legend className="px-2 text-sm font-semibold text-fuchsia-300">
                      2. Obra reclamada (titularidad)
                    </legend>
                    <div className="space-y-4 mt-2">
                      <div>
                        <label htmlFor="workDescription" className="block text-sm font-medium text-gray-200 mb-1">
                          Descripción de la obra *
                        </label>
                        <textarea
                          id="workDescription"
                          value={form.workDescription}
                          onChange={(e) => update('workDescription', e.target.value)}
                          rows={3}
                          required
                          maxLength={2000}
                          placeholder="Describe la obra original sobre la que reclamas titularidad."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="ownershipEvidence" className="block text-sm font-medium text-gray-200 mb-1">
                          Prueba de titularidad *
                        </label>
                        <textarea
                          id="ownershipEvidence"
                          value={form.ownershipEvidence}
                          onChange={(e) => update('ownershipEvidence', e.target.value)}
                          rows={3}
                          required
                          maxLength={2000}
                          placeholder="Indica enlaces a registros, contratos, publicaciones originales u otra prueba de titularidad."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Infringing URLs */}
                  <fieldset className="border border-white/10 rounded-xl p-5">
                    <legend className="px-2 text-sm font-semibold text-fuchsia-300">
                      3. URLs infractoras
                    </legend>
                    <label htmlFor="infringingUrls" className="block text-sm font-medium text-gray-200 mb-1">
                      Una URL por línea *
                    </label>
                    <textarea
                      id="infringingUrls"
                      value={form.infringingUrlsRaw}
                      onChange={(e) => update('infringingUrlsRaw', e.target.value)}
                      rows={4}
                      required
                      placeholder={'https://www.appapacho.cl/usuario/post/123\nhttps://www.appapacho.cl/usuario/post/456'}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-mono text-sm"
                    />
                  </fieldset>

                  {/* Declarations */}
                  <fieldset className="border border-white/10 rounded-xl p-5">
                    <legend className="px-2 text-sm font-semibold text-fuchsia-300">
                      4. Declaraciones
                    </legend>
                    <div className="space-y-3 mt-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.sworn}
                          onChange={(e) => update('sworn', e.target.checked)}
                          required
                          className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500"
                        />
                        <span className="text-sm text-gray-200">
                          Declaro <strong>bajo juramento</strong> que la información proporcionada es verídica y que soy
                          titular de los derechos sobre la obra reclamada o estoy autorizado a actuar en nombre del
                          titular.
                        </span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.acceptedTerms}
                          onChange={(e) => update('acceptedTerms', e.target.checked)}
                          required
                          className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500"
                        />
                        <span className="text-sm text-gray-200">
                          Acepto los{' '}
                          <Link
                            href="/terminos"
                            target="_blank"
                            className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                          >
                            Términos y Condiciones
                          </Link>{' '}
                          de Apapacho aplicables a notificaciones DMCA, y reconozco que el envío fraudulento de esta
                          notificación puede generar responsabilidad civil y penal.
                        </span>
                      </label>
                    </div>
                  </fieldset>

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-fuchsia-500/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                  >
                    {submitting ? 'Enviando…' : 'Enviar notificación DMCA'}
                  </button>
                </form>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Counter-notice (notificación de oposición)</h2>
              <p>
                Si tu contenido fue removido por error o consideras que la notificación recibida es infundada, puedes
                enviar una <strong>notificación de oposición</strong> (counter-notice) escribiendo a{' '}
                <a href="mailto:dmca@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                  dmca@appapacho.cl
                </a>{' '}
                con los antecedentes que respalden tu titularidad o autorización. Procesaremos la oposición conforme al
                mismo SLA de 7 días hábiles.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-sm text-gray-400 space-y-2">
            <p>
              <strong className="text-gray-200">Contacto DMCA / propiedad intelectual:</strong>{' '}
              <a href="mailto:dmca@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                dmca@appapacho.cl
              </a>
            </p>
            <p>
              Apapacho SpA — [Apapacho SpA — RUT por completar] — domicilio en [A completar], Chile. Las controversias
              se rigen por la legislación chilena.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
