'use client'

/**
 * Admin moderation queue — `/admin/reports`.
 *
 * Lists `UserReport` rows with filter tabs (status × type × priority),
 * ordered by priority desc then oldest-first. Click a row to open the
 * detail page where the admin can take action.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import {
  getAdminReports,
  PRIORITY_LABELS,
  type AdminReportRow,
  type ReportStatus,
} from '@/lib/api/admin-reports'
import {
  REPORT_TYPE_LABELS,
  REPORT_TARGET_TYPE_LABELS,
  REPORT_STATUS_LABELS,
  type ReportType,
} from '@/lib/api/reports'

interface StatusTab {
  id: string
  label: string
  statuses: ReportStatus[]
}

const STATUS_TABS: StatusTab[] = [
  { id: 'queue', label: 'Cola activa', statuses: ['PENDING', 'IN_REVIEW'] },
  { id: 'action', label: 'Acción aplicada', statuses: ['RESOLVED_ACTION_TAKEN'] },
  { id: 'no-action', label: 'Sin acción', statuses: ['RESOLVED_NO_ACTION'] },
  { id: 'legal', label: 'Escalado legal', statuses: ['ESCALATED_LEGAL'] },
  { id: 'duplicate', label: 'Duplicados', statuses: ['DUPLICATE'] },
]

const REPORT_TYPE_FILTERS: ReportType[] = [
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

export default function AdminReportsPage() {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<string>('queue')
  const [typeFilter, setTypeFilter] = useState<ReportType | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<AdminReportRow[]>([])
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    if (!token) return
    const tab = STATUS_TABS.find((t) => t.id === activeTab)
    if (!tab) return
    setLoading(true)
    setError(null)
    try {
      const result = await getAdminReports(
        {
          status: tab.statuses,
          type: typeFilter === 'ALL' ? undefined : [typeFilter],
          page: 1,
          pageSize: 50,
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
  }, [activeTab, typeFilter, token])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Reportes de moderación</h1>
          <p className="text-white/60 mt-1 text-sm">
            Reportes priorizados por gravedad. CSAM y sospecha de menores
            aparecen primero (priority 2).
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
        >
          Refrescar
        </button>
      </div>

      <div className="mt-6 flex gap-2 border-b border-white/10 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
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
      </div>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <label className="text-xs text-white/60 uppercase tracking-wide">Tipo</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ReportType | 'ALL')}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-fuchsia-500"
        >
          <option value="ALL" className="bg-zinc-950">
            Todos
          </option>
          {REPORT_TYPE_FILTERS.map((t) => (
            <option key={t} value={t} className="bg-zinc-950">
              {REPORT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-white/50 mt-8">Cargando…</p>}
      {error && (
        <p className="text-red-400 mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="text-white/50 mt-10">No hay reportes en este estado.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <p className="mt-6 text-xs text-white/50">{total} reporte(s) total.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60 text-xs uppercase border-b border-white/10">
                <tr>
                  <th className="text-left py-3 pr-4">Prioridad</th>
                  <th className="text-left py-3 pr-4">Reportero</th>
                  <th className="text-left py-3 pr-4">Tipo</th>
                  <th className="text-left py-3 pr-4">Objetivo</th>
                  <th className="text-left py-3 pr-4">Motivo</th>
                  <th className="text-left py-3 pr-4">Creado</th>
                  <th className="text-left py-3 pr-4">Estado</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <ReportRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function ReportRow({ row }: { row: AdminReportRow }) {
  const createdFmt = new Date(row.createdAt).toLocaleString('es-CL')
  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td className="py-3 pr-4">
        <PriorityBadge priority={row.priority} />
      </td>
      <td className="py-3 pr-4">
        {row.reporter ? (
          <div>
            <div className="font-medium">{row.reporter.displayName}</div>
            <div className="text-xs text-white/50">
              @{row.reporter.username}
            </div>
          </div>
        ) : (
          <span className="text-xs text-white/40">Anónimo</span>
        )}
      </td>
      <td className="py-3 pr-4">
        <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-xs">
          {REPORT_TYPE_LABELS[row.reportType]}
        </span>
      </td>
      <td className="py-3 pr-4 text-xs">
        <div>{REPORT_TARGET_TYPE_LABELS[row.targetType]}</div>
        <code className="text-white/40 text-[10px]">{row.targetId.slice(0, 8)}…</code>
      </td>
      <td className="py-3 pr-4 max-w-[260px]">
        <p className="text-white/80 text-xs truncate" title={row.reason}>
          {row.reason}
        </p>
      </td>
      <td className="py-3 pr-4 text-white/70 text-xs whitespace-nowrap">
        {createdFmt}
      </td>
      <td className="py-3 pr-4">
        <StatusBadge status={row.status} />
      </td>
      <td className="py-3 text-right">
        <Link
          href={`/admin/reports/${row.id}`}
          className="text-white/80 hover:text-white underline text-sm"
        >
          Ver
        </Link>
      </td>
    </tr>
  )
}

function PriorityBadge({ priority }: { priority: number }) {
  const map: Record<number, string> = {
    0: 'bg-white/10 text-white/70',
    1: 'bg-amber-500/20 text-amber-200',
    2: 'bg-red-500/20 text-red-300',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md ${map[priority] ?? map[0]}`}>
      {PRIORITY_LABELS[priority] ?? 'Normal'}
    </span>
  )
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const map: Record<ReportStatus, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-200',
    IN_REVIEW: 'bg-blue-500/20 text-blue-200',
    RESOLVED_ACTION_TAKEN: 'bg-green-500/20 text-green-200',
    RESOLVED_NO_ACTION: 'bg-white/10 text-white/60',
    ESCALATED_LEGAL: 'bg-purple-500/20 text-purple-200',
    DUPLICATE: 'bg-white/10 text-white/50',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md ${map[status]}`}>
      {REPORT_STATUS_LABELS[status]}
    </span>
  )
}
