'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import {
  DMCA_STATUS_LABELS,
  getDmcaQueue,
  type AdminDmcaQueueRow,
  type AdminDmcaStatus,
} from '@/lib/api/legal'

const STATUS_TABS: Array<{ id: string; label: string; statuses: AdminDmcaStatus[] }> = [
  { id: 'queue', label: 'Cola activa', statuses: ['PENDING', 'VALIDATED'] },
  { id: 'taken_down', label: 'Retirados', statuses: ['TAKEN_DOWN'] },
  { id: 'rejected', label: 'Rechazadas', statuses: ['REJECTED'] },
]

export default function AdminDmcaQueuePage() {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<string>('queue')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<AdminDmcaQueueRow[]>([])
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    const tab = STATUS_TABS.find((t) => t.id === activeTab)
    if (!tab) return
    setLoading(true)
    setError(null)
    try {
      const result = await getDmcaQueue(tab.statuses, 1, token ?? undefined)
      setRows(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la cola')
    } finally {
      setLoading(false)
    }
  }, [activeTab, token])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones DMCA</h1>
          <p className="text-white/60 mt-1 text-sm">
            SLA 7 días hábiles. Notificaciones vencidas aparecen marcadas en rojo.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
        >
          Refrescar
        </button>
      </div>

      <div className="mt-6 flex gap-2 border-b border-white/10">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-white/50 mt-8">Cargando…</p>}
      {error && (
        <p className="text-red-400 mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="text-white/50 mt-10">No hay notificaciones en este estado.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <p className="mt-6 text-xs text-white/50">{total} notificación(es) total.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60 text-xs uppercase border-b border-white/10">
                <tr>
                  <th className="text-left py-3 pr-4">Notificante</th>
                  <th className="text-left py-3 pr-4">URLs</th>
                  <th className="text-left py-3 pr-4">Recibida</th>
                  <th className="text-left py-3 pr-4">Vence</th>
                  <th className="text-left py-3 pr-4">SLA</th>
                  <th className="text-left py-3 pr-4">Estado</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <DmcaRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function DmcaRow({ row }: { row: AdminDmcaQueueRow }) {
  const receivedFmt = new Date(row.receivedAt).toLocaleString('es-CL')
  const dueFmt = new Date(row.dueBy).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td className="py-3 pr-4">
        <div>
          <div className="font-medium">{row.notifierName}</div>
          <div className="text-xs text-white/50">{row.notifierEmail}</div>
        </div>
      </td>
      <td className="py-3 pr-4 text-white/70 text-xs">
        {row.infringingUrls.length} URL(s) ·{' '}
        {row.infringingPostIds.length} post(s) resuelto(s)
      </td>
      <td className="py-3 pr-4 text-white/70 text-xs">{receivedFmt}</td>
      <td className="py-3 pr-4 text-white/70 text-xs">{dueFmt}</td>
      <td className="py-3 pr-4">
        <span
          className={
            row.isOverdue
              ? 'px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-xs'
              : 'text-white/60 text-xs'
          }
        >
          {row.isOverdue ? `+${row.hoursOverdue}h vencida` : `${-row.hoursOverdue}h restantes`}
        </span>
      </td>
      <td className="py-3 pr-4">
        <DmcaStatusBadge status={row.status} />
      </td>
      <td className="py-3 text-right">
        <Link
          href={`/admin/legal/dmca/${row.id}`}
          className="text-white/80 hover:text-white underline text-sm"
        >
          Ver
        </Link>
      </td>
    </tr>
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
    <span className={`text-xs px-2 py-0.5 rounded-md ${map[status]}`}>
      {DMCA_STATUS_LABELS[status]}
    </span>
  )
}
