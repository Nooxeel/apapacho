'use client'

import type { Prize } from './constants'
import { RARITY_CONFIG } from './constants'
import { Gift, Ticket, X } from 'lucide-react'

interface SpecialPrize {
  type: 'subscription' | 'discount'
  creatorUsername?: string | null
  discountPercent?: number
  spinId: string
  expiresAt: string
  message: string
}

interface WinnerModalProps {
  prize: Prize
  specialPrize: SpecialPrize | null
  onClose: () => void
}

export function WinnerModal({ prize, specialPrize, onClose }: WinnerModalProps) {
  const rarity = RARITY_CONFIG[prize.rarity]
  const isLegendary = prize.rarity === 'legendary'
  const isEpic = prize.rarity === 'epic'
  const isRetry = prize.type === 'RETRY'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative max-w-sm w-full rounded-2xl p-8 border-2 roulette-winner-bounce ${
          isLegendary ? 'roulette-screen-shake' : ''
        }`}
        style={{
          borderColor: rarity.color,
          backgroundColor: '#1a1a2e',
          boxShadow: `0 0 40px ${rarity.color}30, 0 0 80px ${rarity.color}15`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          {/* Prize icon */}
          <div className="text-7xl mb-4">{prize.icon}</div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-1">
            {isRetry ? 'Próxima vez...' :
             isLegendary ? 'LEGENDARIO!' :
             isEpic ? 'ÉPICO!' :
             'Felicidades!'}
          </h3>

          {/* Rarity badge */}
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
            style={{
              backgroundColor: `${rarity.color}20`,
              color: rarity.color,
              border: `1px solid ${rarity.color}50`,
            }}
          >
            {rarity.label}
          </span>

          {/* Prize name */}
          <p className="text-xl text-white/90 font-medium">{prize.label}</p>

          {/* Special prize details */}
          {specialPrize && (
            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/10">
              {specialPrize.type === 'subscription' ? (
                <>
                  <p className="text-lg text-emerald-400 font-bold flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5" />
                    Suscripción GRATIS
                  </p>
                  <p className="text-white/70 mt-2">
                    Un mes gratis a <span className="text-white font-bold">@{specialPrize.creatorUsername}</span>
                  </p>
                  <p className="text-xs text-white/40 mt-2">
                    Ve a &quot;Mis Premios&quot; para reclamar
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg text-orange-400 font-bold flex items-center justify-center gap-2">
                    <Ticket className="w-5 h-5" />
                    {specialPrize.discountPercent}% OFF
                  </p>
                  <p className="text-white/70 mt-2">
                    {specialPrize.creatorUsername
                      ? <>Para <span className="text-white font-bold">@{specialPrize.creatorUsername}</span></>
                      : 'Para cualquier creador'}
                  </p>
                  <p className="text-xs text-white/40 mt-2">
                    Expira el {new Date(specialPrize.expiresAt).toLocaleDateString('es-CL')}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Close CTA */}
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2.5 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors font-medium"
          >
            {isRetry ? 'Intentar de nuevo' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}
