'use client'

import { Globe, Lock, Star, DollarSign } from 'lucide-react'
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
  {
    value: 'ppv',
    label: 'De pago (PPV)',
    description: 'Compra única, visible solo para quienes paguen',
    icon: DollarSign,
    color: 'text-green-400',
  },
]

interface VisibilitySelectorProps {
  value: PostVisibility
  onChange: (value: PostVisibility) => void
  disabled?: boolean
  hasSubscriptionTiers?: boolean
  price?: number
  onPriceChange?: (price: number) => void
}

export function VisibilitySelector({
  value,
  onChange,
  disabled = false,
  hasSubscriptionTiers = true,
  price,
  onPriceChange,
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
            <div key={option.value}>
              <button
                type="button"
                onClick={() => !isDisabled && onChange(option.value)}
                disabled={isDisabled}
                className={`
                  relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all w-full
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
              
              {/* Price input for PPV */}
              {option.value === 'ppv' && isSelected && onPriceChange && (
                <div className="mt-3 ml-14 p-4 bg-surface-800 rounded-lg border border-surface-700">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio de venta (CLP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={price || ''}
                      onChange={(e) => onPriceChange(parseInt(e.target.value) || 0)}
                      placeholder="Ej: 2990"
                      min="100"
                      step="100"
                      className="w-full pl-8 pr-4 py-2 bg-surface-700 border border-surface-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Mínimo $100 CLP. Los compradores tendrán acceso permanente.
                  </p>
                </div>
              )}
            </div>
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
