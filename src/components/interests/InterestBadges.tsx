'use client'

import type { Interest, InterestCategory } from '@/types'

interface InterestBadgesProps {
  interests: Interest[]
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
}

const CATEGORY_COLORS: Record<InterestCategory, string> = {
  CONTENT_TYPE: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
  AESTHETIC: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  THEMES: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  NICHE: 'bg-red-500/20 text-red-300 border-red-500/30'
}

const SIZE_CLASSES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

export function InterestBadges({ interests, maxDisplay = 10, size = 'md' }: InterestBadgesProps) {
  if (interests.length === 0) {
    return null
  }

  const displayedInterests = interests.slice(0, maxDisplay)
  const remainingCount = interests.length - maxDisplay

  return (
    <div className="flex flex-wrap gap-2">
      {displayedInterests.map(interest => (
        <span
          key={interest.id}
          className={`
            inline-flex items-center gap-1.5 rounded-full font-medium border
            ${CATEGORY_COLORS[interest.category]}
            ${SIZE_CLASSES[size]}
          `}
        >
          {interest.icon && <span>{interest.icon}</span>}
          <span>{interest.name}</span>
        </span>
      ))}

      {remainingCount > 0 && (
        <span className={`
          inline-flex items-center rounded-full font-medium border
          bg-white/10 text-white/60 border-white/20
          ${SIZE_CLASSES[size]}
        `}>
          +{remainingCount}
        </span>
      )}
    </div>
  )
}
