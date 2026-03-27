'use client'

import type { Particle } from './useConfetti'

interface ConfettiOverlayProps {
  particles: Particle[]
}

export function ConfettiOverlay({ particles }: ConfettiOverlayProps) {
  if (particles.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full z-30">
      <div className="absolute top-1/2 left-1/2">
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              width: p.shape === 'circle' ? p.size : p.size * 0.6,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size}px ${p.color}40`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
