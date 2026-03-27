'use client'

interface NearMissIndicatorProps {
  visible: boolean
}

export function NearMissIndicator({ visible }: NearMissIndicatorProps) {
  if (!visible) return null

  return (
    <div className="absolute top-1/2 right-0 translate-x-[110%] -translate-y-1/2 z-30 roulette-near-miss">
      <div className="px-4 py-2 rounded-xl bg-amber-500/20 border-2 border-amber-500/60 backdrop-blur-sm">
        <span className="text-amber-300 font-bold text-lg whitespace-nowrap">
          Casi...!
        </span>
      </div>
    </div>
  )
}
