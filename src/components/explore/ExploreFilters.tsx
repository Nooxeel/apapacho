'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Filter, Check } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { interestsApi } from '@/lib/api'
import type { Interest, InterestCategory } from '@/types'

export interface ExploreFiltersState {
  interestIds: string[]
  query: string
  verifiedOnly: boolean
  category?: InterestCategory
}

interface ExploreFiltersProps {
  onFilterChange: (filters: ExploreFiltersState) => void
  isLoading?: boolean
}

const CATEGORY_LABELS: Record<InterestCategory, string> = {
  CONTENT_TYPE: 'Tipo de Contenido',
  AESTHETIC: 'Estética',
  THEMES: 'Temáticas',
  NICHE: 'Nichos'
}

const CATEGORY_COLORS: Record<InterestCategory, string> = {
  CONTENT_TYPE: 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300',
  AESTHETIC: 'border-pink-500/50 bg-pink-500/10 text-pink-300',
  THEMES: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
  NICHE: 'border-red-500/50 bg-red-500/10 text-red-300'
}

export function ExploreFilters({ onFilterChange, isLoading = false }: ExploreFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<InterestCategory | undefined>()
  const [showInterestSelector, setShowInterestSelector] = useState(false)
  
  const [allInterests, setAllInterests] = useState<Interest[]>([])
  const [filteredInterests, setFilteredInterests] = useState<Interest[]>([])
  const [interestSearchQuery, setInterestSearchQuery] = useState('')
  const [loadingInterests, setLoadingInterests] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      emitFilters()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Emit filters when other filters change (no debounce)
  useEffect(() => {
    emitFilters()
  }, [selectedInterestIds, verifiedOnly, selectedCategory])

  const emitFilters = () => {
    onFilterChange({
      interestIds: selectedInterestIds,
      query: searchQuery.trim(),
      verifiedOnly,
      category: selectedCategory
    })
  }

  // Load interests when selector opens
  useEffect(() => {
    if (showInterestSelector && allInterests.length === 0) {
      loadInterests()
    }
  }, [showInterestSelector])

  // Filter interests based on search and category
  useEffect(() => {
    let filtered = allInterests

    if (selectedCategory) {
      filtered = filtered.filter(i => i.category === selectedCategory)
    }

    if (interestSearchQuery) {
      const query = interestSearchQuery.toLowerCase()
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.slug.toLowerCase().includes(query)
      )
    }

    setFilteredInterests(filtered)
  }, [allInterests, selectedCategory, interestSearchQuery])

  const loadInterests = async () => {
    try {
      setLoadingInterests(true)
      const interests = await interestsApi.getAll()
      setAllInterests(interests)
    } catch (err) {
      console.error('Error loading interests:', err)
    } finally {
      setLoadingInterests(false)
    }
  }

  const handleToggleInterest = (interestId: string) => {
    setSelectedInterestIds(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    )
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedInterestIds([])
    setVerifiedOnly(false)
    setSelectedCategory(undefined)
  }

  const getSelectedInterests = () => {
    return allInterests.filter(i => selectedInterestIds.includes(i.id))
  }

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) +
    selectedInterestIds.length +
    (verifiedOnly ? 1 : 0) +
    (selectedCategory ? 1 : 0)

  const categories: InterestCategory[] = ['CONTENT_TYPE', 'AESTHETIC', 'THEMES', 'NICHE']

  return (
    <div className="space-y-4">
      {/* Main Filters Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar creadores por nombre..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-white/50 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )
            }
            disabled={isLoading}
          />
        </div>

        {/* Interests Button */}
        <Button
          variant="secondary"
          onClick={() => setShowInterestSelector(!showInterestSelector)}
          className="relative"
        >
          <Filter className="mr-2 h-4 w-4" />
          Intereses
          {selectedInterestIds.length > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500 text-xs text-white">
              {selectedInterestIds.length}
            </span>
          )}
        </Button>

        {/* Verified Only */}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={e => setVerifiedOnly(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/50"
          />
          Solo verificados
        </label>
      </div>

      {/* Category Filter */}
      {selectedInterestIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-white/60">Categoría:</span>
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              !selectedCategory
                ? 'border-white/30 bg-white/10 text-white'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
            }`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? CATEGORY_COLORS[cat]
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/60">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro activo' : 'filtros activos'}
            </span>
            {getSelectedInterests().map(interest => (
              <span
                key={interest.id}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${
                  CATEGORY_COLORS[interest.category]
                }`}
              >
                {interest.icon && <span>{interest.icon}</span>}
                {interest.name}
                <button
                  onClick={() => handleToggleInterest(interest.id)}
                  className="ml-1 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Interest Selector Modal */}
      {showInterestSelector && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Seleccionar Intereses</h3>
            <button
              onClick={() => setShowInterestSelector(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Interest Search */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Buscar intereses..."
              value={interestSearchQuery}
              onChange={e => setInterestSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Interests Grid */}
          {loadingInterests ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-fuchsia-500"></div>
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {filteredInterests.length === 0 ? (
                <p className="py-8 text-center text-white/60">No se encontraron intereses</p>
              ) : (
                filteredInterests.map(interest => {
                  const isSelected = selectedInterestIds.includes(interest.id)
                  return (
                    <button
                      key={interest.id}
                      onClick={() => handleToggleInterest(interest.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-all ${
                        isSelected
                          ? 'border-fuchsia-500/50 bg-fuchsia-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          isSelected
                            ? 'border-fuchsia-500 bg-fuchsia-500'
                            : 'border-white/30 bg-white/5'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {interest.icon && <span className="text-lg">{interest.icon}</span>}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">{interest.name}</p>
                        {interest.description && (
                          <p className="text-xs text-white/60">{interest.description}</p>
                        )}
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${
                          CATEGORY_COLORS[interest.category]
                        }`}
                      >
                        {CATEGORY_LABELS[interest.category]}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          )}

          {/* Done Button */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              onClick={() => setShowInterestSelector(false)}
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
