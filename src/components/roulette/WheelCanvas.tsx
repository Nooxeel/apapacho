'use client'

import { prizes, SEGMENT_ANGLE } from './constants'

interface WheelCanvasProps {
  rotation: number
}

export function WheelCanvas({ rotation }: WheelCanvasProps) {
  // Build conic-gradient stops — each segment gets a flat color (no gradient between segments)
  const conicStops = prizes.map((prize, i) => {
    const startPct = (i / prizes.length) * 100
    const endPct = ((i + 1) / prizes.length) * 100
    // Two stops at same position = hard edge (no blending between segments)
    return `${prize.segmentColors[1]} ${startPct}% ${endPct}%`
  }).join(', ')

  return (
    <div
      className="absolute inset-0 rounded-full overflow-hidden"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* === Layer 1: Conic gradient fills all 360° with zero gaps === */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${conicStops})`,
        }}
      />

      {/* === Layer 2: Radial darkening toward center for depth === */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, transparent 70%)',
        }}
      />

      {/* === Layer 3: SVG divider lines — pixel-perfect alignment === */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
        {prizes.map((_, i) => {
          const angleDeg = i * SEGMENT_ANGLE - 90 // SVG: 0° is 3 o'clock, we need 12 o'clock
          const angleRad = (angleDeg * Math.PI) / 180
          const x2 = 100 + 100 * Math.cos(angleRad)
          const y2 = 100 + 100 * Math.sin(angleRad)
          return (
            <line
              key={`line-${i}`}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="0.8"
            />
          )
        })}
      </svg>

      {/* === Layer 4: Labels — always horizontal === */}
      {prizes.map((prize, index) => {
        const midDeg = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
        const midRad = ((midDeg - 90) * Math.PI) / 180
        // Position at 65% of radius from center (in the outer third of segment)
        const r = 65
        const cx = 50 + (r / 100) * 50 * Math.cos(midRad)
        const cy = 50 + (r / 100) * 50 * Math.sin(midRad)
        return (
          <div
            key={`label-${prize.id}`}
            className="absolute pointer-events-none flex flex-col items-center"
            style={{
              top: `${cy}%`,
              left: `${cx}%`,
              transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
            }}
          >
            <span className="text-sm md:text-base leading-none drop-shadow-lg">
              {prize.icon}
            </span>
            <span
              className="text-[7px] md:text-[9px] font-bold text-white whitespace-nowrap leading-tight mt-0.5"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.8)',
              }}
            >
              {prize.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
