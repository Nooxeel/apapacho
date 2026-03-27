'use client'

import type { SpinPhase } from './useSpinAnimation'

interface WheelPointerProps {
  tickActive: boolean
  phase: SpinPhase
}

export function WheelPointer({ tickActive, phase }: WheelPointerProps) {
  const isSpinning = phase === 'spinning' || phase === 'crawling'

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
      <div
        className={tickActive ? 'roulette-tick-flash' : ''}
        style={{
          width: 0,
          height: 0,
          borderLeft: '22px solid transparent',
          borderRight: '22px solid transparent',
          borderTop: '34px solid #d946ef',
          filter: isSpinning
            ? 'drop-shadow(0 0 12px rgba(217,70,239,0.7))'
            : 'drop-shadow(0 0 6px rgba(217,70,239,0.4))',
          transition: 'filter 0.3s',
        }}
      />
      {/* Small inner triangle for depth */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: '20px solid #f0abfc',
          marginTop: '2px',
        }}
      />
    </div>
  )
}
