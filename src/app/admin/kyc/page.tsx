'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import {
  getKycQueue,
  type KycQueueRow,
  type KycQueueResponse,
} from '@/lib/api'

const STATUS_TABS: Array<{ id: string; label: string; statuses: string[] }> = [
  { id: 'queue', label: 'Cola (pendientes)', statuses: ['SUBMITTED', 'IN_REVIEW'] },
  { id: 'approved', label: 'Aprobadas', statuses: ['APPROVED'] },
  { id: 'rejected', label: 'Rechazadas / resubmit', statuses: ['REJECTED', 'RESUBMISSION_REQUIRED'] },
]

export default function AdminKycQueuePage() {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<string>('queue')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<KycQueueRow[]>([])

  const load = useCallback(async () => {
    const tab = STATUS_TABS.find((t) => t.id === activeTab)
    if (!tab) return
    setLoading(true)
    setError(null)
    try {
      const res: KycQueueResponse = await getKycQueue(tab.statuses, token ?? undefined)
      setRows(res.items)
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
          <h1 className="text-3xl font-bold">Cola de verificación KYC</h1>
          <p className="text-white/60 mt-1 text-sm">
            SLA objetivo: 48 horas hábiles. Las submissions con más de 36h aparecen marcadas en
            rojo.
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
        <p className="text-white/50 mt-10">No hay submissions en este estado.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60 text-xs uppercase border-b border-white/10">
              <tr>
                <th className="text-left py-3 pr-4">Creador</th>
                <th className="text-left py-3 pr-4">Nombre legal</th>
                <th className="text-left py-3 pr-4">Edad</th>
                <th className="text-left py-3 pr-4">Enviado</th>
                <th className="text-left py-3 pr-4">Horas</th>
                <th className="text-left py-3 pr-4">Estado</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <QueueRow key={row.submissionId} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function QueueRow({ row }: { row: KycQueueRow }) {
  const dateFormatted = new Date(row.submittedAt).toLocaleString('es-CL')
  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">{row.creator.displayName}</div>
            <div className="text-xs text-white/50">@{row.creator.username}</div>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4">{row.fullLegalName}</td>
      <td className="py-3 pr-4">{row.ageYears}</td>
      <td className="py-3 pr-4 text-white/70">{dateFormatted}</td>
      <td className="py-3 pr-4">
        <span
          className={
            row.isOverdue
              ? 'px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-xs'
              : 'text-white/70'
          }
        >
          {row.hoursSinceSubmit}h
        </span>
      </td>
      <td className="py-3 pr-4">
        <StatusBadge status={row.decision ?? row.status} />
      </td>
      <td className="py-3 text-right">
        <Link
          href={`/admin/kyc/${row.submissionId}`}
          className="text-white/80 hover:text-white underline text-sm"
        >
          Revisar
        </Link>
      </td>
    </tr>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUBMITTED: 'bg-blue-500/20 text-blue-200',
    IN_REVIEW: 'bg-yellow-500/20 text-yellow-200',
    APPROVED: 'bg-green-500/20 text-green-200',
    REJECTED: 'bg-red-500/20 text-red-200',
    RESUBMISSION_REQUIRED: 'bg-amber-500/20 text-amber-200',
    PENDING: 'bg-white/10 text-white/70',
  }
  const cls = map[status] ?? 'bg-white/10 text-white/70'
  return <span className={`text-xs px-2 py-0.5 rounded-md ${cls}`}>{status}</span>
}
