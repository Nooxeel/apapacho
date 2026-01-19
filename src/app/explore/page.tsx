'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CreatorsGrid, ExploreFilters, RecommendedSection } from '@/components/explore'
import { discoverApi, interestsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { CreatorCardData, ExploreFiltersState } from '@/components/explore'

export default function ExplorePage() {
  const { token, hasHydrated } = useAuthStore()
  
  const [creators, setCreators] = useState<CreatorCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [userInterests, setUserInterests] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ExploreFiltersState>({
    interestIds: [],
    query: '',
    verifiedOnly: false
  })

  const LIMIT = 12

  // Cargar intereses del usuario si está autenticado
  useEffect(() => {
    if (hasHydrated && token) {
      interestsApi
        .getMyInterests(token)
        .then(interests => setUserInterests(interests.map((i: any) => i.id)))
        .catch(err => console.error('Error loading user interests:', err))
    }
  }, [token, hasHydrated])

  // Cargar creadores cuando cambian los filtros
  useEffect(() => {
    if (hasHydrated) {
      loadCreators(true)
    }
  }, [hasHydrated, filters])

  const loadCreators = async (reset = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const currentOffset = reset ? 0 : offset
      
      const params: any = {
        limit: LIMIT,
        offset: currentOffset
      }

      // Add filters to params
      if (filters.interestIds.length > 0) {
        params.interestIds = filters.interestIds.join(',')
      }

      // Note: Backend doesn't support query/verifiedOnly yet, but we're ready for it
      // For now, we'll filter on frontend as fallback
      
      const data = await discoverApi.discoverCreators(params)

      // Frontend filtering (temporary until backend supports it)
      let filteredData = data

      if (filters.query) {
        const query = filters.query.toLowerCase()
        filteredData = filteredData.filter((creator: any) =>
          creator.user.username.toLowerCase().includes(query) ||
          creator.user.displayName.toLowerCase().includes(query)
        )
      }

      if (filters.verifiedOnly) {
        filteredData = filteredData.filter((creator: any) => creator.isVerified)
      }

      if (reset) {
        setCreators(filteredData)
        setOffset(LIMIT)
      } else {
        setCreators(prev => [...prev, ...filteredData])
        setOffset(prev => prev + LIMIT)
      }

      setHasMore(data.length === LIMIT)
    } catch (err) {
      console.error('Error loading creators:', err)
      setError('Error al cargar los creadores')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (newFilters: ExploreFiltersState) => {
    setFilters(newFilters)
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadCreators(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Explora <span className="gradient-text">Creadores</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/60">
              Descubre los mejores creadores y contenido exclusivo
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <ExploreFilters
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />
          </div>

          {/* Recommended Section (for authenticated users) */}
          {token && userInterests.length > 0 && (
            <RecommendedSection
              token={token}
              userInterests={userInterests}
            />
          )}

          {/* Results count */}
          {!isLoading && creators.length > 0 && (
            <div className="mb-6">
              <p className="text-white/60">
                {creators.length} {creators.length === 1 ? 'creador encontrado' : 'creadores encontrados'}
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/20 p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Creators Grid */}
          <CreatorsGrid
            creators={creators}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            userInterests={userInterests}
            emptyMessage="No se encontraron creadores"
            isFirstBatch={offset <= LIMIT}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
