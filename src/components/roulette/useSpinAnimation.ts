import { useState, useRef, useCallback } from 'react'
import { prizes, SEGMENT_ANGLE } from './constants'

export type SpinPhase = 'idle' | 'spinning' | 'crawling' | 'settled'

interface UseSpinAnimationReturn {
  rotation: number
  phase: SpinPhase
  tickActive: boolean
  isNearMiss: boolean
  startSpin: (targetPrizeId: number) => Promise<void>
}

// Custom easing: fast start, dramatic slowdown at end
function easeOutCustom(t: number): number {
  // Combination curve: fast in middle, very slow crawl at end
  if (t < 0.6) {
    // Normal ease-out for first 60%
    return 1 - Math.pow(1 - t / 0.6, 2) * (1 - 0.6)
  }
  // Dramatic slowdown for last 40% — creates tension
  const localT = (t - 0.6) / 0.4
  return 0.6 + 0.4 * (1 - Math.pow(1 - localT, 4))
}

export function useSpinAnimation(): UseSpinAnimationReturn {
  const [rotation, setRotation] = useState(0)
  const [phase, setPhase] = useState<SpinPhase>('idle')
  const [tickActive, setTickActive] = useState(false)
  const [isNearMiss, setIsNearMiss] = useState(false)
  const baseRotationRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastAngleRef = useRef(0)

  const startSpin = useCallback((targetPrizeId: number): Promise<void> => {
    return new Promise((resolve) => {
      const prizeIndex = prizes.findIndex(p => p.id === targetPrizeId)
      if (prizeIndex === -1) { resolve(); return }

      setPhase('spinning')
      setIsNearMiss(false)

      const base = baseRotationRef.current
      const fullSpins = 8
      const targetSegmentCenter = prizeIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
      const targetOffset = 360 - targetSegmentCenter
      const totalDelta = fullSpins * 360 + targetOffset + (Math.random() * 10 - 5) // small randomness
      const duration = 7000 // 7 seconds total

      const startTime = performance.now()
      const startRotation = base

      const animate = (now: number) => {
        const elapsed = now - startTime
        const t = Math.min(elapsed / duration, 1)
        const eased = easeOutCustom(t)
        const currentRotation = startRotation + totalDelta * eased

        setRotation(currentRotation)

        // Tick detection: check if we crossed a segment boundary
        const currentAngle = currentRotation % 360
        const prevAngle = lastAngleRef.current % 360
        const currentSegment = Math.floor(currentAngle / SEGMENT_ANGLE)
        const prevSegment = Math.floor(prevAngle / SEGMENT_ANGLE)
        if (currentSegment !== prevSegment && t < 0.95) {
          setTickActive(true)
          setTimeout(() => setTickActive(false), 80)
        }
        lastAngleRef.current = currentRotation

        // Near-miss detection during crawl phase (last 20% of animation)
        if (t > 0.8 && t < 0.95) {
          setPhase('crawling')
          const segIdx = Math.floor(((360 - (currentAngle % 360) + 360) % 360) / SEGMENT_ANGLE) % prizes.length
          const passingPrize = prizes[segIdx]
          if (passingPrize && (passingPrize.rarity === 'legendary' || passingPrize.rarity === 'epic') && passingPrize.id !== targetPrizeId) {
            setIsNearMiss(true)
            setTimeout(() => setIsNearMiss(false), 1200)
          }
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate)
        } else {
          // Settled
          const finalRotation = startRotation + totalDelta
          setRotation(finalRotation)
          baseRotationRef.current = finalRotation
          setPhase('settled')
          setTimeout(() => {
            setPhase('idle')
            resolve()
          }, 300)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    })
  }, [])

  return { rotation, phase, tickActive, isNearMiss, startSpin }
}
