'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import {
  approveKyc,
  freezeKycEvidence,
  getKycSubmission,
  refreshKycEvidenceUrl,
  rejectKyc,
  type KycChecklistItem,
  type KycSubmissionDetail,
} from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

const STANDARD_REASONS = [
  'Foto borrosa o ilegible',
  'Falta reverso de cédula',
  'La selfie no muestra la cédula junto a la cara',
  'Datos ingresados no coinciden con el ID',
  'Cédula vencida',
  'Sospecha de edición digital del documento',
  'Sospecha de documento robado o fraude',
  'Otro (especificar en notas)',
]

type EvidenceKind = 'idFront' | 'idBack' | 'selfieWithId'

export default function AdminKycDetailPage() {
  const params = useParams<{ submissionId: string }>()
  const router = useRouter()
  const { token } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<KycSubmissionDetail | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [evidenceUrls, setEvidenceUrls] = useState<Record<EvidenceKind, string>>({
    idFront: '',
    idBack: '',
    selfieWithId: '',
  })

  // Reject modal state
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectCanResubmit, setRejectCanResubmit] = useState(true)
  const [rejectNotes, setRejectNotes] = useState('')

  // Freeze evidence state
  const [freezeOpen, setFreezeOpen] = useState(false)
  const [freezeNotes, setFreezeNotes] = useState('')

  const [actioning, setActioning] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [lastFreezeResult, setLastFreezeResult] = useState<{
    incidentId: string
    hash: string
  } | null>(null)

  const load = useCallback(async () => {
    if (!params?.submissionId) return
    setLoading(true)
    setError(null)
    try {
      const detail = await getKycSubmission(params.submissionId, token ?? undefined)
      setData(detail)
      setEvidenceUrls({
        idFront: detail.evidence.idFront,
        idBack: detail.evidence.idBack,
        selfieWithId: detail.evidence.selfieWithId,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la submission')
    } finally {
      setLoading(false)
    }
  }, [params?.submissionId, token])

  useEffect(() => {
    load()
  }, [load])

  const flatChecklist: KycChecklistItem[] = useMemo(
    () => (data?.checklist ?? []).flatMap((s) => s.items),
    [data?.checklist]
  )
  const blockingItems = useMemo(
    () => flatChecklist.filter((i) => i.blocking),
    [flatChecklist]
  )
  const blockingAllChecked = useMemo(
    () => blockingItems.every((i) => checked[i.code] === true),
    [blockingItems, checked]
  )

  const failedFraudItems = useMemo(
    () => flatChecklist.filter((i) => i.category === 'fraud' && checked[i.code] !== true),
    [flatChecklist, checked]
  )
  const failedQualityItems = useMemo(
    () => flatChecklist.filter((i) => i.category === 'quality' && checked[i.code] !== true),
    [flatChecklist, checked]
  )

  const suggestedAction = useMemo(() => {
    if (!data) return 'load'
    if (blockingAllChecked) return 'approve'
    if (failedFraudItems.some((i) => i.blocking)) return 'reject'
    if (failedQualityItems.some((i) => i.blocking)) return 'resubmit'
    return 'approve'
  }, [data, blockingAllChecked, failedFraudItems, failedQualityItems])

  const refreshEvidence = useCallback(
    async (kind: EvidenceKind) => {
      if (!params?.submissionId) return
      try {
        const res = await refreshKycEvidenceUrl(params.submissionId, kind, token ?? undefined)
        setEvidenceUrls((prev) => ({ ...prev, [kind]: res.url }))
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Error al refrescar URL')
      }
    },
    [params?.submissionId, token]
  )

  const handleApprove = useCallback(async () => {
    if (!data) return
    if (!blockingAllChecked) {
      setActionError('Marca todos los items bloqueantes antes de aprobar')
      return
    }
    setActioning(true)
    setActionError(null)
    try {
      await approveKyc(data.submissionId, undefined, token ?? undefined)
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al aprobar')
    } finally {
      setActioning(false)
    }
  }, [data, blockingAllChecked, token, load])

  const handleReject = useCallback(async () => {
    if (!data) return
    if (!rejectReason.trim()) {
      setActionError('La razón es obligatoria')
      return
    }
    setActioning(true)
    setActionError(null)
    try {
      await rejectKyc(
        data.submissionId,
        rejectReason.trim(),
        rejectCanResubmit,
        rejectNotes.trim() || undefined,
        token ?? undefined
      )
      setRejectOpen(false)
      setRejectReason('')
      setRejectNotes('')
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setActioning(false)
    }
  }, [data, rejectReason, rejectCanResubmit, rejectNotes, token, load])

  const handleFreeze = useCallback(async () => {
    if (!data) return
    setActioning(true)
    setActionError(null)
    try {
      const res = await freezeKycEvidence(
        data.submissionId,
        freezeNotes.trim() || undefined,
        token ?? undefined
      )
      setLastFreezeResult({ incidentId: res.incidentId, hash: res.hash })
      setFreezeOpen(false)
      setFreezeNotes('')
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al congelar evidencia')
    } finally {
      setActioning(false)
    }
  }, [data, freezeNotes, token, load])

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-white/70">Cargando…</div>
  }
  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error ?? 'Submission no encontrada'}
        </p>
        <Link href="/admin/kyc" className="text-white/60 underline text-sm mt-4 inline-block">
          ← Volver a la cola
        </Link>
      </div>
    )
  }

  const decided = !!data.decision
  const submittedLocal = new Date(data.submittedAt).toLocaleString('es-CL')

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <Link href="/admin/kyc" className="text-white/60 hover:text-white text-sm">
            ← Volver a la cola
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            KYC de <span className="text-pink-400">@{data.creator.username}</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Enviado {submittedLocal} ·{' '}
            <span className={data.isOverdue ? 'text-red-400' : 'text-white/70'}>
              {data.hoursSinceSubmit}h desde envío
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {decided ? (
            <span className="px-3 py-1 rounded-lg bg-white/10 text-sm">
              Ya decidido: {data.decision}
            </span>
          ) : (
            <>
              <Button
                variant="primary"
                disabled={!blockingAllChecked || actioning}
                isLoading={actioning && suggestedAction === 'approve'}
                onClick={handleApprove}
              >
                Aprobar
              </Button>
              <Button
                variant="danger"
                disabled={actioning}
                onClick={() => {
                  setActionError(null)
                  setRejectCanResubmit(suggestedAction !== 'reject')
                  setRejectOpen(true)
                }}
              >
                Rechazar
              </Button>
              <Button
                variant="secondary"
                disabled={actioning}
                onClick={() => {
                  setActionError(null)
                  setFreezeOpen(true)
                }}
              >
                Congelar evidencia
              </Button>
            </>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {actionError}
        </div>
      )}
      {lastFreezeResult && (
        <div className="mt-4 text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          Evidencia congelada · incidente {lastFreezeResult.incidentId} · SHA-256{' '}
          <code className="text-xs">{lastFreezeResult.hash}</code>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Left: evidence + checklist */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">Documentos</h2>
            <p className="text-xs text-white/50 mb-4">
              Las URLs expiran en 15 minutos. Haz clic en &quot;Refrescar&quot; si se vencen.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {(
                [
                  { kind: 'idFront' as const, label: 'ID — frente' },
                  { kind: 'idBack' as const, label: 'ID — reverso' },
                  { kind: 'selfieWithId' as const, label: 'Selfie con ID' },
                ]
              ).map(({ kind, label }) => (
                <div key={kind} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{label}</span>
                    <button
                      className="text-xs text-white/60 hover:text-white underline"
                      onClick={() => refreshEvidence(kind)}
                    >
                      Refrescar
                    </button>
                  </div>
                  {evidenceUrls[kind] ? (
                    <a href={evidenceUrls[kind]} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={evidenceUrls[kind]}
                        alt={label}
                        className="w-full rounded-md border border-white/10"
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <div className="aspect-video bg-white/5 flex items-center justify-center text-xs text-white/40 rounded">
                      URL no disponible
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Checklist de revisión (25 items)</h2>
            <p className="text-xs text-white/50 mb-4">
              Items marcados como bloqueantes deben estar tildados para aprobar. Fuente:{' '}
              <code>02-kyc-manual-operational.md §3</code>.
            </p>
            <div className="space-y-6">
              {data.checklist.map((section) => (
                <div key={section.sectionCode} className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">
                    {section.sectionCode}. {section.sectionLabel}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.code} className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          id={`chk-${item.code}`}
                          checked={!!checked[item.code]}
                          onChange={(e) =>
                            setChecked((prev) => ({ ...prev, [item.code]: e.target.checked }))
                          }
                          className="mt-0.5 w-4 h-4"
                        />
                        <label htmlFor={`chk-${item.code}`} className="cursor-pointer">
                          <span className="font-mono text-xs text-white/40 mr-2">
                            {item.code}
                          </span>
                          {item.label}
                          {item.blocking && (
                            <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-300">
                              bloqueante
                            </span>
                          )}
                          <span
                            className={`ml-2 text-[10px] uppercase tracking-wider ${
                              item.category === 'fraud'
                                ? 'text-red-300'
                                : 'text-blue-300'
                            }`}
                          >
                            {item.category}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-white/60">
              Sugerencia:{' '}
              <span className="font-medium text-white">
                {suggestedAction === 'approve' && 'APROBAR'}
                {suggestedAction === 'reject' && 'RECHAZAR (posible fraude)'}
                {suggestedAction === 'resubmit' && 'PEDIR RESUBMISIÓN (calidad)'}
              </span>
            </div>
          </section>
        </div>

        {/* Right: data + history */}
        <aside className="space-y-6">
          <section className="bg-white/5 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Datos ingresados</h3>
            <dl className="text-sm space-y-2">
              <Field label="Nombre legal" value={data.fullLegalName} />
              <Field label="RUT" value={data.nationalId} mono />
              <Field
                label="Fecha de nacimiento"
                value={new Date(data.birthdate).toLocaleDateString('es-CL')}
              />
              <Field label="Edad" value={`${data.ageYears} años`} />
              <Field
                label="Consentimiento"
                value={new Date(data.consentSignedAt).toLocaleString('es-CL')}
              />
              <Field label="IP" value={data.ipAddress ?? '—'} mono />
              <Field label="User-Agent" value={data.userAgent ?? '—'} small />
            </dl>
          </section>

          <section className="bg-white/5 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Cuenta del creador</h3>
            <dl className="text-sm space-y-2">
              <Field label="Username" value={`@${data.creator.username}`} />
              <Field label="Display name" value={data.creator.displayName} />
              <Field label="Email" value={data.creator.email} />
              <Field
                label="Cuenta creada"
                value={new Date(data.creator.accountCreatedAt).toLocaleString('es-CL')}
              />
              <Field label="Estado KYC" value={data.status} />
            </dl>
          </section>

          {data.history.length > 0 && (
            <section className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">Historial de submissions</h3>
              <ul className="text-sm space-y-2">
                {data.history.map((h) => (
                  <li key={h.id} className="border-b border-white/5 pb-2">
                    <div className="text-white/80">
                      {new Date(h.submittedAt).toLocaleString('es-CL')}
                    </div>
                    <div className="text-xs text-white/50">
                      {h.decision ?? 'pending'}
                      {h.rejectionReason && ` · ${h.rejectionReason}`}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.fraudIncidents.length > 0 && (
            <section className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3 text-red-200">
                Incidentes de fraude
              </h3>
              <ul className="text-sm space-y-2">
                {data.fraudIncidents.map((i) => (
                  <li key={i.id} className="border-b border-white/5 pb-2">
                    <div className="text-white/80">
                      {i.triggerType} · {i.severity} · {i.status}
                    </div>
                    <div className="text-xs text-white/50">
                      {new Date(i.triggeredAt).toLocaleString('es-CL')}
                      {i.resolution && ` · ${i.resolution}`}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      {rejectOpen && (
        <Modal onClose={() => setRejectOpen(false)} title="Rechazar submission">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Razón estándar
              </label>
              <select
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              >
                <option value="">Selecciona una razón…</option>
                {STANDARD_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Razón personalizada (opcional, reemplaza la estándar)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={rejectCanResubmit}
                onChange={(e) => setRejectCanResubmit(e.target.checked)}
              />
              Permitir resubmisión (RESUBMISSION_REQUIRED). Desmarca para REJECTED definitivo.
            </label>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Notas internas (opcional, no se envían al creador)
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={2}
                maxLength={2000}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRejectOpen(false)} disabled={actioning}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleReject} isLoading={actioning}>
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {freezeOpen && (
        <Modal onClose={() => setFreezeOpen(false)} title="Congelar evidencia">
          <p className="text-sm text-white/60 mb-4">
            Esto genera un bundle firmado con SHA-256 y crea un{' '}
            <code>FraudIncident</code> asociado al creador. Usar solo cuando hay sospecha
            fundada de fraude o a pedido de autoridad.
          </p>
          <textarea
            value={freezeNotes}
            onChange={(e) => setFreezeNotes(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Notas del incidente (quién reportó, contexto…)"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setFreezeOpen(false)} disabled={actioning}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleFreeze} isLoading={actioning}>
              Congelar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  mono,
  small,
}: {
  label: string
  value: string
  mono?: boolean
  small?: boolean
}) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-2">
      <dt className="text-white/50 text-xs uppercase tracking-wider">{label}</dt>
      <dd
        className={`${mono ? 'font-mono' : ''} ${small ? 'text-xs' : ''} text-white/90 break-all`}
      >
        {value}
      </dd>
    </div>
  )
}

// Thin wrapper around the shared Dialog primitive — kept as a local
// component to preserve the call-sites in this page without re-rewriting them.
function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Dialog open onClose={onClose} title={title} size="lg">
      {children}
    </Dialog>
  )
}
