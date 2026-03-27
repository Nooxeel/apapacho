'use client'

import { useStreak } from './useSpinHistory'
import { Flame } from 'lucide-react'

export function StreakCounter() {
  const streak = useStreak()

  if (streak <= 0) return null

  const color = streak >= 5 ? '#ef4444' : streak >= 3 ? '#f97316' : '#9ca3af'
  const hasGlow = streak >= 5

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border mb-3"
      style={{
        borderColor: `${color}50`,
        backgroundColor: `${color}10`,
        boxShadow: hasGlow ? `0 0 12px ${color}30` : 'none',
      }}
    >
      <Flame
        className="w-4 h-4"
        style={{ color, filter: hasGlow ? `drop-shadow(0 0 4px ${color})` : 'none' }}
      />
      <span className="text-sm font-bold" style={{ color }}>
        {streak} {streak === 1 ? 'día' : 'días'} seguidos
      </span>
    </div>
  )
}
