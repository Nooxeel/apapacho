'use client'

import type { SpinPhase } from './useSpinAnimation'

interface EdgeLightsProps {
  phase: SpinPhase
}

const LIGHT_COUNT = 20
const COLORS = ['#d946ef', '#fbbf24', '#d946ef', '#ffffff']

export function EdgeLights({ phase }: EdgeLightsProps) {
  const isActive = phase === 'spinning' || phase === 'crawling'

  return (
    <div className="absolute inset-[-14px] rounded-full pointer-events-none">
      {Array.from({ length: LIGHT_COUNT }).map((_, i) => {
        const angle = (i / LIGHT_COUNT) * 360
        const color = COLORS[i % COLORS.length]
        // Position lights on the circumference using trig
        // Relative to center of the container (50%, 50%)
        const rad = (angle * Math.PI) / 180
        const radius = 50 // percentage from center
        const x = 50 + radius * Math.sin(rad)
        const y = 50 - radius * Math.cos(rad)
        return (
          <div
            key={i}
            className="absolute w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
            style={{
              top: `${y}%`,
              left: `${x}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: color,
              boxShadow: isActive ? `0 0 6px ${color}, 0 0 12px ${color}` : `0 0 2px ${color}`,
              animation: isActive
                ? `light-chase ${phase === 'crawling' ? '1.5s' : '0.5s'} ease-in-out infinite`
                : `light-chase 3s ease-in-out infinite`,
              animationDelay: `${i * (1 / LIGHT_COUNT)}s`,
              opacity: isActive ? undefined : 0.3,
              transition: 'box-shadow 0.3s',
            }}
          />
        )
      })}
    </div>
  )
}
