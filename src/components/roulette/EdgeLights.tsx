'use client'

import type { SpinPhase } from './useSpinAnimation'

interface EdgeLightsProps {
  phase: SpinPhase
}

const LIGHT_COUNT = 24
const COLORS = ['#d946ef', '#fbbf24', '#d946ef', '#ffffff']

export function EdgeLights({ phase }: EdgeLightsProps) {
  const isActive = phase === 'spinning' || phase === 'crawling'

  return (
    <div className="absolute inset-[-12px] rounded-full pointer-events-none">
      {Array.from({ length: LIGHT_COUNT }).map((_, i) => {
        const angle = (i / LIGHT_COUNT) * 360
        const color = COLORS[i % COLORS.length]
        return (
          <div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${angle}deg) translateY(-${50}%) translateY(-206px)`,
              transformOrigin: '0 0',
              marginTop: '-5px',
              marginLeft: '-5px',
              backgroundColor: color,
              boxShadow: isActive ? `0 0 8px ${color}, 0 0 16px ${color}` : `0 0 3px ${color}`,
              animation: isActive
                ? `light-chase ${phase === 'crawling' ? '1.5s' : '0.6s'} ease-in-out infinite`
                : `light-chase 3s ease-in-out infinite`,
              animationDelay: `${i * (1 / LIGHT_COUNT)}s`,
              opacity: isActive ? undefined : 0.4,
              transition: 'box-shadow 0.3s, opacity 0.3s',
            }}
          />
        )
      })}
    </div>
  )
}
