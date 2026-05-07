'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import {
  ARCOP_TYPE_LABELS,
  completeArcopRequest,
  getArcopDetail,
  rejectArcopRequest,
  startArcopRequest,
  type AdminArcopDetail,
} from '@/lib/api/legal'

export default function AdminArcopDetailPage() {
  const params = useParams<{ id: string }>()
  const { token } = useAuthStore()
  const id = params?.id

  const [detail, setDetail] = useState<AdminArcopDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [completeNotes, setCompleteNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const result = await getArcopDetail(id, token ?? undefined)
      setDetail(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la solicitud')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    load()
  }, [load])

  const handleStart = async () => {
    if (!id) return
    setSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      await startArcopRequest(id, token ?? undefined)
      setActionSuccess('Solicitud marcada como En proceso.')
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al iniciar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      await completeArcopRequest(
        id,
        {
          attachmentUrl: attachmentUrl.trim() || undefined,
          notes: completeNotes.trim() || undefined,
        },
        token ?? undefined
      )
      setActionSuccess('Solicitud completada y notificada al usuario.')
      setAttachmentUrl('')
      setCompleteNotes('')
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al completar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    if (rejectionReason.trim().length < 3) {
      setActionError('Indica un motivo de rechazo (mínimo 3 caracteres).')
      return
    }
    setSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      await rejectArcopRequest(id, rejectionReason.trim(), token ?? undefined)
      setActionSuccess('Solicitud rechazada y notificada al usuario.')
      setRejectionReason('')
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al rechazar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/admin/legal/arcop"
        className="inline-flex items-center text-white/60 hover:text-white text-sm mb-6"
      >
        ← Volver a la cola
      </Link>

      {loading && <p className="text-white/50 mt-8">Cargando…</p>}
      {error && (
        <p className="text-red-400 mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </p>
      )}

      {!loading && !error && detail && (
        <>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">
                Solicitud {ARCOP_TYPE_LABELS[detail.type]}
              </h1>
              <p className="text-white/50 text-xs font-mono mt-1">{detail.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={detail.status} />
              {detail.isOverdue && (
                <span className="text-xs px-2 py-1 rounded-md bg-red-500/20 text-red-300">
                  +{detail.hoursOverdue}h vencida
                </span>
              )}
            </div>
          </div>

          <section className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
              Datos del usuario
            </h2>
            <dl className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
              <Row label="Nombre">{detail.user.displayName}</Row>
              <Row label="Username">@{detail.user.username}</Row>
              <Row label="Email">{detail.user.email}</Row>
              <Row label="Cuenta creada">
                {new Date(detail.user.createdAt).toLocaleDateString('es-CL')}
              </Row>
              <Row label="Es creador">{detail.user.isCreator ? 'Sí' : 'No'}</Row>
            </dl>
          </section>

          <section className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
              Detalles de la solicitud
            </h2>
            <dl className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
              <Row label="Tipo">{ARCOP_TYPE_LABELS[detail.type]}</Row>
              <Row label="Recibida">
                {new Date(detail.requestedAt).toLocaleString('es-CL')}
              </Row>
              <Row label="Vence">
                {new Date(detail.dueBy).toLocaleString('es-CL')}
              </Row>
              <Row label="IP">{detail.ipAddress ?? '—'}</Row>
            </dl>
            {detail.motive && (
              <div className="mt-4">
                <div className="text-xs uppercase text-white/40 mb-1">Motivo</div>
                <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {detail.motive}
                </pre>
              </div>
            )}
            {detail.dataToRectify && (
              <div className="mt-4">
                <div className="text-xs uppercase text-white/40 mb-1">Datos a rectificar</div>
                <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono">
                  {JSON.stringify(detail.dataToRectify, null, 2)}
                </pre>
              </div>
            )}
            {detail.rejectionReason && (
              <div className="mt-4">
                <div className="text-xs uppercase text-white/40 mb-1">Motivo de rechazo</div>
                <pre className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {detail.rejectionReason}
                </pre>
              </div>
            )}
            {detail.attachmentUrl && (
              <div className="mt-4">
                <div className="text-xs uppercase text-white/40 mb-1">Adjunto entregado</div>
                <a
                  href={detail.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fuchsia-400 hover:text-fuchsia-300 underline break-all text-sm"
                >
                  {detail.attachmentUrl}
                </a>
                {detail.attachmentExpiresAt && (
                  <div className="text-xs text-white/50 mt-1">
                    Expira:{' '}
                    {new Date(detail.attachmentExpiresAt).toLocaleString('es-CL')}
                  </div>
                )}
              </div>
            )}
          </section>

          {(actionError || actionSuccess) && (
            <div className="mt-4">
              {actionError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 text-sm">
                  {actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg p-3 text-sm">
                  {actionSuccess}
                </div>
              )}
            </div>
          )}

          {detail.status === 'PENDING' && (
            <section className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
                Acciones disponibles
              </h2>
              <button
                type="button"
                onClick={handleStart}
                disabled={submitting}
                className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
              >
                Marcar En proceso
              </button>
            </section>
          )}

          {(detail.status === 'PENDING' || detail.status === 'IN_PROGRESS') && (
            <>
              <section className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
                  Completar solicitud
                </h2>
                <form onSubmit={handleComplete} className="mt-3 space-y-3">
                  <div>
                    <label
                      htmlFor="attachmentUrl"
                      className="block text-xs text-white/60 mb-1"
                    >
                      URL del adjunto (opcional)
                    </label>
                    <input
                      id="attachmentUrl"
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="https://res.cloudinary.com/.../export.zip"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="completeNotes"
                      className="block text-xs text-white/60 mb-1"
                    >
                      Notas internas (opcional, no se envían al usuario)
                    </label>
                    <textarea
                      id="completeNotes"
                      value={completeNotes}
                      onChange={(e) => setCompleteNotes(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black rounded-lg text-sm font-medium"
                  >
                    {submitting ? 'Procesando…' : 'Marcar Completada'}
                  </button>
                </form>
              </section>

              <section className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
                  Rechazar solicitud
                </h2>
                <form onSubmit={handleReject} className="mt-3 space-y-3">
                  <div>
                    <label
                      htmlFor="rejectionReason"
                      className="block text-xs text-white/60 mb-1"
                    >
                      Motivo de rechazo (se envía al usuario) *
                    </label>
                    <textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      required
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                  >
                    {submitting ? 'Procesando…' : 'Rechazar'}
                  </button>
                </form>
              </section>
            </>
          )}

        </>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase text-white/40">{label}</dt>
      <dd className="mt-1 text-white">{children}</dd>
    </div>
  )
}

function StatusBadge({ status }: { status: AdminArcopDetail['status'] }) {
  const map: Record<AdminArcopDetail['status'], string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-200',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-200',
    COMPLETED: 'bg-green-500/20 text-green-200',
    REJECTED: 'bg-red-500/20 text-red-200',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-md font-medium ${map[status]}`}>{status}</span>
  )
}
