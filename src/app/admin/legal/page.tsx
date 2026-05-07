'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { getArcopQueue, getDmcaQueue } from '@/lib/api/legal'

interface DashboardCounts {
  arcopPending: number
  arcopOverdue: number
  arcopInProgress: number
  dmcaPending: number
  dmcaOverdue: number
}

const ZERO_COUNTS: DashboardCounts = {
  arcopPending: 0,
  arcopOverdue: 0,
  arcopInProgress: 0,
  dmcaPending: 0,
  dmcaOverdue: 0,
}

export default function AdminLegalDashboardPage() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [counts, setCounts] = useState<DashboardCounts>(ZERO_COUNTS)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [arcopPending, arcopInProgress, dmcaQueue] = await Promise.all([
          getArcopQueue(['PENDING'], 1, token ?? undefined),
          getArcopQueue(['IN_PROGRESS'], 1, token ?? undefined),
          getDmcaQueue(['PENDING', 'VALIDATED'], 1, token ?? undefined),
        ])
        if (cancelled) return
        const overdueArcop =
          arcopPending.items.filter((r) => r.isOverdue).length +
          arcopInProgress.items.filter((r) => r.isOverdue).length
        const overdueDmca = dmcaQueue.items.filter((n) => n.isOverdue).length
        setCounts({
          arcopPending: arcopPending.total,
          arcopInProgress: arcopInProgress.total,
          arcopOverdue: overdueArcop,
          dmcaPending: dmcaQueue.total,
          dmcaOverdue: overdueDmca,
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar el dashboard')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Legal &amp; privacidad</h1>
      <p className="text-white/60 mt-2 text-sm">
        Cumplimiento Ley 21.719 (datos personales) y Ley 17.336 (DMCA).
      </p>

      {loading && <p className="text-white/50 mt-8">Cargando…</p>}
      {error && (
        <p className="text-red-400 mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link
            href="/admin/legal/arcop"
            className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition"
          >
            <h2 className="text-lg font-semibold">Solicitudes ARCO-P</h2>
            <p className="text-sm text-white/60 mt-1">
              Acceso, Rectificación, Cancelación, Oposición, Portabilidad. SLA 15 días hábiles.
            </p>
            <div className="mt-4 flex gap-3 flex-wrap">
              <CountBadge label="Pendientes" value={counts.arcopPending} />
              <CountBadge label="En proceso" value={counts.arcopInProgress} tone="info" />
              <CountBadge label="Vencidas" value={counts.arcopOverdue} tone="danger" />
            </div>
          </Link>

          <Link
            href="/admin/legal/dmca"
            className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition"
          >
            <h2 className="text-lg font-semibold">Notificaciones DMCA</h2>
            <p className="text-sm text-white/60 mt-1">
              Notificaciones de propiedad intelectual. SLA 7 días hábiles.
            </p>
            <div className="mt-4 flex gap-3 flex-wrap">
              <CountBadge label="Pendientes" value={counts.dmcaPending} />
              <CountBadge label="Vencidas" value={counts.dmcaOverdue} tone="danger" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}

function CountBadge({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: number
  tone?: 'neutral' | 'info' | 'danger'
}) {
  const cls =
    tone === 'danger'
      ? 'bg-red-500/20 text-red-200 border-red-500/40'
      : tone === 'info'
        ? 'bg-blue-500/20 text-blue-200 border-blue-500/40'
        : 'bg-white/10 text-white/80 border-white/20'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${cls}`}>
      <span>{label}</span>
      <strong className="font-semibold">{value}</strong>
    </span>
  )
}

