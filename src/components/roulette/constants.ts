export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Prize {
  id: number
  label: string
  icon: string
  probability: number
  type: 'POINTS' | 'SUBSCRIPTION' | 'DISCOUNT' | 'RETRY'
  rarity: Rarity
  segmentColors: [string, string] // [dark, light] gradient pair
  glowColor: string
}

export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bgClass: string; borderClass: string }> = {
  common:    { label: 'Común',      color: '#6b7280', bgClass: 'bg-gray-500/20',    borderClass: 'border-gray-500/30' },
  uncommon:  { label: 'Poco Común', color: '#22c55e', bgClass: 'bg-green-500/20',   borderClass: 'border-green-500/30' },
  rare:      { label: 'Raro',       color: '#3b82f6', bgClass: 'bg-blue-500/20',    borderClass: 'border-blue-500/30' },
  epic:      { label: 'Épico',      color: '#a855f7', bgClass: 'bg-purple-500/20',  borderClass: 'border-purple-500/30' },
  legendary: { label: 'Legendario', color: '#f59e0b', bgClass: 'bg-amber-500/20',   borderClass: 'border-amber-500/30' },
}

export const prizes: Prize[] = [
  { id: 1,  label: '10 Pts',     icon: '💎', probability: 0.05, type: 'POINTS',       rarity: 'epic',      segmentColors: ['#5b21b6', '#7c3aed'], glowColor: '#a855f7' },
  { id: 2,  label: '5 Pts',      icon: '⭐', probability: 0.13, type: 'POINTS',       rarity: 'rare',      segmentColors: ['#1e40af', '#2563eb'], glowColor: '#3b82f6' },
  { id: 3,  label: '3 Pts',      icon: '🎁', probability: 0.18, type: 'POINTS',       rarity: 'uncommon',  segmentColors: ['#166534', '#16a34a'], glowColor: '#22c55e' },
  { id: 4,  label: '2 Pts',      icon: '🎉', probability: 0.23, type: 'POINTS',       rarity: 'uncommon',  segmentColors: ['#14532d', '#15803d'], glowColor: '#22c55e' },
  { id: 5,  label: '1 Pt',       icon: '✨', probability: 0.28, type: 'POINTS',       rarity: 'common',    segmentColors: ['#1f2937', '#374151'], glowColor: '#6b7280' },
  { id: 6,  label: 'Retry',      icon: '🔄', probability: 0.05, type: 'RETRY',        rarity: 'common',    segmentColors: ['#111827', '#1f2937'], glowColor: '#6b7280' },
  { id: 7,  label: '50 Pts!',    icon: '🏆', probability: 0.02, type: 'POINTS',       rarity: 'legendary', segmentColors: ['#78350f', '#b45309'], glowColor: '#f59e0b' },
  { id: 8,  label: 'Sub FREE',   icon: '👑', probability: 0.02, type: 'SUBSCRIPTION', rarity: 'legendary', segmentColors: ['#713f12', '#a16207'], glowColor: '#eab308' },
  { id: 9,  label: '50% OFF',    icon: '🎟️', probability: 0.03, type: 'DISCOUNT',     rarity: 'epic',      segmentColors: ['#581c87', '#7e22ce'], glowColor: '#c084fc' },
  { id: 10, label: '25% OFF',    icon: '🎫', probability: 0.01, type: 'DISCOUNT',     rarity: 'legendary', segmentColors: ['#451a03', '#78350f'], glowColor: '#f59e0b' },
]

export const SEGMENT_ANGLE = 360 / prizes.length
export const SPIN_COST = 10
