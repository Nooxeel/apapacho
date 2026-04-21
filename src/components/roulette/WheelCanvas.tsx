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
      {/* Segments using clip-path triangles (proven approach) */}
      {prizes.map((prize, index) => {
        const startAngle = index * SEGMENT_ANGLE
        return (
          <div
            key={prize.id}
            className="absolute inset-0"
            style={{ transform: `rotate(${startAngle}deg)` }}
          >
            {/* Triangle segment */}
            <div
              className="absolute top-0 left-1/2 origin-bottom h-1/2"
              style={{
                width: '50%',
                transform: `translateX(-50%) rotate(${SEGMENT_ANGLE / 2}deg)`,
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                background: `linear-gradient(180deg, ${prize.segmentColors[1]} 0%, ${prize.segmentColors[0]} 100%)`,
              }}
            />
            {/* Label positioned in the segment */}
            <div
              className="absolute top-[15%] left-1/2 -translate-x-1/2 text-center pointer-events-none"
              style={{
                transform: `translateX(-50%) rotate(${SEGMENT_ANGLE / 2}deg)`,
              }}
            >
              <div className="text-xl md:text-2xl drop-shadow-lg">{prize.icon}</div>
              <div
                className="text-[8px] md:text-[10px] font-bold text-white whitespace-nowrap mt-0.5"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
              >
                {prize.label}
              </div>
            </div>
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
    </div>
  )
}
