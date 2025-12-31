'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { API_URL } from '@/lib/config'
import { Navbar } from '@/components/layout'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { MessageCircle, Search, ArrowLeft } from 'lucide-react'
import { socketService } from '@/lib/socket'

interface Conversation {
  id: string
  otherUser: {
    id: string
    username: string
    displayName: string
    avatar?: string
    isCreator: boolean
  }
  lastMessage: {
    id: string
    content: string
    type: string
    createdAt: string
    senderId: string
  } | null
  unreadCount: number
  lastMessageAt: string
}

export default function MessagesPage() {
  const router = useRouter()
  const { token, user, hasHydrated } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!token || !user) {
      router.push('/login')
      return
    }
    loadConversations()

    // Connect to WebSocket for real-time conversation updates
    socketService.connect(user.id)

    // Listen for new messages - reload conversation list when any message arrives
    const handleMessageNew = () => {
      loadConversations()
    }

    // Listen for unread count updates
    const handleUnreadUpdate = () => {
      loadConversations()
    }

    socketService.on('message:new', handleMessageNew)
    socketService.on('unread:update', handleUnreadUpdate)

    return () => {
      socketService.off('message:new', handleMessageNew)
      socketService.off('unread:update', handleUnreadUpdate)
    }
  }, [token, hasHydrated, user, router])

  const loadConversations = async () => {
    try {
      setError(null)
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      } else {
        setError('No se pudieron cargar las conversaciones')
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Mensajes</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-fuchsia-500/50"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadConversations}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Conversations List */}
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 text-lg">
                {searchQuery ? 'No se encontraron conversaciones' : 'No tienes mensajes aún'}
              </p>
              <p className="text-white/30 text-sm mt-2">
                Visita el perfil de un creador para enviarle un mensaje
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/messages/${conv.id}`)}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {conv.otherUser.avatar ? (
                      <img 
                        src={conv.otherUser.avatar} 
                        alt={conv.otherUser.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {conv.otherUser.displayName[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-white' : 'text-white/80'}`}>
                      {conv.otherUser.displayName}
                    </span>
                    <span className="text-xs text-white/40 flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/40">@{conv.otherUser.username}</span>
                    {conv.otherUser.isCreator && (
                      <span className="text-xs px-2 py-0.5 bg-fuchsia-500/20 text-fuchsia-400 rounded-full">
                        Creador
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className={`text-sm truncate mt-1 ${conv.unreadCount > 0 ? 'text-white/70 font-medium' : 'text-white/40'}`}>
                      {conv.lastMessage.senderId === user?.id ? 'Tú: ' : ''}
                      {conv.lastMessage.type === 'TEXT' 
                        ? truncateMessage(conv.lastMessage.content)
                        : conv.lastMessage.type === 'IMAGE' ? '📷 Imagen' 
                        : conv.lastMessage.type === 'VIDEO' ? '🎬 Video'
                        : conv.lastMessage.content
                      }
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
