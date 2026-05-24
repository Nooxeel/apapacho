'use client'

/**
 * Inactivity timeout configuration section for /settings/security.
 *
 * Lets the user pick how long their session can sit idle before they're
 * automatically logged out, or disable the feature altogether. Persisted to
 * the backend via PATCH /api/users/me/security-preferences.
 *
 * Allow-list matches the backend (15/30/60/120/240 minutes). The "Desactivado"
 * option maps to null on the wire, which clears the field.
 *
 * Ola 6 P2 — auth hardening.
 */

import { useState } from 'react'
import { Clock, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api/auth'

type Option = { value: number | null; label: string }

const OPTIONS: Option[] = [
  { value: null, label: 'Desactivado' },
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' },
]

export default function InactivityTimeoutSection() {
  const { user, updateUser } = useAuthStore()
  const current =
    (user as { inactivityTimeoutMinutes?: number | null } | null)
      ?.inactivityTimeoutMinutes ?? null
  const [selected, setSelected] = useState<number | null>(current)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(
    null
  )

  const isDirty = selected !== current

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      const result = await authApi.updateSecurityPreferences({
        inactivityTimeoutMinutes: selected,
      })
      updateUser({ inactivityTimeoutMinutes: result.inactivityTimeoutMinutes ?? null })
      setFeedback({ kind: 'ok', text: 'Preferencia guardada.' })
    } catch (err: any) {
      setFeedback({
        kind: 'err',
        text: err?.message || 'No pudimos guardar la preferencia.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#222] bg-[#101018] p-5">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 mt-0.5 text-fuchsia-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">
            Auto-cerrar sesión por inactividad
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Útil si usas la plataforma desde computadores compartidos. Cerraremos tu
            sesión automáticamente si no detectamos actividad durante el tiempo
            seleccionado.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const active = opt.value === selected
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={
                'px-3 py-2 text-sm rounded-lg border transition ' +
                (active
                  ? 'bg-fuchsia-500/20 border-fuchsia-500 text-white'
                  : 'bg-[#0a0a0a] border-[#222] text-gray-300 hover:border-fuchsia-500/50')
              }
              aria-pressed={active}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">
          {selected === null
            ? 'No se cerrará la sesión por inactividad.'
            : `Sesión cerrará tras ${OPTIONS.find((o) => o.value === selected)?.label.toLowerCase()} sin actividad.`}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:opacity-95"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar
        </button>
      </div>

      {feedback && (
        <p
          className={
            'mt-3 text-xs ' +
            (feedback.kind === 'ok' ? 'text-emerald-400' : 'text-red-400')
          }
        >
          {feedback.text}
        </p>
      )}
    </div>
  )
}
