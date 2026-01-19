'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui'
import { Sparkles, Trophy, Gift, Ticket, Star } from 'lucide-react'

interface Prize {
  id: number
  label: string
  color: string
  icon: string
  probability: number
  type: 'POINTS' | 'SUBSCRIPTION' | 'DISCOUNT' | 'RETRY'
}

const prizes: Prize[] = [
  { id: 1, label: '10 Puntos', color: '#d946ef', icon: '💎', probability: 0.05, type: 'POINTS' },
  { id: 2, label: '5 Puntos', color: '#f43f5e', icon: '⭐', probability: 0.13, type: 'POINTS' },
  { id: 3, label: '3 Puntos', color: '#ec4899', icon: '🎁', probability: 0.18, type: 'POINTS' },
  { id: 4, label: '2 Puntos', color: '#a855f7', icon: '🎉', probability: 0.23, type: 'POINTS' },
  { id: 5, label: '1 Punto', color: '#8b5cf6', icon: '✨', probability: 0.28, type: 'POINTS' },
  { id: 6, label: 'Intenta de nuevo', color: '#6366f1', icon: '🔄', probability: 0.05, type: 'RETRY' },
  { id: 7, label: '50 Puntos', color: '#fbbf24', icon: '🏆', probability: 0.02, type: 'POINTS' },
  { id: 8, label: 'Sub @imperfecto', color: '#10b981', icon: '🎁', probability: 0.02, type: 'SUBSCRIPTION' },
  { id: 9, label: '50% @gatitaveve', color: '#f97316', icon: '🎟️', probability: 0.03, type: 'DISCOUNT' },
  { id: 10, label: '25% cualquier', color: '#06b6d4', icon: '🎫', probability: 0.01, type: 'DISCOUNT' },
]

interface SpecialPrize {
  type: 'subscription' | 'discount'
  creatorUsername?: string | null
  discountPercent?: number
  spinId: string
  expiresAt: string
  message: string
}

interface SpinResult {
  prizeId: number
  prizeLabel: string
  prizeType: string
  pointsWon: number
  newPoints: number
  specialPrize?: SpecialPrize
}

interface RouletteWheelProps {
  onSpin: () => Promise<SpinResult>
  canSpin: boolean
  points: number
  onPrizeWon?: (prize: SpecialPrize) => void
}

