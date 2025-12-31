'use client'

import { useState, useEffect } from 'react'
import { X, Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { interestsApi } from '@/lib/api'
import type { Interest, InterestCategory } from '@/types'

interface InterestSelectorProps {
  selectedInterests: Interest[]
  onSelectionChange: (interests: Interest[]) => void
  minInterests: number
  maxInterests: number
  mode: 'user' | 'creator'
  showNSFW?: boolean
}

const CATEGORY_LABELS: Record<InterestCategory, string> = {
  ENTERTAINMENT: 'Entretenimiento',
  GAMING: 'Gaming',
  MUSIC: 'Música',
  ART: 'Arte',
  FITNESS: 'Fitness',
  LIFESTYLE: 'Estilo de Vida',
  ADULT: 'Adulto (18+)',
  OTHER: 'Otros'
}

const CATEGORY_COLORS: Record<InterestCategory, string> = {
  ENTERTAINMENT: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  GAMING: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  MUSIC: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  ART: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  FITNESS: 'bg-green-500/20 text-green-300 border-green-500/30',
  LIFESTYLE: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  ADULT: 'bg-red-500/20 text-red-300 border-red-500/30',
  OTHER: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
}

export function InterestSelector({
  selectedInterests,
  onSelectionChange,
  minInterests,
  maxInterests,
  mode,
  showNSFW = false
}: InterestSelectorProps) {
  const [allInterests, setAllInterests] = useState<Interest[]>([])
  const [filteredInterests, setFilteredInterests] = useState<Interest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<InterestCategory | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInterests()
  }, [])

  useEffect(() => {
    filterInterests()
  }, [searchQuery, selectedCategory, allInterests, showNSFW])

  const loadInterests = async () => {
    try {
      setLoading(true)
      const interests = await interestsApi.getAll()
      setAllInterests(interests)
    } catch (err) {
      console.error('Error loading interests:', err)
      setError('Error al cargar los intereses')
    } finally {
      setLoading(false)
    }
  }

  const filterInterests = () => {
    let filtered = allInterests

    // Filter NSFW content
    if (!showNSFW) {
      filtered = filtered.filter(i => !i.isNSFW)
    }

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(i => i.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.slug.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query)
      )
    }

    setFilteredInterests(filtered)
  }

  const handleToggleInterest = (interest: Interest) => {
    const isSelected = selectedInterests.some(i => i.id === interest.id)

    if (isSelected) {
      // Remove interest
      if (selectedInterests.length > minInterests) {
        onSelectionChange(selectedInterests.filter(i => i.id !== interest.id))
      }
    } else {
      // Add interest
      if (selectedInterests.length < maxInterests) {
        onSelectionChange([...selectedInterests, interest])
      }
    }
  }

  const handleRemoveInterest = (interestId: string) => {
    if (selectedInterests.length > minInterests) {
      onSelectionChange(selectedInterests.filter(i => i.id !== interestId))
    }
  }

  const categories: (InterestCategory | 'ALL')[] = [
    'ALL',
    'ENTERTAINMENT',
    'GAMING',
    'MUSIC',
    'ART',
    'FITNESS',
    'LIFESTYLE',
    ...(showNSFW ? ['ADULT' as InterestCategory] : []),
    'OTHER'
  ]

  const selectedCount = selectedInterests.length
  const canAddMore = selectedCount < maxInterests
  const needsMore = selectedCount < minInterests

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white/90 text-sm">
              Selecciona <strong>{minInterests}-{maxInterests} intereses</strong> para {mode === 'user' ? 'descubrir creadores relevantes' : 'que los fans te encuentren más fácilmente'}.
            </p>
            <p className="text-white/60 text-xs mt-1">
              Seleccionados: {selectedCount} de {maxInterests} {needsMore && `(mínimo ${minInterests})`}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Interests */}
      {selectedInterests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/70">Tus Intereses</h3>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map(interest => (
              <button
                key={interest.id}
                onClick={() => handleRemoveInterest(interest.id)}
                disabled={selectedInterests.length <= minInterests}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                  transition-all border
                  ${CATEGORY_COLORS[interest.category]}
                  ${selectedInterests.length <= minInterests
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-white/10 cursor-pointer'
                  }
                `}
              >
                {interest.icon && <span>{interest.icon}</span>}
                <span>{interest.name}</span>
                {selectedInterests.length > minInterests && (
                  <X className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar intereses..."
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-fuchsia-500/50"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all border
              ${selectedCategory === category
                ? 'bg-fuchsia-500 text-white border-fuchsia-500'
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }
            `}
          >
            {category === 'ALL' ? 'Todos' : CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Available Interests */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white/70">
          Disponibles ({filteredInterests.length})
        </h3>

        {filteredInterests.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            No se encontraron intereses
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredInterests
              .filter(interest => !selectedInterests.some(s => s.id === interest.id))
              .map(interest => (
                <button
                  key={interest.id}
                  onClick={() => handleToggleInterest(interest)}
                  disabled={!canAddMore}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all border
                    ${!canAddMore
                      ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-fuchsia-500/30 cursor-pointer'
                    }
                  `}
                >
                  {interest.icon && (
                    <span className="text-lg">{interest.icon}</span>
                  )}
                  <span className="text-white/90 truncate">{interest.name}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
