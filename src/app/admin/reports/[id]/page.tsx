'use client'

/**
 * Admin report detail — `/admin/reports/[id]`.
 *
 * Shows the report, the reporter, a preview of the target entity and the
 * history of related reports against the same target. The admin can:
 *   - Apply a take-down (hide post / delete comment / hide creator posts).
 *   - Mark as RESOLVED_NO_ACTION (dismiss).
 *   - Escalate to legal queue.
 *   - Mark as duplicate.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import {
  getAdminReportDetail,
  processAdminReport,
  takeDownAdminReport,
  PRIORITY_LABELS,
  type AdminReportDetail,
  type AdminProcessAction,
} from '@/lib/api/admin-reports'
import {
  REPORT_TYPE_LABELS,
  REPORT_TARGET_TYPE_LABELS,
  REPORT_STATUS_LABELS,
} from '@/lib/api/reports'

export default function AdminReportDetailPage() {
  const params = useParams<{ id: string }>()
  const reportId = params.id
  const { token } = useAuthStore()
  const [detail, setDetail] = useState<AdminReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolution, setResolution] = useState('')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token || !reportId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminReportDetail(reportId, token)
      setDetail(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }, [reportId, token])

  useEffect(() => {
    load()
  }, [load])

  const onProcess = async (action: AdminProcessAction) => {
    if (!token) return
    setSubmitting(action)
    setNotice(null)
    try {
      const result = await processAdminReport(
        reportId,
        { action, resolution: resolution || undefined },
        token
      )
      if (result.transitionApplied) {
        setNotice(`Reporte marcado como ${result.report.status}.`)
      } else {
        setNotice('El reporte ya estaba en un estado terminal.')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el reporte')
    } finally {
      setSubmitting(null)
    }
  }

  const onTakeDown = async () => {
    if (!token) return
    setSubmitting('take-down')
    setNotice(null)
    try {
      const result = await takeDownAdminReport(
        reportId,
        { resolution: resolution || undefined },
        token
      )
      setNotice(`Take-down aplicado: ${result.action}.`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aplicar el take-down')
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-white/50">Cargando…</p>
      </div>
    )
  }
  if (error || !detail) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        <Link
          href="/admin/reports"
          className="text-white/60 underline text-sm inline-block"
        >
          ← Volver
        </Link>
        <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error ?? 'Reporte no encontrado'}
        </p>
      </div>
    )
  }

  const { report, targetPreview, relatedReports } = detail
  const isTerminal = !(
    report.status === 'PENDING' || report.status === 'IN_REVIEW'
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <Link
        href="/admin/reports"
        className="text-white/60 hover:text-white text-sm inline-block"
      >
        ← Volver a la cola
      </Link>

      <header className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Reporte {report.id.slice(0, 8)}…</h1>
            <p className="text-sm text-white/60 mt-1">
              Creado {new Date(report.createdAt).toLocaleString('es-CL')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone={priorityTone(report.priority)}>
              {PRIORITY_LABELS[report.priority] ?? 'Normal'}
            </Badge>
            <Badge tone="info">{REPORT_TYPE_LABELS[report.reportType]}</Badge>
            <Badge tone={statusTone(report.status)}>
              {REPORT_STATUS_LABELS[report.status]}
            </Badge>
          </div>
        </div>
      </header>

      {notice && (
        <p className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-200">
          {notice}
        </p>
      )}

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Motivo</h2>
        <p className="text-sm text-white/80 whitespace-pre-wrap">{report.reason}</p>
        {report.evidence && (
          <>
            <h3 className="text-sm font-medium text-white/70">Evidencia adicional</h3>
            <p className="text-sm text-white/70 whitespace-pre-wrap">{report.evidence}</p>
          </>
        )}
        {report.resolution && (
          <>
            <h3 className="text-sm font-medium text-white/70">Resolución actual</h3>
            <p className="text-sm text-white/70 whitespace-pre-wrap">{report.resolution}</p>
          </>
        )}
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">Reportero</h2>
        {report.reporter ? (
          <p className="text-sm text-white/80">
            <span className="font-medium">{report.reporter.displayName}</span>
            <span className="text-white/50"> · @{report.reporter.username}</span>
            <span className="text-white/50"> · {report.reporter.email}</span>
          </p>
        ) : (
          <p className="text-sm text-white/60">Reporte anónimo.</p>
        )}
        {report.ipAddress && (
          <p className="text-xs text-white/40">IP: {report.ipAddress}</p>
        )}
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">
          Objetivo — {REPORT_TARGET_TYPE_LABELS[report.targetType]}
        </h2>
        <p className="text-xs text-white/40">
          ID: <code>{report.targetId}</code>
        </p>
        {report.targetUserId && (
          <p className="text-xs text-white/40">
            Usuario dueño: <code>{report.targetUserId}</code>
          </p>
        )}
        {targetPreview ? (
          <pre className="bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white/70 overflow-auto max-h-96">
            {JSON.stringify(targetPreview, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-white/60">
            El objeto reportado ya no existe en la base de datos.
          </p>
        )}
      </section>

      {relatedReports.length > 0 && (
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold">
            Otros reportes sobre el mismo objetivo ({relatedReports.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {relatedReports.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                <span>
                  <Badge tone="info">{REPORT_TYPE_LABELS[r.reportType]}</Badge>{' '}
                  <Badge tone={statusTone(r.status)}>
                    {REPORT_STATUS_LABELS[r.status]}
                  </Badge>{' '}
                  <span className="text-white/60 text-xs">
                    {new Date(r.createdAt).toLocaleDateString('es-CL')}
                  </span>
                </span>
                <Link
                  href={`/admin/reports/${r.id}`}
                  className="text-white/70 underline text-xs"
                >
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.fraudIncidentId && (
        <section className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 space-y-2">
          <h2 className="text-lg font-semibold text-red-200">
            Auto-escalación: FraudIncident vinculado
          </h2>
          <p className="text-sm text-red-100">
            Este reporte activó la creación automática de un{' '}
            <code className="text-red-50">FraudIncident</code> y se ocultaron los
            posts del creador objetivo.
          </p>
          <p className="text-xs text-red-200/80">
            FraudIncident ID: <code>{report.fraudIncidentId}</code>
          </p>
        </section>
      )}

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Acciones</h2>

        <label className="block">
          <span className="block text-xs text-white/60 mb-1 uppercase tracking-wide">
            Resolución / notas internas
          </span>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={3}
            maxLength={5000}
            disabled={isTerminal || submitting !== null}
            placeholder="Resumen de la decisión, evidencias revisadas, contacto con el reportero, etc."
            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-500 resize-none"
          />
        </label>

        {isTerminal ? (
          <p className="text-sm text-white/60">
            Este reporte ya fue procesado. Las acciones están deshabilitadas.
          </p>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <ActionButton
              tone="danger"
              loading={submitting === 'take-down'}
              disabled={submitting !== null}
              onClick={onTakeDown}
            >
              Aplicar take-down
            </ActionButton>
            <ActionButton
              tone="warning"
              loading={submitting === 'take_action'}
              disabled={submitting !== null}
              onClick={() => onProcess('take_action')}
            >
              Acción aplicada (sin take-down)
            </ActionButton>
            <ActionButton
              tone="neutral"
              loading={submitting === 'dismiss'}
              disabled={submitting !== null}
              onClick={() => onProcess('dismiss')}
            >
              Desestimar
            </ActionButton>
            <ActionButton
              tone="purple"
              loading={submitting === 'escalate_legal'}
              disabled={submitting !== null}
              onClick={() => onProcess('escalate_legal')}
            >
              Escalar legal
            </ActionButton>
            <ActionButton
              tone="neutral"
              loading={submitting === 'mark_duplicate'}
              disabled={submitting !== null}
              onClick={() => onProcess('mark_duplicate')}
            >
              Duplicado
            </ActionButton>
          </div>
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------

type Tone = 'info' | 'danger' | 'warning' | 'success' | 'neutral' | 'purple'

function Badge({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  const map: Record<Tone, string> = {
    info: 'bg-blue-500/20 text-blue-200',
    danger: 'bg-red-500/20 text-red-200',
    warning: 'bg-amber-500/20 text-amber-200',
    success: 'bg-emerald-500/20 text-emerald-200',
    neutral: 'bg-white/10 text-white/70',
    purple: 'bg-purple-500/20 text-purple-200',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md ${map[tone]}`}>
      {children}
    </span>
  )
}

function priorityTone(priority: number): Tone {
  if (priority === 2) return 'danger'
  if (priority === 1) return 'warning'
  return 'neutral'
}

function statusTone(status: AdminReportDetail['report']['status']): Tone {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'IN_REVIEW':
      return 'info'
    case 'RESOLVED_ACTION_TAKEN':
      return 'success'
    case 'ESCALATED_LEGAL':
      return 'purple'
    case 'DUPLICATE':
    case 'RESOLVED_NO_ACTION':
    default:
      return 'neutral'
  }
}

function ActionButton({
  children,
  tone,
  loading,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  tone: Tone
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  const map: Record<Tone, string> = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-zinc-950',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950',
    info: 'bg-blue-500 hover:bg-blue-600 text-white',
    neutral: 'bg-white/10 hover:bg-white/20 text-white',
    purple: 'bg-purple-500 hover:bg-purple-600 text-white',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${map[tone]}`}
    >
      {loading ? 'Aplicando…' : children}
    </button>
  )
}
