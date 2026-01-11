'use client'

import { useState, useEffect } from 'react'
import { CreatorCard, type CreatorCardData } from './CreatorCard'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { discoverApi } from '@/lib/api'

interface RecommendedSectionProps {
  token: string
  userInterests: string[]
}

export function RecommendedSection({ token, userInterests }: RecommendedSectionProps) {
  const [recommendedCreators, setRecommendedCreators] = useState<CreatorCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [token])

  const loadRecommendations = async () => {
    try {
      setIsLoading(true)
      const data = await discoverApi.getRecommended(token, { limit: 10, offset: 0 })
      setRecommendedCreators(data)
    } catch (err) {
      console.error('Error loading recommendations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('recommended-scroll-container')
    if (!container) return

    const scrollAmount = 320 // Width of one card + gap
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })

    setScrollPosition(newPosition)
    updateScrollButtons(container, newPosition)
  }

  const updateScrollButtons = (container: HTMLElement, position: number) => {
    setCanScrollLeft(position > 0)
    setCanScrollRight(position < container.scrollWidth - container.clientWidth - 10)
  }

  useEffect(() => {
    const container = document.getElementById('recommended-scroll-container')
    if (!container) return

    const handleScrollEvent = () => {
      const position = container.scrollLeft
      setScrollPosition(position)
      updateScrollButtons(container, position)
    }

    const handleResize = () => {
      updateScrollButtons(container, container.scrollLeft)
    }

    container.addEventListener('scroll', handleScrollEvent)
    window.addEventListener('resize', handleResize)

    // Initial check
    updateScrollButtons(container, 0)

    return () => {
      container.removeEventListener('scroll', handleScrollEvent)
      window.removeEventListener('resize', handleResize)
    }
  }, [recommendedCreators])

  // Don't show section if no recommendations and not loading
  if (!isLoading && recommendedCreators.length === 0) {
    return null
  }

  return (
    <div className="mb-12 rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/5 to-purple-500/5 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Recomendado para ti</h2>
            <p className="text-sm text-white/60">Basado en tus intereses</p>
          </div>
        </div>

        {/* Scroll buttons */}
        {!isLoading && recommendedCreators.length > 3 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/5"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/5"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[280px] animate-pulse rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="h-32 bg-white/10" />
              <div className="p-4 space-y-3">
                <div className="flex justify-center">
                  <div className="-mt-12 h-20 w-20 rounded-full bg-white/20" />
                </div>
                <div className="space-y-2">
                  <div className="mx-auto h-4 w-32 rounded bg-white/20" />
                  <div className="mx-auto h-3 w-24 rounded bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creators Carousel */}
      {!isLoading && recommendedCreators.length > 0 && (
        <div
          id="recommended-scroll-container"
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {recommendedCreators.map(creator => (
            <div key={creator.id} className="min-w-[280px] flex-shrink-0">
              <CreatorCard creator={creator} userInterests={userInterests} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
