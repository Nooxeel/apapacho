'use client'

import { prizes, SEGMENT_ANGLE } from './constants'

interface WheelCanvasProps {
  rotation: number
}

export function WheelCanvas({ rotation }: WheelCanvasProps) {
  return (
    <div
      className="absolute inset-0 rounded-full overflow-hidden"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* === Layer 1: Colored segment triangles === */}
      {prizes.map((prize, index) => {
        const startAngle = index * SEGMENT_ANGLE
        return (
          <div
            key={`seg-${prize.id}`}
            className="absolute inset-0"
            style={{ transform: `rotate(${startAngle}deg)` }}
          >
            <div
              className="absolute top-0 left-1/2 origin-bottom h-1/2"
              style={{
                width: '50%',
                transform: `translateX(-50%) rotate(${SEGMENT_ANGLE / 2}deg)`,
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                background: `linear-gradient(180deg, ${prize.segmentColors[1]} 0%, ${prize.segmentColors[0]} 100%)`,
              }}
            />
          </div>
        )
      })}

      {/* === Layer 2: Divider lines === */}
      {prizes.map((_, i) => (
        <div
          key={`line-${i}`}
          className="absolute top-0 left-1/2 h-1/2 origin-bottom"
          style={{
            transform: `rotate(${i * SEGMENT_ANGLE}deg)`,
            width: '2px',
            marginLeft: '-1px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.05))',
          }}
        />
      ))}

      {/* === Layer 3: Labels — ALWAYS horizontal via counter-rotation ===
       *
       * Strategy:
       * 1. Outer div rotates to point toward segment center (midDeg)
       * 2. Inner div sits at top:12% (near outer edge along that radius)
       * 3. Inner div counter-rotates by -(midDeg + wheelRotation) to stay
       *    perfectly horizontal regardless of wheel position
       */}
      {prizes.map((prize, index) => {
        const midDeg = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
        return (
          <div
            key={`label-${prize.id}`}
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `rotate(${midDeg}deg)` }}
          >
            <div
              className="absolute left-1/2 flex flex-col items-center"
              style={{
                top: '12%',
                transform: `translateX(-50%) rotate(${-(midDeg + rotation)}deg)`,
              }}
            >
              <span className="text-sm md:text-base leading-none drop-shadow-lg">
                {prize.icon}
              </span>
              <span
                className="text-[7px] md:text-[9px] font-bold text-white whitespace-nowrap leading-tight mt-0.5"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.9)',
                }}
              >
                {prize.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
