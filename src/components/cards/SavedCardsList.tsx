'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Plus, Trash2, Star, Loader2, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores'

interface SavedCard {
  id: string
  cardType: string
  cardLastFour: string
  cardBrand?: string
  isDefault: boolean
  createdAt: string
  lastUsedAt?: string
}

interface CardsResponse {
  success: boolean
  cards?: SavedCard[]
  oneclickEnabled?: boolean
  error?: string
}

interface CardActionResponse {
  success: boolean
  urlWebpay?: string
  token?: string
  error?: string
}

interface SavedCardsListProps {
  onCardAdded?: () => void
}

export default function SavedCardsList({ onCardAdded }: SavedCardsListProps) {
  const [cards, setCards] = useState<SavedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [oneclickEnabled, setOneclickEnabled] = useState(false)
  const { token: authToken, hasHydrated } = useAuthStore()
  
  useEffect(() => {
    if (hasHydrated && authToken) {
      fetchCards()
    }
  }, [hasHydrated, authToken])
  
  const fetchCards = async () => {
    if (!authToken) return
    
    try {
      setLoading(true)
      const response = await api<CardsResponse>('/cards', { token: authToken })
      
      if (response.success) {
        setCards(response.cards || [])
        setOneclickEnabled(response.oneclickEnabled || false)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar tarjetas')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddCard = async () => {
    if (!authToken) return
    
    try {
      setActionLoading('add')
      const response = await api<CardActionResponse>('/cards/inscribe', { 
        method: 'POST',
        token: authToken 
      })
      
      if (response.success && response.urlWebpay && response.token) {
        // Redirect to Transbank for card inscription
        // Create a form and submit it (Transbank requires POST)
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = response.urlWebpay
        
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'TBK_TOKEN'
        input.value = response.token
        form.appendChild(input)
        
        document.body.appendChild(form)
        form.submit()
      } else {
        setError(response.error || 'Error al iniciar inscripción')
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setActionLoading(null)
    }
  }
  
  const handleSetDefault = async (cardId: string) => {
    if (!authToken) return
    
    try {
      setActionLoading(cardId)
      const response = await api<CardActionResponse>(`/cards/${cardId}/default`, { 
        method: 'PUT',
        token: authToken 
      })
      
      if (response.success) {
        setCards(prev => prev.map(card => ({
          ...card,
          isDefault: card.id === cardId
        })))
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar tarjeta')
    } finally {
      setActionLoading(null)
    }
  }
  
  const handleDeleteCard = async (cardId: string) => {
    if (!authToken) return
    
    if (!confirm('¿Estás seguro de eliminar esta tarjeta? Las suscripciones que la usen dejarán de renovarse automáticamente.')) {
      return
    }
    
    try {
      setActionLoading(cardId)
      const response = await api<CardActionResponse>(`/cards/${cardId}`, { 
        method: 'DELETE',
        token: authToken 
      })
      
      if (response.success) {
        setCards(prev => prev.filter(card => card.id !== cardId))
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar tarjeta')
    } finally {
      setActionLoading(null)
    }
  }
  
  const getCardIcon = (type: string) => {
    // Could add specific icons for VISA, Mastercard, etc.
    return <CreditCard className="h-5 w-5" />
  }
  
  const getCardColor = (type: string) => {
    const colors: Record<string, string> = {
      'VISA': 'from-blue-600 to-blue-800',
      'MASTERCARD': 'from-red-500 to-orange-500',
      'AMEX': 'from-blue-400 to-blue-600',
      'DEFAULT': 'from-gray-500 to-gray-700',
    }
    return colors[type.toUpperCase()] || colors.DEFAULT
  }
  
  if (!hasHydrated || loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Card List */}
      {cards.length === 0 ? (
        <div className="text-center py-8 bg-[#1a1a1a] rounded-xl border border-[#333]">
          <CreditCard className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No tienes tarjetas guardadas</p>
          {oneclickEnabled && (
            <button
              onClick={handleAddCard}
              disabled={actionLoading === 'add'}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {actionLoading === 'add' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Agregar Tarjeta
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-[#1a1a1a] rounded-xl border border-[#333] p-4 flex items-center gap-4"
            >
              {/* Card Visual */}
              <div className={`w-14 h-10 bg-gradient-to-br ${getCardColor(card.cardType)} rounded-lg flex items-center justify-center shadow-lg`}>
                {getCardIcon(card.cardType)}
              </div>
              
              {/* Card Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{card.cardType}</p>
                  {card.isDefault && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Principal
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">•••• •••• •••• {card.cardLastFour}</p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                {!card.isDefault && (
                  <button
                    onClick={() => handleSetDefault(card.id)}
                    disabled={actionLoading === card.id}
                    className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition"
                    title="Establecer como principal"
                  >
                    {actionLoading === card.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  disabled={actionLoading === card.id}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                  title="Eliminar tarjeta"
                >
                  {actionLoading === card.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
          
          {/* Add Card Button */}
          {oneclickEnabled && (
            <button
              onClick={handleAddCard}
              disabled={actionLoading === 'add'}
              className="w-full py-3 border border-dashed border-[#444] text-gray-400 rounded-xl hover:border-pink-500/50 hover:text-pink-400 transition flex items-center justify-center gap-2"
            >
              {actionLoading === 'add' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Agregar otra tarjeta
            </button>
          )}
        </div>
      )}
      
      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        Tus tarjetas se almacenan de forma segura en Transbank. 
        Nunca guardamos los números completos de tus tarjetas.
      </p>
    </div>
  )
}
