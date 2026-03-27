'use client'

import type { SpinRecord } from './useSpinHistory'
import { RARITY_CONFIG } from './constants'

interface SpinHistoryProps {
  history: SpinRecord[]
}

export function SpinHistory({ history }: SpinHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-xs text-white/40 mr-1">Últimos:</span>
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {history.map((record, i) => {
          const rarity = RARITY_CONFIG[record.rarity]
          return (
            <div
              key={record.timestamp}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-opacity"
              style={{
                borderColor: rarity.color,
                backgroundColor: `${rarity.color}15`,
                opacity: 1 - i * 0.15,
                boxShadow: record.rarity === 'legendary' || record.rarity === 'epic'
                  ? `0 0 8px ${rarity.color}40`
                  : 'none',
              }}
              title={record.label}
            >
              <span className="text-lg">{record.icon}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
