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
      {/* Conic gradient background */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${prizes.map((p, i) => {
            const start = (i / prizes.length) * 100
            const end = ((i + 1) / prizes.length) * 100
            return `${p.segmentColors[0]} ${start}%, ${p.segmentColors[1]} ${end}%`
          }).join(', ')})`,
        }}
      />

      {/* Segment divider lines */}
      {prizes.map((_, i) => (
        <div
          key={`line-${i}`}
          className="absolute top-0 left-1/2 h-1/2 origin-bottom"
          style={{
            transform: `rotate(${i * SEGMENT_ANGLE}deg)`,
            width: '2px',
            marginLeft: '-1px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
          }}
        />
      ))}

      {/* Prize labels */}
      {prizes.map((prize, i) => {
        const midAngle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
        return (
          <div
            key={prize.id}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${midAngle}deg) translateY(-38%) rotate(0deg)`,
              transformOrigin: '0 0',
              width: 0,
              height: 0,
            }}
          >
            <div
              className="absolute flex flex-col items-center"
              style={{
                transform: `translate(-50%, -100%) rotate(${-midAngle - rotation}deg)`,
                whiteSpace: 'nowrap',
              }}
            >
              <span className="text-2xl md:text-3xl drop-shadow-lg">{prize.icon}</span>
              <span
                className="text-[10px] md:text-xs font-bold text-white drop-shadow-lg mt-0.5 px-1"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
              >
                {prize.label}
              </span>
            </div>
          </div>
        )
      })}

      {/* Legendary shimmer overlay */}
      {prizes.map((prize, i) => {
        if (prize.rarity !== 'legendary') return null
        const startDeg = i * SEGMENT_ANGLE
        return (
          <div
            key={`shimmer-${i}`}
            className="absolute inset-0 rounded-full roulette-shimmer pointer-events-none"
            style={{
              clipPath: `conic-gradient(from ${startDeg}deg, black 0deg, black ${SEGMENT_ANGLE}deg, transparent ${SEGMENT_ANGLE}deg)`,
              // Use actual clip approach
              background: `conic-gradient(from ${startDeg}deg, rgba(255,215,0,0.08) 0deg, rgba(255,215,0,0.15) ${SEGMENT_ANGLE / 2}deg, rgba(255,215,0,0.08) ${SEGMENT_ANGLE}deg, transparent ${SEGMENT_ANGLE}deg)`,
            }}
          />
        )
      })}
    </div>
  )
}
