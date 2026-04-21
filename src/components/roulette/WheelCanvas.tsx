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
      {/* Colored segments using clip-path triangles */}
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

      {/* Divider lines */}
      {prizes.map((_, i) => (
        <div
          key={`line-${i}`}
          className="absolute top-0 left-1/2 h-1/2 origin-bottom"
          style={{
            transform: `rotate(${i * SEGMENT_ANGLE}deg)`,
            width: '1.5px',
            marginLeft: '-0.75px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.05))',
          }}
        />
      ))}

      {/* Labels — positioned with trig, counter-rotated to stay upright */}
      {prizes.map((prize, index) => {
        const midAngleDeg = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
        const midAngleRad = (midAngleDeg * Math.PI) / 180
        // Place label at ~32% from center (sweet spot inside segment)
        const r = 32
        const x = 50 + r * Math.sin(midAngleRad)
        const y = 50 - r * Math.cos(midAngleRad)
        return (
          <div
            key={`label-${prize.id}`}
            className="absolute pointer-events-none text-center"
            style={{
              top: `${y}%`,
              left: `${x}%`,
              transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
            }}
          >
            <div className="text-lg md:text-xl drop-shadow-lg leading-none">{prize.icon}</div>
            <div
              className="text-[7px] md:text-[9px] font-bold text-white whitespace-nowrap mt-0.5 leading-tight"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)' }}
            >
              {prize.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
