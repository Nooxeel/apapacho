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

      {/* Labels — radially oriented along each segment's center line */}
      {prizes.map((prize, index) => {
        // Angle to the middle of this segment (from 12 o'clock, clockwise)
        const midDeg = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
        return (
          <div
            key={`label-${prize.id}`}
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `rotate(${midDeg}deg)` }}
          >
            {/* Content sits along the radius, reading outward from center */}
            <div
              className="absolute left-1/2 flex flex-col items-center"
              style={{
                top: '8%',
                transform: 'translateX(-50%)',
              }}
            >
              <span className="text-base md:text-lg leading-none drop-shadow-lg">{prize.icon}</span>
              <span
                className="text-[6px] md:text-[8px] font-bold text-white whitespace-nowrap leading-tight mt-0.5"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.8)' }}
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
