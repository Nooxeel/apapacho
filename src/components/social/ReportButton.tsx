'use client'

/**
 * Reusable "Reportar" button + modal pair.
 *
 * Drop into any feed / message / profile to give the viewer a one-click way
 * to file a content/user report. The button is intentionally low-contrast —
 * we don't want to encourage misuse, just keep the safety surface visible.
 *
 * Anonymous users can still report (the modal collapses to "Para CSAM o
 * emergencias contacta directamente a la autoridad"); the backend handles
 * the rate limit + auto-escalation server-side.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Flag, Loader2, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import {
  createReport,
  REPORT_TYPE_LABELS,
  type ReportTargetType,
  type ReportType,
} from '@/lib/api/reports'

interface ReportButtonProps {
  targetType: ReportTargetType
  targetId: string
  /** Optional — the user that owns the reported content. Used to suppress the
   *  button on self-owned items so users can't report themselves. */
  targetUserId?: string
  label?: string
  /** Visual variant. "icon" is the small flag (use in comments / messages),
   *  "button" is the full pill (use in profile headers / post menus). */
  variant?: 'icon' | 'button' | 'menu-item'
  className?: string
}

const REPORT_TYPE_OPTIONS: ReportType[] = [
  'CSAM',
  'NON_CONSENSUAL_CONTENT',
  'UNDERAGE_USER',
  'ILLEGAL_CONTENT',
  'HARASSMENT',
  'HATE_SPEECH',
  'IMPERSONATION',
  'SPAM',
  'COPYRIGHT',
  'OTHER',
]

const REASON_MIN = 5
const REASON_MAX = 5000
const EVIDENCE_MAX = 5000

export function ReportButton({
  targetType,
  targetId,
  targetUserId,
  label = 'Reportar',
  variant = 'button',
  className,
}: ReportButtonProps) {
  const { user, token } = useAuthStore()
  const [open, setOpen] = useState(false)

  // Hide the button when the viewer is the target owner.
  if (targetUserId && user?.id === targetUserId) {
    return null
  }

  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            className ??
            'p-1 text-white/40 hover:text-red-400 transition-colors'
          }
          title={label}
          aria-label={label}
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
        {open && (
          <ReportModal
            targetType={targetType}
            targetId={targetId}
            token={token ?? null}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    )
  }

  if (variant === 'menu-item') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            className ??
            'w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2'
          }
        >
          <Flag className="w-4 h-4" />
          {label}
        </button>
        {open && (
          <ReportModal
            targetType={targetType}
            targetId={targetId}
            token={token ?? null}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          'inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 text-white/70 hover:text-red-400 hover:border-red-400/40 transition-colors text-sm'
        }
        aria-label={label}
      >
        <Flag className="w-4 h-4" />
        {label}
      </button>
      {open && (
        <ReportModal
          targetType={targetType}
          targetId={targetId}
          token={token ?? null}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

interface ReportModalProps {
  targetType: ReportTargetType
  targetId: string
  token: string | null
  onClose: () => void
}

function ReportModal({ targetType, targetId, token, onClose }: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('HARASSMENT')
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    autoEscalated: boolean
    reportId: string
  } | null>(null)

  const dialogRef = useRef<HTMLDivElement | null>(null)

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Focus management.
  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      if (reason.trim().length < REASON_MIN) {
        setError(`El motivo debe tener al menos ${REASON_MIN} caracteres.`)
        return
      }
      if (reason.trim().length > REASON_MAX) {
        setError(`El motivo no puede exceder ${REASON_MAX} caracteres.`)
        return
      }
      setSubmitting(true)
      try {
        const result = await createReport(
          {
            targetType,
            targetId,
            reportType,
            reason: reason.trim(),
            evidence: evidence.trim() || undefined,
          },
          token ?? undefined
        )
        setSuccess({
          autoEscalated: result.autoEscalated,
          reportId: result.reportId,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al enviar el reporte'
        setError(message)
      } finally {
        setSubmitting(false)
      }
    },
    [reason, evidence, reportType, targetType, targetId, token]
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden focus:outline-none"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 id="report-modal-title" className="text-base font-semibold text-white flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-400" />
            Reportar contenido
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {success ? (
          <div className="p-6 space-y-3 text-sm text-white/80">
            <p className="font-medium text-white">Gracias por tu reporte.</p>
            <p>
              Revisaremos el contenido reportado lo antes posible. Si tu reporte
              fue clasificado como urgente, ya se aplicaron medidas preventivas.
            </p>
            {success.autoEscalated && (
              <p className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-200">
                Tu reporte activó un protocolo de emergencia. El contenido fue
                ocultado preventivamente y un administrador lo revisará en
                menos de 1 hora.
              </p>
            )}
            <p className="text-white/60 text-xs">
              Para CSAM o emergencias contacta directamente a las autoridades
              (PDI - Brigada del Cibercrimen, +56 2 2708 1000).
            </p>
            <p className="text-white/40 text-xs">
              ID del reporte: <code>{success.reportId}</code>
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label
                htmlFor="report-type"
                className="block text-xs font-medium text-white/70 mb-1"
              >
                Motivo del reporte
              </label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-fuchsia-500"
              >
                {REPORT_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t} className="bg-zinc-950">
                    {REPORT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="report-reason"
                className="block text-xs font-medium text-white/70 mb-1"
              >
                Cuéntanos qué está pasando
              </label>
              <textarea
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                rows={4}
                maxLength={REASON_MAX}
                placeholder="Describe el problema con el mayor detalle posible. No incluyas datos personales tuyos ni de terceros que no sean necesarios."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-fuchsia-500 resize-none"
              />
              <p className="mt-1 text-[10px] text-white/40 text-right">
                {reason.length}/{REASON_MAX}
              </p>
            </div>

            <div>
              <label
                htmlFor="report-evidence"
                className="block text-xs font-medium text-white/70 mb-1"
              >
                Evidencia adicional <span className="text-white/40">(opcional)</span>
              </label>
              <textarea
                id="report-evidence"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                disabled={submitting}
                rows={2}
                maxLength={EVIDENCE_MAX}
                placeholder="URLs, capturas, contexto adicional..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-fuchsia-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                {error}
              </p>
            )}

            <p className="text-[11px] text-white/40 leading-relaxed">
              Para CSAM o emergencias contacta directamente a las autoridades
              (PDI - Brigada del Cibercrimen). Los reportes falsos pueden
              resultar en sanciones a tu cuenta.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || reason.trim().length < REASON_MIN}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-500/40 disabled:cursor-not-allowed text-sm font-medium text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  'Enviar reporte'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ReportButton
