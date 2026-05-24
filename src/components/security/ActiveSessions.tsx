'use client'

/**
 * ActiveSessions — panel "Mis sesiones activas" en /settings/security.
 *
 * Ley 21.719 Ola 5B. Permite al titular:
 *   - Ver dónde está logueada su cuenta (device label, IP enmascarada, última
 *     actividad).
 *   - Cerrar una sesión remota individual.
 *   - Cerrar TODAS las otras sesiones excepto la actual (útil tras cambio
 *     de contraseña o sospecha de acceso no autorizado).
 *
 * La sesión actual viene marcada con `isCurrent: true` desde el backend y NO
 * se puede revocar desde aquí — el usuario debe usar el botón "Cerrar
 * sesión" del menú principal.
 */

import { useCallback, useEffect, useState } from 'react'
import {
  Loader2,
  Laptop,
  Smartphone,
  Tablet,
  AlertTriangle,
  X,
} from 'lucide-react'
import { sessionsApi, type ActiveSession } from '@/lib/api/sessions'

type DeviceIcon = 'mobile' | 'tablet' | 'desktop'

function detectDeviceIcon(label: string): DeviceIcon {
  const lower = label.toLowerCase()
  if (lower.includes('ipad') || lower.includes('tablet')) return 'tablet'
  if (
    lower.includes('iphone') ||
    lower.includes('ios') ||
    lower.includes('android') ||
    lower.includes('mobile')
  ) {
    return 'mobile'
  }
  return 'desktop'
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = Math.max(0, now - then)
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'hace unos segundos'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} día${days === 1 ? '' : 's'}`
  const months = Math.floor(days / 30)
  if (months < 12) return `hace ${months} mes${months === 1 ? '' : 'es'}`
  const years = Math.floor(months / 12)
  return `hace ${years} año${years === 1 ? '' : 's'}`
}

function DeviceIconCmp({ icon }: { icon: DeviceIcon }) {
  const className = 'h-5 w-5 text-gray-300'
  if (icon === 'mobile') return <Smartphone className={className} aria-hidden="true" />
  if (icon === 'tablet') return <Tablet className={className} aria-hidden="true" />
  return <Laptop className={className} aria-hidden="true" />
}

export default function ActiveSessions() {
  const [sessions, setSessions] = useState<ActiveSession[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmAllOpen, setConfirmAllOpen] = useState(false)
  const [busyAll, setBusyAll] = useState(false)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const data = await sessionsApi.list()
      setSessions(data.sessions)
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar las sesiones activas')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleTerminate(session: ActiveSession) {
    if (session.isCurrent || busyId) return
    setBusyId(session.id)
    setError(null)
    setActionMsg(null)
    try {
      await sessionsApi.terminate(session.id)
      setActionMsg(`Sesión "${session.deviceLabel}" cerrada.`)
      await load(true)
    } catch (err: any) {
      setError(err?.message || 'No se pudo cerrar la sesión')
    } finally {
      setBusyId(null)
    }
  }

  async function handleTerminateAllOthers() {
    if (busyAll) return
    setBusyAll(true)
    setError(null)
    setActionMsg(null)
    try {
      const { revokedCount } = await sessionsApi.terminateAllOthers()
      setActionMsg(
        revokedCount === 0
          ? 'No había otras sesiones que cerrar.'
          : `Se cerraron ${revokedCount} sesione${revokedCount === 1 ? '' : 's'}.`
      )
      setConfirmAllOpen(false)
      await load(true)
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cerrar las sesiones')
    } finally {
      setBusyAll(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="text-sm">Cargando sesiones activas…</span>
      </div>
    )
  }

  if (error && !sessions) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
        No hay sesiones activas.
      </div>
    )
  }

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length

  return (
    <div className="space-y-3">
      {actionMsg && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300"
        >
          {actionMsg}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <ul className="space-y-2">
        {sessions.map((s) => {
          const icon = detectDeviceIcon(s.deviceLabel)
          const isBusy = busyId === s.id
          return (
            <li
              key={s.id}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mt-1 flex-shrink-0">
                <DeviceIconCmp icon={icon} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{s.deviceLabel}</p>
                  {s.isCurrent && (
                    <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-medium text-fuchsia-300">
                      Esta sesión
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {s.ipAddress ? `IP ${s.ipAddress} · ` : ''}
                  Última actividad: {formatRelative(s.lastUsedAt)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Iniciada el{' '}
                  {new Date(s.createdAt).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                type="button"
                disabled={s.isCurrent || isBusy}
                onClick={() => handleTerminate(s)}
                aria-label={
                  s.isCurrent
                    ? 'No puedes cerrar la sesión actual desde aquí'
                    : `Cerrar sesión en ${s.deviceLabel}`
                }
                className="flex-shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isBusy ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    Cerrando…
                  </span>
                ) : (
                  'Cerrar sesión'
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {otherSessionsCount > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setConfirmAllOpen(true)}
            className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10"
          >
            Cerrar todas las otras sesiones ({otherSessionsCount})
          </button>
        </div>
      )}

      {confirmAllOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-all-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busyAll) setConfirmAllOpen(false)
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#111] p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="h-6 w-6 flex-shrink-0 text-yellow-400"
                aria-hidden="true"
              />
              <div className="flex-1">
                <h3
                  id="confirm-all-title"
                  className="text-lg font-semibold text-white"
                >
                  ¿Cerrar todas las otras sesiones?
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  Esto cerrará la sesión en {otherSessionsCount} dispositivo
                  {otherSessionsCount === 1 ? '' : 's'} además de este. Tu
                  sesión actual quedará activa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !busyAll && setConfirmAllOpen(false)}
                aria-label="Cerrar diálogo"
                className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={busyAll}
                onClick={() => setConfirmAllOpen(false)}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busyAll}
                onClick={handleTerminateAllOthers}
                className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                {busyAll ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    Cerrando…
                  </span>
                ) : (
                  'Sí, cerrar las otras sesiones'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
