'use client'

import type { SpinPhase } from './useSpinAnimation'

interface CenterButtonProps {
  canSpin: boolean
  phase: SpinPhase
  onSpin: () => void
}

export function CenterButton({ canSpin, phase, onSpin }: CenterButtonProps) {
  const isIdle = phase === 'idle'
  const isSpinning = !isIdle

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <button
        onClick={onSpin}
        disabled={!canSpin || isSpinning}
        className={`
          w-24 h-24 md:w-28 md:h-28 rounded-full font-bold text-white
          bg-gradient-to-br from-fuchsia-600 via-purple-600 to-fuchsia-700
          border-4 border-white/90
          transition-all duration-300
          ${canSpin && isIdle ? 'roulette-center-pulse hover:scale-110 cursor-pointer' : ''}
          ${!canSpin ? 'opacity-40 cursor-not-allowed' : ''}
          ${isSpinning ? 'opacity-70' : ''}
        `}
        style={{
          boxShadow: canSpin && isIdle
            ? '0 0 30px rgba(217,70,239,0.5), inset 0 2px 10px rgba(255,255,255,0.2)'
            : '0 0 10px rgba(217,70,239,0.2)',
        }}
      >
        {isSpinning ? (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <span className={`text-lg md:text-xl tracking-wider ${canSpin ? 'roulette-spin-glow' : ''}`}>
            GIRAR
          </span>
        )}
      </button>
    </div>
  )
}
