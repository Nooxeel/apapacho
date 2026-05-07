'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import {
  applyDmcaTakedown,
  DMCA_STATUS_LABELS,
  getDmcaDetail,
  rejectDmcaNotice,
  validateDmcaNotice,
  type AdminDmcaDetail,
  type AdminDmcaStatus,
} from '@/lib/api/legal'

export default function AdminDmcaDetailPage() {
  const params = useParams<{ id: string }>()
  const { token } = useAuthStore()
  const id = params?.id

  const [detail, setDetail] = useState<AdminDmcaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set())
  const [rejectionReason, setRejectionReason] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const result = await getDmcaDetail(id, token ?? undefined)
      setDetail(result)
      // Pre-select all resolved post IDs by default for convenience.
      setSelectedPostIds(new Set(result.posts.map((p) => p.id)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la notificación')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    load()
  }, [load])

  const togglePost = (postId: string) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  const handleValidate = async () => {
    if (!id) return
    setSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      await validateDmcaNotice(id, token ?? undefined)
      setActionSuccess('Notificación marcada como Validada.')
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al validar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTakedown = async () => {
    if (!id) return
    if (selectedPostIds.size === 0) {
      setActionError('Selecciona al menos un post para aplicar takedown.')
      return
    }
    if (
      !confirm(
        `¿Confirmas el takedown de ${selectedPostIds.size} post(s)? Quedarán ocultos y se notificará al creador.`
      )
    ) {
      return
    }
    setSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      const result = await applyDmcaTakedown(
        id,
        Array.from(selectedPostIds),
        token ?? undefined
      )
      setActionSuccess(
        `Takedown aplicado a ${result.takenDownPostIds.length} post(s). Creadores notificados.`
      )
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al aplicar takedown')
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
      await rejectDmcaNotice(id, rejectionReason.trim(), token ?? undefined)
      setActionSuccess('Notificación rechazada.')
      setRejectionReason('')
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/admin/legal/dmca"
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
              <h1 className="text-2xl font-bold">Notificación DMCA</h1>
              <p className="text-white/50 text-xs font-mono mt-1">{detail.notice.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <DmcaStatusBadge status={detail.notice.status} />
              {detail.isOverdue && (
                <span className="text-xs px-2 py-1 rounded-md bg-red-500/20 text-red-300">
                  +{detail.hoursOverdue}h vencida
                </span>
              )}
            </div>
          </div>

          <section className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
              Notificante
            </h2>
            <dl className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
              <Row label="Nombre">{detail.notice.notifierName}</Row>
              <Row label="Email">{detail.notice.notifierEmail}</Row>
              <Row label="Documento">{detail.notice.notifierIdNumber ?? '—'}</Row>
              <Row label="Dirección">{detail.notice.notifierAddress ?? '—'}</Row>
              <Row label="IP">{detail.notice.ipAddress ?? '—'}</Row>
              <Row label="Recibida">
                {new Date(detail.notice.receivedAt).toLocaleString('es-CL')}
              </Row>
              <Row label="Vence">
                {new Date(detail.notice.dueBy).toLocaleString('es-CL')}
              </Row>
            </dl>
          </section>

          <section className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
              Obra reclamada
            </h2>
            <pre className="mt-3 bg-black/40 border border-white/10 rounded-lg p-3 text-sm whitespace-pre-wrap">
              {detail.notice.worksClaimed}
            </pre>
            <h3 className="mt-4 text-xs uppercase text-white/40">Prueba de titularidad</h3>
            <pre className="mt-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm whitespace-pre-wrap">
              {detail.notice.ownershipProof}
            </pre>
          </section>

          <section className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
              URLs reportadas ({detail.notice.infringingUrls.length})
            </h2>
            <ul className="mt-3 space-y-1 text-sm">
              {detail.notice.infringingUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:text-fuchsia-300 underline break-all font-mono text-xs"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
              Posts resueltos ({detail.posts.length})
            </h2>
            {detail.posts.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">
                Ninguna URL del reporte mapeó a un post existente. Si necesitas takedown
                de contenido específico, identifícalo manualmente.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {detail.posts.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start gap-3 bg-black/40 border border-white/10 rounded-lg p-3"
                  >
                    {detail.notice.status === 'PENDING' || detail.notice.status === 'VALIDATED' ? (
                      <input
                        type="checkbox"
                        checked={selectedPostIds.has(p.id)}
                        onChange={() => togglePost(p.id)}
                        className="mt-1 w-4 h-4"
                      />
                    ) : null}
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {p.title || '(Sin título)'}
                      </div>
                      <div className="text-xs text-white/50 font-mono mt-0.5">{p.id}</div>
                      <div className="text-xs text-white/60 mt-1">
                        Creador: <strong>{p.creator.user.displayName}</strong> (@
                        {p.creator.user.username}) · {p.creator.user.email}
                      </div>
                      <div className="text-xs text-white/60 mt-0.5">
                        Visibilidad actual:{' '}
                        <code className="text-white/80">{p.visibility}</code>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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

          {(detail.notice.status === 'PENDING' || detail.notice.status === 'VALIDATED') && (
            <section className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold uppercase text-white/50 tracking-wider">
                Acciones disponibles
              </h2>

              <div className="mt-3 flex flex-wrap gap-3">
                {detail.notice.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                  >
                    Marcar Validada
                  </button>
                )}
                {detail.posts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleTakedown}
                    disabled={submitting || selectedPostIds.size === 0}
                    className="px-4 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                  >
                    Aplicar takedown ({selectedPostIds.size})
                  </button>
                )}
              </div>

              <form onSubmit={handleReject} className="mt-5 space-y-3">
                <div>
                  <label
                    htmlFor="rejectionReason"
                    className="block text-xs text-white/60 mb-1"
                  >
                    Rechazar la notificación — motivo (se envía al notificante) *
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                >
                  Rechazar notificación
                </button>
              </form>
            </section>
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

function DmcaStatusBadge({ status }: { status: AdminDmcaStatus }) {
  const map: Record<AdminDmcaStatus, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-200',
    VALIDATED: 'bg-blue-500/20 text-blue-200',
    TAKEN_DOWN: 'bg-red-500/20 text-red-300',
    COUNTER_NOTICE: 'bg-amber-500/20 text-amber-200',
    REJECTED: 'bg-white/10 text-white/70',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-md font-medium ${map[status]}`}>
      {DMCA_STATUS_LABELS[status]}
    </span>
  )
}
