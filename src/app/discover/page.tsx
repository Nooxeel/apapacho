'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Heart, BadgeCheck, Eye, Users, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Navbar } from '@/components/layout'
import { Button } from '@/components/ui'
import { InterestBadges } from '@/components/interests'
import { discoverApi, interestsApi } from '@/lib/api'
import type { Interest } from '@/types'
import Image from 'next/image'

interface Creator {
  id: string
  userId: string
  username: string
  displayName: string
  avatar: string | null
  profileImage: string | null
  bio: string | null
  accentColor: string
  isVerified: boolean
  totalViews: number
  totalLikes: number
  interests: Array<{ interest: Interest }>
  _count: {
    subscribers: number
  }
  relevanceScore?: number
  sharedInterestsCount?: number
}

export default function DiscoverPage() {
  const router = useRouter()
  const { user, token, hasHydrated } = useAuthStore()
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([])
  const [showRecommended, setShowRecommended] = useState(true)

  useEffect(() => {
    loadInterests()
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    loadCreators()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, selectedInterests, showRecommended, token])

  const loadInterests = async () => {
    try {
      const interests = await interestsApi.getAll()
      setAvailableInterests(interests)
    } catch (err) {
      console.error('Error loading interests:', err)
    }
  }

  const loadCreators = async () => {
    try {
      setLoading(true)

      let result: Creator[]

      if (showRecommended && token) {
        // Get personalized recommendations
        result = await discoverApi.getRecommended(token, { limit: 50 })
      } else if (selectedInterests.length > 0) {
        // Filter by selected interests
        result = await discoverApi.discoverCreators({
          interestIds: selectedInterests.join(','),
          limit: 50
        })
      } else if (searchQuery) {
        // Search
        result = await discoverApi.search({
          query: searchQuery,
          limit: 50
        })
      } else {
        // Get popular creators
        result = await discoverApi.discoverCreators({ limit: 50 })
      }

      setCreators(result)
    } catch (err) {
      console.error('Error loading creators:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    )
    setShowRecommended(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowRecommended(false)
    loadCreators()
  }

  const popularInterests = availableInterests
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 12)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-fuchsia-400" />
            <h1 className="text-4xl font-bold text-white">
              Descubrir Creadores
            </h1>
          </div>
          <p className="text-white/60 text-lg">
            Encuentra creadores que compartan tus intereses
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar creadores por nombre..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-fuchsia-500/50"
              />
            </div>
          </form>

          {/* Mode Toggle */}
          {token && (
            <div className="flex gap-2 mb-4">
              <Button
                variant={showRecommended ? 'primary' : 'secondary'}
                onClick={() => {
                  setShowRecommended(true)
                  setSelectedInterests([])
                  setSearchQuery('')
                }}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Recomendados para ti
              </Button>
              <Button
                variant={!showRecommended ? 'primary' : 'secondary'}
                onClick={() => setShowRecommended(false)}
                className="flex-1"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrar por intereses
              </Button>
            </div>
          )}

          {/* Interest Filters */}
          {!showRecommended && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-white/70" />
                <h3 className="text-sm font-medium text-white/70">
                  Filtrar por Intereses
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {popularInterests.map(interest => {
                  const isSelected = selectedInterests.includes(interest.id)
                  return (
                    <button
                      key={interest.id}
                      onClick={() => handleToggleInterest(interest.id)}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                        transition-all border
                        ${isSelected
                          ? 'bg-fuchsia-500 text-white border-fuchsia-500'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      {interest.icon && <span>{interest.icon}</span>}
                      <span>{interest.name}</span>
                    </button>
                  )
                })}
              </div>

              {selectedInterests.length > 0 && (
                <button
                  onClick={() => setSelectedInterests([])}
                  className="text-sm text-fuchsia-400 hover:text-fuchsia-300 mt-3"
                >
                  Limpiar filtros
                </button>
              )}
            </>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white/30" />
            </div>
            <p className="text-white/50 text-lg mb-4">
              No se encontraron creadores
            </p>
            {!token && (
              <Link href="/login">
                <Button>
                  Iniciar Sesión para Recomendaciones
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map(creator => {
              const creatorInterests = creator.interests?.map(ci => ci.interest) || []

              return (
                <Link
                  key={creator.id}
                  href={`/${creator.username}`}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all group"
                >
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={creator.profileImage || creator.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.displayName)}&background=a21caf&color=fff`}
                        alt={creator.displayName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white truncate">
                          {creator.displayName}
                        </h3>
                        {creator.isVerified && (
                          <BadgeCheck className="w-5 h-5 text-fuchsia-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-white/60 text-sm">@{creator.username}</p>

                      {creator.relevanceScore && creator.relevanceScore > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Sparkles className="w-3 h-3 text-fuchsia-400" />
                          <span className="text-xs text-fuchsia-400">
                            {Math.round(creator.relevanceScore)}% compatible
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {creator.bio && (
                    <p className="text-white/70 text-sm line-clamp-2 mb-4">
                      {creator.bio}
                    </p>
                  )}

                  {/* Interests */}
                  {creatorInterests.length > 0 && (
                    <div className="mb-4">
                      <InterestBadges interests={creatorInterests} maxDisplay={5} size="sm" />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{creator._count.subscribers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{creator.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{creator.totalLikes.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* CTA for users without interests */}
        {token && creators.length === 0 && !loading && (
          <div className="mt-8 text-center">
            <Link href="/settings/interests">
              <Button>
                Configurar Mis Intereses
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
