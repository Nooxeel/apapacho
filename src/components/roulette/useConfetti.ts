import { useState, useRef, useCallback } from 'react'

export interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  color: string
  size: number
  opacity: number
  shape: 'circle' | 'rect'
}

const CONFETTI_COLORS = ['#f59e0b', '#ec4899', '#a855f7', '#3b82f6', '#22c55e', '#f43f5e', '#eab308', '#06b6d4']
const SPARKLE_COLORS = ['#fbbf24', '#ffffff', '#fde68a', '#f59e0b']

export function useConfetti() {
  const [particles, setParticles] = useState<Particle[]>([])
  const idRef = useRef(0)
  const rafRef = useRef<number>(0)

  const trigger = useCallback((type: 'sparkle' | 'confetti' | 'explosion') => {
    const newParticles: Particle[] = []
    const count = type === 'explosion' ? 60 : type === 'confetti' ? 40 : 15
    const colors = type === 'sparkle' ? SPARKLE_COLORS : CONFETTI_COLORS

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = type === 'explosion'
        ? 3 + Math.random() * 6
        : type === 'confetti'
        ? 1 + Math.random() * 3
        : 2 + Math.random() * 4

      newParticles.push({
        id: idRef.current++,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed * (type === 'confetti' ? (Math.random() - 0.5) * 2 : 1),
        vy: type === 'confetti' ? -(2 + Math.random() * 4) : Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: type === 'sparkle' ? 3 + Math.random() * 3 : 6 + Math.random() * 6,
        opacity: 1,
        shape: type === 'sparkle' ? 'circle' : Math.random() > 0.5 ? 'rect' : 'circle',
      })
    }

    setParticles(newParticles)

    const startTime = performance.now()
    const duration = 2000

    const animate = (now: number) => {
      const elapsed = now - startTime
      const t = elapsed / duration

      if (t >= 1) {
        setParticles([])
        return
      }

      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy + 0.15, // gravity
        vy: p.vy + 0.15,
        rotation: p.rotation + (p.vx > 0 ? 5 : -5),
        opacity: Math.max(0, 1 - t * 1.2),
      })))

      rafRef.current = requestAnimationFrame(animate)
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  return { particles, trigger }
}
