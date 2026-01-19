'use client'

import { useEffect, useState } from 'react'
import { Flame, Trophy, Zap, Gift } from 'lucide-react'
import { gamificationApi, type StreakInfo } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface StreakDisplayProps {
  variant?: 'compact' | 'full'
  className?: string
}

export function StreakDisplay({ variant = 'compact', className = '' }: StreakDisplayProps) {
  const { token } = useAuthStore()
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    gamificationApi.getStreakInfo(token)
      .then(setStreakInfo)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className={`animate-pulse bg-white/5 rounded-xl h-20 ${className}`} />
    )
  }

  if (!streakInfo) return null

  const { currentStreak, nextMilestone, achievedCount, totalBonusEarned } = streakInfo

  // Determine flame color based on streak
  const getFlameColor = () => {
    if (currentStreak >= 30) return 'text-orange-400'
    if (currentStreak >= 7) return 'text-yellow-400'
    if (currentStreak >= 3) return 'text-amber-400'
    return 'text-gray-400'
  }

  // Determine streak badge
  const getStreakBadge = () => {
    if (currentStreak >= 100) return { icon: '👑', label: 'Leyenda' }
    if (currentStreak >= 30) return { icon: '🔥', label: 'Fanático' }
    if (currentStreak >= 7) return { icon: '⭐', label: 'Constante' }
    if (currentStreak >= 3) return { icon: '✨', label: 'En racha' }
    return null
  }

  const badge = getStreakBadge()

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-lg ${className}`}>
        <Flame className={`w-5 h-5 ${getFlameColor()}`} />
        <span className="font-semibold text-white">{currentStreak}</span>
        <span className="text-white/60 text-sm">días</span>
        {badge && <span className="text-lg">{badge.icon}</span>}
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Racha de Login</h3>
            <p className="text-white/60 text-sm">Ingresa cada día para mantenerla</p>
          </div>
        </div>
        {badge && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
            <span className="text-xl">{badge.icon}</span>
            <span className="text-sm font-medium text-white">{badge.label}</span>
          </div>
        )}
      </div>

      {/* Current Streak */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className={`text-5xl font-bold ${getFlameColor()}`}>{currentStreak}</span>
        <span className="text-white/60 text-lg">días consecutivos</span>
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/70">
              Próximo hito: <span className="text-amber-400 font-medium">{nextMilestone.days} días</span>
            </span>
            <span className="text-amber-400 font-medium">
              +{nextMilestone.bonus} pts
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${nextMilestone.progress}%` }}
            />
          </div>
          <p className="text-white/50 text-xs mt-1">
            {nextMilestone.daysRemaining} días más para el bonus
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold">{achievedCount}</span>
          </div>
          <span className="text-white/50 text-xs">Hitos logrados</span>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Gift className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-bold">+{totalBonusEarned}</span>
          </div>
          <span className="text-white/50 text-xs">Bonus ganados</span>
        </div>
      </div>

      {/* Milestones preview */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-white/50 text-xs mb-2">Próximos hitos</p>
        <div className="flex gap-2 flex-wrap">
          {streakInfo.milestones
            .filter(m => !m.achieved)
            .slice(0, 4)
            .map(milestone => (
              <div 
                key={milestone.days}
                className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs"
              >
                <span className="text-white/70">{milestone.days}d</span>
                <span className="text-amber-400">+{milestone.bonus}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default StreakDisplay
