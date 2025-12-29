'use client'

import { Globe, Lock, Star } from 'lucide-react'
import type { PostVisibility } from '@/types'

interface VisibilityOption {
  value: PostVisibility
  label: string
  description: string
  icon: typeof Globe
  color: string
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    value: 'public',
    label: 'Público',
    description: 'Visible para todos, incluso sin cuenta',
    icon: Globe,
    color: 'text-blue-400',
  },
  {
    value: 'authenticated',
    label: 'Solo usuarios',
    description: 'Requiere iniciar sesión para ver',
    icon: Lock,
    color: 'text-yellow-400',
  },
  {
    value: 'subscribers',
    label: 'Solo suscriptores',
    description: 'Requiere suscripción activa',
    icon: Star,
    color: 'text-fuchsia-400',
  },
]

interface VisibilitySelectorProps {
  value: PostVisibility
  onChange: (value: PostVisibility) => void
  disabled?: boolean
  hasSubscriptionTiers?: boolean
}

export function VisibilitySelector({
  value,
  onChange,
  disabled = false,
  hasSubscriptionTiers = true,
}: VisibilitySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-200">
        Privacidad del contenido
      </label>

      <div className="grid gap-3">
        {VISIBILITY_OPTIONS.map((option) => {
          const Icon = option.icon
          const isDisabled =
            disabled || (option.value === 'subscribers' && !hasSubscriptionTiers)
          const isSelected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !isDisabled && onChange(option.value)}
              disabled={isDisabled}
              className={`
                relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-surface-700 bg-surface-800 hover:border-surface-600'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Icon */}
              <div
                className={`
                flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                ${isSelected ? 'bg-primary-500/20' : 'bg-surface-700'}
              `}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-400' : option.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary-500 text-white rounded-full">
                      Seleccionado
                    </span>
                  )}
                  {option.value === 'subscribers' && !hasSubscriptionTiers && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                      Sin tiers
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-400">{option.description}</p>
              </div>

              {/* Radio indicator */}
              <div
                className={`
                flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-surface-600 bg-surface-800'
                }
              `}
              >
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          )
        })}
      </div>

      {!hasSubscriptionTiers && (
        <p className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <strong>Nota:</strong> Necesitas crear al menos un tier de suscripción para poder usar la
          opción "Solo suscriptores".
        </p>
      )}
    </div>
  )
}
