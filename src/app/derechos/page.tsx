'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import {
  submitArcopRequest,
  listMyArcopRequests,
  ARCOP_TYPE_LABELS,
  ARCOP_STATUS_LABELS,
  type ArcopRightType,
  type ArcopRequestRecord,
} from '@/lib/api/legal'

interface RectifyField {
  key: string
  value: string
}

const RIGHT_DESCRIPTIONS: Record<ArcopRightType, string> = {
  ACCESS: 'Solicita una copia de los datos personales que tratamos sobre ti.',
  RECTIFICATION: 'Corrige datos inexactos, incompletos o desactualizados.',
  CANCELLATION: 'Solicita la eliminación de tus datos cuando ya no sean necesarios.',
  OPPOSITION: 'Opónte a un tratamiento específico (por ejemplo, marketing o perfilamiento).',
  PORTABILITY: 'Recibe tus datos en formato estructurado (ZIP con JSON + media).',
}

const ALL_RIGHTS: ArcopRightType[] = [
  'ACCESS',
  'RECTIFICATION',
  'CANCELLATION',
  'OPPOSITION',
  'PORTABILITY',
]

export default function DerechosPage() {
  const { user, token, isAuthenticated, hasHydrated } = useAuthStore()

  const [rightType, setRightType] = useState<ArcopRightType>('ACCESS')
  const [motive, setMotive] = useState('')
  const [rectifyFields, setRectifyFields] = useState<RectifyField[]>([
    { key: '', value: '' },
  ])
  const [notRobot, setNotRobot] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const [previousRequests, setPreviousRequests] = useState<ArcopRequestRecord[]>([])
  const [loadingPrevious, setLoadingPrevious] = useState(false)
  const [previousError, setPreviousError] = useState<string | null>(null)

  const loadPreviousRequests = useCallback(async () => {
    if (!isAuthenticated) return
    setLoadingPrevious(true)
    setPreviousError(null)
    try {
      const response = await listMyArcopRequests(token ?? undefined)
      setPreviousRequests(response.requests ?? [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar tu historial.'
      setPreviousError(message)
    } finally {
      setLoadingPrevious(false)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      loadPreviousRequests()
    }
  }, [hasHydrated, isAuthenticated, loadPreviousRequests])

  const updateRectifyField = (index: number, key: string, value: string) => {
    setRectifyFields((fields) => {
      const next = [...fields]
      next[index] = { key, value }
      return next
    })
  }

  const addRectifyField = () => {
    setRectifyFields((fields) => [...fields, { key: '', value: '' }])
  }

  const removeRectifyField = (index: number) => {
    setRectifyFields((fields) => fields.filter((_, i) => i !== index))
  }

  const buildDataToRectify = (): Record<string, string> | undefined => {
    if (rightType !== 'RECTIFICATION') return undefined
    const entries = rectifyFields
      .map((f) => [f.key.trim(), f.value.trim()] as [string, string])
      .filter(([k, v]) => k.length > 0 && v.length > 0)
    if (entries.length === 0) return undefined
    return Object.fromEntries(entries)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!isAuthenticated) {
      setSubmitError('Debes iniciar sesión para enviar una solicitud vinculada a tu cuenta.')
      return
    }

    if (!notRobot) {
      setSubmitError('Confirma que no eres un bot antes de enviar la solicitud.')
      return
    }

    if (rightType === 'RECTIFICATION') {
      const dataToRectify = buildDataToRectify()
      if (!dataToRectify) {
        setSubmitError('Indica al menos un campo a rectificar (clave y valor nuevo).')
        return
      }
    }

    setSubmitting(true)
    try {
      await submitArcopRequest(
        {
          type: rightType,
          motive: motive.trim() || undefined,
          dataToRectify: buildDataToRectify(),
        },
        token ?? undefined
      )

      setSubmitSuccess(
        'Tu solicitud fue recibida. Recibirás una respuesta dentro de 15 días hábiles en el correo asociado a tu cuenta.'
      )
      setMotive('')
      setRectifyFields([{ key: '', value: '' }])
      setNotRobot(false)
      await loadPreviousRequests()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar la solicitud.'
      setSubmitError(message)
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
            Ejercer mis derechos sobre datos personales
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Conforme a la Ley N° 19.628 y la Ley N° 21.719 — SLA de respuesta: 15 días hábiles
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">

            <section>
              <h2 className="text-xl font-semibold text-white mt-2 mb-4">¿Qué derechos puedes ejercer?</h2>
              <p>
                Como titular de datos personales, dispones de los derechos clásicos <strong>ARCO-P</strong> (Acceso,
                Rectificación, Cancelación, Oposición y Portabilidad), reforzados por la Ley N° 21.719 con derechos
                adicionales como la oposición al perfilamiento y a las decisiones automatizadas.
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                {ALL_RIGHTS.map((r) => (
                  <li key={r}>
                    <strong>{ARCOP_TYPE_LABELS[r]}:</strong> {RIGHT_DESCRIPTIONS[r]}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-gray-400">
                Responderemos a tu solicitud dentro de un plazo máximo de <strong>15 días hábiles</strong> contados
                desde su recepción.
              </p>
            </section>

            {/* Status: not authenticated */}
            {hasHydrated && !isAuthenticated && (
              <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                  Inicia sesión para ejercer tus derechos
                </h3>
                <p className="text-sm text-yellow-100/80">
                  Inicia sesión para ejercer tus derechos vinculados a tu cuenta. Para consultas sobre datos previos a
                  tu eliminación o sin cuenta, contacta directamente a{' '}
                  <a
                    href="mailto:privacidad@appapacho.cl"
                    className="text-yellow-200 hover:text-yellow-100 underline"
                  >
                    privacidad@appapacho.cl
                  </a>.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center mt-4 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors"
                >
                  Iniciar sesión
                </Link>
              </section>
            )}

            {/* Form (always visible, but disabled when not authenticated) */}
            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Formulario de solicitud</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="rightType" className="block text-sm font-medium text-gray-200 mb-2">
                    Tipo de derecho a ejercer
                  </label>
                  <select
                    id="rightType"
                    value={rightType}
                    onChange={(e) => setRightType(e.target.value as ArcopRightType)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    disabled={!isAuthenticated || submitting}
                  >
                    {ALL_RIGHTS.map((r) => (
                      <option key={r} value={r} className="bg-[#1a1a25]">
                        {ARCOP_TYPE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-400">{RIGHT_DESCRIPTIONS[rightType]}</p>
                </div>

                <div>
                  <label htmlFor="motive" className="block text-sm font-medium text-gray-200 mb-2">
                    Motivo (opcional)
                  </label>
                  <textarea
                    id="motive"
                    value={motive}
                    onChange={(e) => setMotive(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="Describe brevemente el motivo o contexto de tu solicitud."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    disabled={!isAuthenticated || submitting}
                  />
                </div>

                {rightType === 'RECTIFICATION' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Datos a rectificar
                    </label>
                    <p className="text-xs text-gray-400 mb-3">
                      Indica el nombre del campo (por ejemplo: <code className="text-fuchsia-300">email</code>,
                      {' '}<code className="text-fuchsia-300">displayName</code>) y el valor correcto.
                    </p>
                    <div className="space-y-2">
                      {rectifyFields.map((field, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Campo"
                            value={field.key}
                            onChange={(e) => updateRectifyField(idx, e.target.value, field.value)}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                            disabled={!isAuthenticated || submitting}
                          />
                          <input
                            type="text"
                            placeholder="Valor correcto"
                            value={field.value}
                            onChange={(e) => updateRectifyField(idx, field.key, e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                            disabled={!isAuthenticated || submitting}
                          />
                          {rectifyFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRectifyField(idx)}
                              className="px-3 py-2 text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg"
                              aria-label="Eliminar campo"
                              disabled={!isAuthenticated || submitting}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addRectifyField}
                      className="mt-2 text-sm text-fuchsia-400 hover:text-fuchsia-300"
                      disabled={!isAuthenticated || submitting}
                    >
                      + Añadir otro campo
                    </button>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notRobot}
                      onChange={(e) => setNotRobot(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500"
                      disabled={!isAuthenticated || submitting}
                    />
                    <span className="text-sm text-gray-300">
                      No soy un bot{' '}
                      <span className="text-xs text-gray-500">
                        (verificación reCAPTCHA pendiente de integración)
                      </span>
                    </span>
                  </label>
                </div>

                {submitError && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm">
                    {submitSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAuthenticated || submitting}
                  className="w-full px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-fuchsia-500/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  {submitting ? 'Enviando…' : 'Enviar solicitud'}
                </button>
              </form>
            </section>

            {/* Previous requests (only if logged in) */}
            {isAuthenticated && (
              <section>
                <h2 className="text-xl font-semibold text-white mt-8 mb-4">Mis solicitudes anteriores</h2>
                {loadingPrevious && (
                  <p className="text-sm text-gray-400">Cargando historial…</p>
                )}
                {previousError && (
                  <p className="text-sm text-red-300">{previousError}</p>
                )}
                {!loadingPrevious && !previousError && previousRequests.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Aún no has enviado ninguna solicitud{user?.username ? `, ${user.username}` : ''}.
                  </p>
                )}
                {previousRequests.length > 0 && (
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <table className="min-w-full text-sm border border-white/10 rounded-lg">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Tipo</th>
                          <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Estado</th>
                          <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Recibida</th>
                          <th className="px-3 py-2 text-left text-white font-semibold border-b border-white/10">Vence</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {previousRequests.map((req) => (
                          <tr key={req.id} className="border-b border-white/10 last:border-b-0">
                            <td className="px-3 py-2">{ARCOP_TYPE_LABELS[req.type]}</td>
                            <td className="px-3 py-2">{ARCOP_STATUS_LABELS[req.status]}</td>
                            <td className="px-3 py-2 text-xs">
                              {new Date(req.createdAt).toLocaleDateString('es-CL')}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {new Date(req.dueBy).toLocaleDateString('es-CL')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-sm text-gray-400 space-y-2">
            <p>
              <strong className="text-gray-200">Delegado de Protección de Datos (DPD):</strong>{' '}
              <a href="mailto:privacidad@appapacho.cl" className="text-fuchsia-400 hover:text-fuchsia-300">
                privacidad@appapacho.cl
              </a>
            </p>
            <p>
              Para conocer en detalle las finalidades, plazos de retención y bases de licitud, consulta nuestra{' '}
              <Link href="/privacidad" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                Política de Privacidad
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
