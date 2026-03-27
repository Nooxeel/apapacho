'use client'

import { useState } from 'react'
import { Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui'
import { prizes, SPIN_COST } from './constants'
import { useSpinAnimation } from './useSpinAnimation'
import { useConfetti } from './useConfetti'
import { useSpinHistory } from './useSpinHistory'
import { WheelCanvas } from './WheelCanvas'
import { WheelPointer } from './WheelPointer'
import { CenterButton } from './CenterButton'
import { EdgeLights } from './EdgeLights'
import { ConfettiOverlay } from './ConfettiOverlay'
import { NearMissIndicator } from './NearMissIndicator'
import { SpinHistory } from './SpinHistory'
import { StreakCounter } from './StreakCounter'
import { WinnerModal } from './WinnerModal'
import type { Prize } from './constants'
import './roulette.css'

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
  const { rotation, phase, tickActive, isNearMiss, startSpin } = useSpinAnimation()
  const { particles, trigger: triggerConfetti } = useConfetti()
  const { history, addSpin } = useSpinHistory()
  const [winner, setWinner] = useState<Prize | null>(null)
  const [specialPrize, setSpecialPrize] = useState<SpecialPrize | null>(null)

  const isIdle = phase === 'idle'

  const handleSpin = async () => {
    if (!canSpin || !isIdle) return

    setWinner(null)
    setSpecialPrize(null)

    try {
      const result = await onSpin()
      const prize = prizes.find(p => p.id === result.prizeId)
      if (!prize) return

      await startSpin(result.prizeId)

      // Animation done — show results
      setWinner(prize)
      addSpin(prize)

      // Trigger confetti based on rarity
      if (prize.rarity === 'legendary') {
        triggerConfetti('explosion')
      } else if (prize.rarity === 'epic') {
        triggerConfetti('confetti')
      } else if (prize.type !== 'RETRY') {
        triggerConfetti('sparkle')
      }

      if (result.specialPrize) {
        setSpecialPrize(result.specialPrize)
        onPrizeWon?.(result.specialPrize)
      }
    } catch (error) {
      console.error('Error spinning:', error)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Streak */}
      <StreakCounter />

      {/* Points Display */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30">
          <Sparkles className="h-6 w-6 text-fuchsia-400" />
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Tus Puntos</p>
            <p className="text-3xl font-bold text-white tabular-nums">{points}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-white/50">
          Cuesta <span className="font-bold text-fuchsia-400">{SPIN_COST} puntos</span> por giro
        </p>
      </div>

      {/* Spin History */}
      <SpinHistory history={history} />

      {/* Wheel Container */}
      <div
        className={`relative mb-6 ${winner?.rarity === 'legendary' ? 'roulette-screen-shake' : ''}`}
      >
        {/* Pointer */}
        <WheelPointer tickActive={tickActive} phase={phase} />

        {/* Edge lights */}
        <EdgeLights phase={phase} />

        {/* Main wheel */}
        <div
          className={`relative w-[min(400px,85vw)] aspect-square rounded-full border-[6px] ${
            !isIdle ? 'roulette-neon-ring border-fuchsia-500/60' : 'border-white/15'
          }`}
          style={{
            transition: 'border-color 0.5s',
            boxShadow: !isIdle
              ? '0 0 40px rgba(217,70,239,0.3), inset 0 0 40px rgba(217,70,239,0.1)'
              : '0 0 20px rgba(0,0,0,0.5)',
          }}
        >
          <WheelCanvas rotation={rotation} />
          <CenterButton canSpin={canSpin} phase={phase} onSpin={handleSpin} />
        </div>

        {/* Confetti */}
        <ConfettiOverlay particles={particles} />

        {/* Near miss */}
        <NearMissIndicator visible={isNearMiss} />
      </div>

      {/* Mobile Spin Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSpin}
        disabled={!canSpin || !isIdle}
        className="mb-4 md:hidden"
      >
        {!isIdle ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
            Girando...
          </>
        ) : (
          <>
            <Trophy className="mr-2 h-5 w-5" />
            {canSpin ? `Girar (${SPIN_COST} pts)` : 'Puntos insuficientes'}
          </>
        )}
      </Button>

      {/* Info */}
      <div className="text-center max-w-md">
        <p className="text-xs text-white/40">
          Gana puntos iniciando sesión diariamente (+1 por día)
        </p>
      </div>

      {/* Winner Modal */}
      {winner && (
        <WinnerModal
          prize={winner}
          specialPrize={specialPrize}
          onClose={() => setWinner(null)}
        />
      )}
    </div>
  )
}
