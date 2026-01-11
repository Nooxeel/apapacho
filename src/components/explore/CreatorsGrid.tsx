'use client'

import { CreatorCard, type CreatorCardData } from './CreatorCard'
import { Button } from '@/components/ui'
import { Loader2, Search } from 'lucide-react'

interface CreatorsGridProps {
  creators: CreatorCardData[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore?: () => void
  userInterests?: string[]
  emptyMessage?: string
}

export function CreatorsGrid({
  creators,
  isLoading,
  hasMore,
  onLoadMore,
  userInterests = [],
  emptyMessage = 'No se encontraron creadores'
}: CreatorsGridProps) {
  // Loading state (first load)
  if (isLoading && creators.length === 0) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="h-32 bg-white/10" />
            <div className="p-6 space-y-3">
              <div className="flex justify-center">
                <div className="-mt-12 h-20 w-20 rounded-full bg-white/20" />
              </div>
              <div className="space-y-2">
                <div className="mx-auto h-4 w-32 rounded bg-white/20" />
                <div className="mx-auto h-3 w-24 rounded bg-white/10" />
              </div>
              <div className="space-y-2">
                <div className="mx-auto h-3 w-full rounded bg-white/10" />
                <div className="mx-auto h-3 w-3/4 rounded bg-white/10" />
              </div>
              <div className="flex justify-center gap-2">
                <div className="h-6 w-16 rounded-full bg-white/10" />
                <div className="h-6 w-16 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!isLoading && creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <Search className="h-10 w-10 text-white/40" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">{emptyMessage}</h3>
        <p className="max-w-md text-white/60">
          Intenta ajustar los filtros o explora otras categorías de intereses
        </p>
      </div>
    )
  }

  // Results grid
  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {creators.map(creator => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            userInterests={userInterests}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={onLoadMore}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar más'
            )}
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {isLoading && creators.length > 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
        </div>
      )}
    </div>
  )
}
