'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui'
import { Sparkles, Trophy } from 'lucide-react'

interface Prize {
  id: number
  label: string
  color: string
  icon: string
  probability: number
}

const prizes: Prize[] = [
  { id: 1, label: '10 Puntos', color: '#d946ef', icon: '💎', probability: 0.05 },
  { id: 2, label: '5 Puntos', color: '#f43f5e', icon: '⭐', probability: 0.15 },
  { id: 3, label: '3 Puntos', color: '#ec4899', icon: '🎁', probability: 0.20 },
  { id: 4, label: '2 Puntos', color: '#a855f7', icon: '🎉', probability: 0.25 },
  { id: 5, label: '1 Punto', color: '#8b5cf6', icon: '✨', probability: 0.30 },
  { id: 6, label: 'Intenta de nuevo', color: '#6366f1', icon: '🔄', probability: 0.03 },
  { id: 7, label: '¡Jackpot! 50 Puntos', color: '#fbbf24', icon: '🏆', probability: 0.02 },
]

interface RouletteWheelProps {
  onSpin: () => Promise<number> // Returns prize ID
  canSpin: boolean
  points: number
}

export function RouletteWheel({ onSpin, canSpin, points }: RouletteWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [winner, setWinner] = useState<Prize | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return

    setIsSpinning(true)
    setWinner(null)

    try {
      const prizeId = await onSpin()
      const prizeIndex = prizes.findIndex(p => p.id === prizeId)
      
      if (prizeIndex !== -1) {
        // Calculate rotation to land on the prize
        const segmentAngle = 360 / prizes.length
        const targetAngle = prizeIndex * segmentAngle
        const spins = 5 // Number of full rotations
        const finalRotation = spins * 360 + (360 - targetAngle) + segmentAngle / 2

        setRotation(finalRotation)

        // Wait for animation to complete
        setTimeout(() => {
          setWinner(prizes[prizeIndex])
          setIsSpinning(false)
        }, 5000)
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
              transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
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
          <div className="bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border-2 border-fuchsia-500 rounded-2xl p-6 max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-3">{winner.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">¡Felicidades!</h3>
              <p className="text-xl text-white/80">Ganaste: {winner.label}</p>
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
      </div>
    </div>
  )
}
