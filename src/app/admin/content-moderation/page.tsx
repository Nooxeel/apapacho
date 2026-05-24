'use client'

/**
 * Admin content moderation queue — `/admin/content-moderation`.
 *
 * Lists `ContentScanResult` rows that need human review (default verdict
 * filter: NSFW_EXTREME, SUSPICIOUS_NEEDS_REVIEW, plus CSAM/MALWARE that
 * were auto-quarantined but admin should still confirm).
 *
 * Per-row actions:
 *   - Approve         → clear `flaggedForReview`, mark scan PASSED/CLEAN.
 *   - Take down       → set Post.visibility='hidden' + QUARANTINED.
 *   - Escalate CSAM   → open FraudIncident severity=CSAM + hide all creator's posts.
 *
 * Media preview is hidden by default behind a "Mostrar" button to give the
 * admin an explicit consent step before viewing potentially disturbing
 * content.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  getContentModerationQueue,
  approveScanResult,
  takeDownScanResult,
  escalateScanResultAsCsam,
  VERDICT_LABELS,
  VERDICT_COLORS,
  STATUS_LABELS,
  PROVIDER_LABELS,
  type ScanResultRow,
  type ScanVerdict,
  type ScanStatus,
} from '@/lib/api/admin-content-moderation'

const VERDICT_TABS: Array<{ id: string; label: string; verdicts: ScanVerdict[] }> = [
  {
    id: 'review',
    label: 'Necesita revisión',
    verdicts: ['NSFW_EXTREME', 'SUSPICIOUS_NEEDS_REVIEW'],
  },
  { id: 'csam', label: 'CSAM detectado', verdicts: ['CSAM'] },
  { id: 'malware', label: 'Malware', verdicts: ['MALWARE'] },
  { id: 'errors', label: 'Errores de scan', verdicts: ['ERROR'] },
  { id: 'all', label: 'Todo', verdicts: [] },
]

export default function AdminContentModerationPage() {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<string>('review')
  const [sort, setSort] = useState<'createdAt' | 'confidence'>('createdAt')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<ScanResultRow[]>([])
  const [total, setTotal] = useState(0)
  const [actioningId, setActioningId] = useState<string | null>(null)

  const activeFilter = useMemo(
    () => VERDICT_TABS.find((t) => t.id === activeTab) ?? VERDICT_TABS[0],
    [activeTab]
  )

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await getContentModerationQueue(
        {
          verdict: activeFilter.verdicts.length > 0 ? activeFilter.verdicts : undefined,
          page: 1,
          pageSize: 50,
          sort,
          order: 'desc',
        },
        token
      )
      setRows(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la cola')
    } finally {
      setLoading(false)
    }
  }, [activeFilter, sort, token])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async (row: ScanResultRow) => {
    if (!token) return
    if (!confirm('¿Aprobar este contenido? El flag se quitará y permanecerá publicado.')) return
    setActioningId(row.id)
    try {
      await approveScanResult(row.id, token)
      await load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al aprobar')
    } finally {
      setActioningId(null)
    }
  }

  const handleTakeDown = async (row: ScanResultRow) => {
    if (!token) return
    if (!confirm('¿Bajar este contenido? Quedará oculto del feed público.')) return
    setActioningId(row.id)
    try {
      await takeDownScanResult(row.id, token)
      await load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al bajar contenido')
    } finally {
      setActioningId(null)
    }
  }

  const handleEscalateCsam = async (row: ScanResultRow) => {
    if (!token) return
    const confirmed = confirm(
      'Marcar como CSAM crea un FraudIncident severity=CSAM, oculta TODOS los posts del creator y dispara el procedimiento de reporte legal (NCMEC + PDI). ¿Continuar?'
    )
    if (!confirmed) return
    setActioningId(row.id)
    try {
      const result = await escalateScanResultAsCsam(row.id, token)
      alert(
        `Escalado correctamente.\nFraudIncident: ${result.fraudIncidentId}\nPosts ocultados: ${result.postsHidden}`
      )
      await load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al escalar CSAM')
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Moderación de contenido</h1>
          <p className="text-white/60 mt-1 text-sm max-w-3xl">
            Cola async del pipeline de detección (CSAM + NSFW + antivirus).
            CSAM y malware se auto-quarantean — la cola está para confirmar
            falsos positivos. NSFW extremo y sospechosos esperan tu revisión.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
        >
          Refrescar
        </button>
      </header>

      <nav className="mt-6 flex gap-2 border-b border-white/10 overflow-x-auto">
        {VERDICT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <label className="text-xs text-white/60 uppercase tracking-wide">
          Ordenar por
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'createdAt' | 'confidence')}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-fuchsia-500"
        >
          <option value="createdAt" className="bg-zinc-950">
            Más recientes primero
          </option>
          <option value="confidence" className="bg-zinc-950">
            Mayor confianza primero
          </option>
        </select>
      </div>

      {loading && <p className="text-white/50 mt-8">Cargando…</p>}
      {error && (
        <p className="text-red-400 mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="text-white/50 mt-10">
          No hay contenido pendiente de revisión.
        </p>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <p className="mt-6 text-xs text-white/50">{total} scan(s) total.</p>
          <ul className="mt-3 space-y-3">
            {rows.map((row) => (
              <ScanRow
                key={row.id}
                row={row}
                isActioning={actioningId === row.id}
                onApprove={() => handleApprove(row)}
                onTakeDown={() => handleTakeDown(row)}
                onEscalateCsam={() => handleEscalateCsam(row)}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

interface RowProps {
  row: ScanResultRow
  isActioning: boolean
  onApprove: () => void
  onTakeDown: () => void
  onEscalateCsam: () => void
}

function ScanRow({
  row,
  isActioning,
  onApprove,
  onTakeDown,
  onEscalateCsam,
}: RowProps) {
  const [previewVisible, setPreviewVisible] = useState(false)
  const createdFmt = new Date(row.createdAt).toLocaleString('es-CL')
  const confidencePct =
    typeof row.confidence === 'number' ? Math.round(row.confidence * 100) : null

  const verdict = row.verdict ?? 'ERROR'
  const verdictColor = VERDICT_COLORS[verdict]
  const isCsamConfirmed = verdict === 'CSAM' || verdict === 'MALWARE'

  return (
    <li className="border border-white/10 rounded-xl bg-white/[0.02] p-4 hover:bg-white/[0.04] transition">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={verdictColor}>{VERDICT_LABELS[verdict]}</Badge>
          <Badge className={statusBadgeColor(row.status)}>
            {STATUS_LABELS[row.status]}
          </Badge>
          <Badge className="bg-white/10 text-white/80">
            {PROVIDER_LABELS[row.provider]}
          </Badge>
          {confidencePct !== null && (
            <span className="text-xs text-white/60">
              Confianza: {confidencePct}%
            </span>
          )}
          {row.post?.flaggedForReview && (
            <Badge className="bg-amber-500/20 text-amber-200">flag</Badge>
          )}
        </div>
        <span className="text-xs text-white/50 whitespace-nowrap">
          {createdFmt}
        </span>
      </header>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <section>
          <h3 className="text-xs uppercase tracking-wide text-white/50 mb-1">
            Target
          </h3>
          <p className="text-sm">
            <span className="text-white/60">{row.targetType}</span>{' '}
            <code className="text-white/70 text-xs">
              {row.targetId.slice(0, 12)}…
            </code>
          </p>
          {row.post?.title && (
            <p className="text-sm text-white/80 mt-1 truncate">
              {row.post.title}
            </p>
          )}
          {row.post?.creator?.user && (
            <p className="text-xs text-white/60 mt-1">
              Creator:{' '}
              <span className="text-white/80">
                @{row.post.creator.user.username}
              </span>
            </p>
          )}
        </section>

        <section className="md:col-span-2">
          <h3 className="text-xs uppercase tracking-wide text-white/50 mb-1">
            Preview
          </h3>
          {previewVisible ? (
            <Preview row={row} onHide={() => setPreviewVisible(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setPreviewVisible(true)}
              className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-white/80"
            >
              Mostrar contenido (puede ser sensible)
            </button>
          )}
        </section>
      </div>

      {row.errorMessage && (
        <p className="mt-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          Error: {row.errorMessage}
        </p>
      )}

      {row.fraudIncident && (
        <p className="mt-3 text-xs text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          FraudIncident vinculado:{' '}
          <code>{row.fraudIncident.id.slice(0, 8)}…</code> · severity{' '}
          {row.fraudIncident.severity} · status {row.fraudIncident.status}
        </p>
      )}

      <footer className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={onApprove}
          disabled={isActioning || isCsamConfirmed}
          className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-200 text-xs hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Aprobar
        </button>
        <button
          type="button"
          onClick={onTakeDown}
          disabled={isActioning}
          className="px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-xs hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Bajar contenido
        </button>
        <button
          type="button"
          onClick={onEscalateCsam}
          disabled={isActioning || !!row.fraudIncidentId}
          title={
            row.fraudIncidentId ? 'Ya tiene FraudIncident vinculado' : 'Escalar como CSAM'
          }
          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 text-xs hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Marcar como CSAM
        </button>
      </footer>
    </li>
  )
}

function Preview({
  row,
  onHide,
}: {
  row: ScanResultRow
  onHide: () => void
}) {
  // We do not have a direct URL on the scan row — only the categories + raw
  // response. The preview shows the post metadata; full asset preview is
  // available via the post detail page (deep link).
  const postId = row.postId
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      {postId ? (
        <p className="text-xs text-white/70">
          Para ver el archivo, abre el post en una pestaña separada (las URLs
          firmadas duran 1h y no se pueden previsualizar sin autenticación):
          <br />
          <a
            href={`/post/${postId}`}
            target="_blank"
            rel="noreferrer"
            className="text-fuchsia-300 underline"
          >
            Abrir post {postId.slice(0, 8)}…
          </a>
        </p>
      ) : (
        <p className="text-xs text-white/60">
          Target {row.targetType} — sin preview disponible en este panel.
          Consulta el archivo en Cloudinary con `cloudinaryPublicId`.
        </p>
      )}
      <button
        type="button"
        onClick={onHide}
        className="mt-3 px-2 py-1 rounded-md text-xs bg-white/5 hover:bg-white/10 text-white/60"
      >
        Ocultar
      </button>
    </div>
  )
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode
  className: string
}) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md ${className}`}>
      {children}
    </span>
  )
}

function statusBadgeColor(status: ScanStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500/20 text-yellow-200'
    case 'PASSED':
      return 'bg-green-500/20 text-green-200'
    case 'FLAGGED':
      return 'bg-amber-500/20 text-amber-200'
    case 'FAILED':
      return 'bg-white/10 text-white/60'
    case 'QUARANTINED':
      return 'bg-red-500/20 text-red-300'
  }
}