export function RouletteWheel({ onSpin, canSpin, points, onPrizeWon }: RouletteWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [winner, setWinner] = useState<Prize | null>(null)
  const [specialPrize, setSpecialPrize] = useState<SpecialPrize | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return

    setIsSpinning(true)
    setWinner(null)
    setSpecialPrize(null)

    try {
      const result = await onSpin()
      const prizeIndex = prizes.findIndex(p => p.id === result.prizeId)
      
      if (prizeIndex !== -1) {
        // Calculate rotation to land on the prize
        const segmentAngle = 360 / prizes.length
        const targetAngle = prizeIndex * segmentAngle
        const spins = 8 // Number of full rotations
        const finalRotation = spins * 360 + (360 - targetAngle) + segmentAngle / 2

        setRotation(finalRotation)

        // Wait for animation to complete
        setTimeout(() => {
          setWinner(prizes[prizeIndex])
          if (result.specialPrize) {
            setSpecialPrize(result.specialPrize)
            onPrizeWon?.(result.specialPrize)
          }
          setIsSpinning(false)
        }, 6000)
      }
    } catch (error) {
      console.error('Error spinning:', error)
      setIsSpinning(false)
    }
  }

  const segmentAngle = 360 / prizes.length

  return (
    <div className="flex flex-col items-center">
      {/* Points Display */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30">
          <Sparkles className="h-6 w-6 text-fuchsia-400" />
          <div>
            <p className="text-sm text-white/60">Tus Puntos</p>
            <p className="text-3xl font-bold text-white">{points}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/60">
          Necesitas <span className="font-bold text-fuchsia-400">10 puntos</span> para canjear un premio
        </p>
      </div>

      {/* Roulette Wheel Container */}
      <div className="relative mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-fuchsia-500 drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <div className="relative w-[400px] h-[400px]">
          <div
            ref={wheelRef}
            className="absolute inset-0 rounded-full overflow-hidden shadow-2xl border-8 border-white/10"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {prizes.map((prize, index) => {
              const startAngle = index * segmentAngle
              return (
                <div
                  key={prize.id}
                  className="absolute inset-0"
                  style={{
                    transform: `rotate(${startAngle}deg)`,
                  }}
                >
                  <div
                    className="absolute top-0 left-1/2 origin-bottom h-1/2 w-1/2 -translate-x-1/2"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 50% 100%)`,
                      backgroundColor: prize.color,
                      transform: `rotate(${segmentAngle / 2}deg)`,
                    }}
                  >
                    <div
                      className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
                      style={{
                        transform: `rotate(-${startAngle + segmentAngle / 2}deg)`,
                      }}
                    >
                      <div className="text-3xl mb-1">{prize.icon}</div>
                      <div className="text-xs font-bold text-white whitespace-nowrap px-2">
                        {prize.label}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Center Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleSpin}
              disabled={!canSpin || isSpinning}
              className={`
                w-24 h-24 rounded-full font-bold text-white shadow-2xl
                bg-gradient-to-br from-fuchsia-600 to-purple-600
                border-4 border-white
                transition-all duration-200
                ${canSpin && !isSpinning ? 'hover:scale-110 hover:shadow-fuchsia-500/50' : 'opacity-50 cursor-not-allowed'}
              `}
            >
              {isSpinning ? '...' : 'GIRAR'}
            </button>
          </div>
        </div>
      </div>

      {/* Spin Button (mobile alternative) */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSpin}
        disabled={!canSpin || isSpinning}
        className="mb-6"
      >
        {isSpinning ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
            Girando...
          </>
        ) : (
          <>
            <Trophy className="mr-2 h-5 w-5" />
            {canSpin ? 'Girar Ruleta (10 puntos)' : 'No tienes suficientes puntos'}
          </>
        )}
      </Button>

      {/* Winner Display */}
      {winner && (
        <div className="animate-bounce-in">
          <div className={`border-2 rounded-2xl p-6 max-w-md ${
            winner.type === 'SUBSCRIPTION' 
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500' 
              : winner.type === 'DISCOUNT'
              ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500'
              : winner.type === 'RETRY'
              ? 'bg-gradient-to-r from-slate-500/20 to-gray-500/20 border-slate-500'
              : 'bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500'
          }`}>
            <div className="text-center">
              <div className="text-6xl mb-3">{winner.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {winner.type === 'SUBSCRIPTION' ? '🎉 ¡PREMIO ESPECIAL!' : 
                 winner.type === 'DISCOUNT' ? '🎟️ ¡CUPÓN GANADO!' :
                 winner.type === 'RETRY' ? '😅 Próxima vez...' :
                 '¡Felicidades!'}
              </h3>
              <p className="text-xl text-white/80">{winner.label}</p>
              
              {/* Special prize details */}
              {specialPrize && (
                <div className="mt-4 p-4 bg-black/30 rounded-xl">
                  {specialPrize.type === 'subscription' ? (
                    <>
                      <p className="text-lg text-emerald-400 font-bold">
                        <Gift className="inline h-5 w-5 mr-2" />
                        ¡Suscripción GRATIS!
                      </p>
                      <p className="text-white/70 mt-2">
                        Ganaste un mes gratis a <span className="text-white font-bold">@{specialPrize.creatorUsername}</span>
                      </p>
                      <p className="text-xs text-white/50 mt-2">
                        Ve a &quot;Mis Premios&quot; para reclamar tu suscripción
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg text-orange-400 font-bold">
                        <Ticket className="inline h-5 w-5 mr-2" />
                        ¡Cupón de {specialPrize.discountPercent}% OFF!
                      </p>
                      <p className="text-white/70 mt-2">
                        {specialPrize.creatorUsername 
                          ? <>Válido para <span className="text-white font-bold">@{specialPrize.creatorUsername}</span></>
                          : 'Válido para cualquier creador'}
                      </p>
                      <p className="text-xs text-white/50 mt-2">
                        Expira el {new Date(specialPrize.expiresAt).toLocaleDateString('es-CL')}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-sm text-white/60">
          Cada giro cuesta <span className="font-bold text-fuchsia-400">10 puntos</span>.
          Gana más puntos iniciando sesión diariamente (+1 punto por día).
        </p>
        <p className="text-xs text-white/40 mt-2">
          🎁 Premios especiales: Suscripciones gratis y cupones de descuento
        </p>
      </div>
    </div>
  )
}
