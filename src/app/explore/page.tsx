'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CreatorsGrid } from '@/components/explore'
import { discoverApi, interestsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { CreatorCardData } from '@/components/explore'

export default function ExplorePage() {
  const { token, hasHydrated } = useAuthStore()
  
  const [creators, setCreators] = useState<CreatorCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [userInterests, setUserInterests] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

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

  // Cargar creadores iniciales
  useEffect(() => {
    if (hasHydrated) {
      loadCreators(true)
    }
  }, [hasHydrated])

  const loadCreators = async (reset = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const currentOffset = reset ? 0 : offset
      const data = await discoverApi.discoverCreators({
        limit: LIMIT,
        offset: currentOffset
      })

      if (reset) {
        setCreators(data)
        setOffset(LIMIT)
      } else {
        setCreators(prev => [...prev, ...data])
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
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
