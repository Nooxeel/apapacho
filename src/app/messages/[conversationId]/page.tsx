'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { API_URL } from '@/lib/config'
import { Navbar } from '@/components/layout'
import { format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ArrowLeft, Send, MoreVertical, Image as ImageIcon, Trash2 } from 'lucide-react'

interface Message {
  id: string
  content: string
  type: string
  createdAt: string
  readAt: string | null
  sender: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
}

interface OtherUser {
  id: string
  username: string
  displayName: string
  avatar?: string
  isCreator: boolean
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.conversationId as string
  const { token, user, hasHydrated } = useAuthStore()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversationInfo = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const conversations = await res.json()
        const conv = conversations.find((c: { id: string; otherUser: OtherUser }) => c.id === conversationId)
        if (conv) {
          setOtherUser(conv.otherUser)
        }
      }
    } catch (error) {
      console.error('Error loading conversation info:', error)
    }
  }, [conversationId, token])

  const loadMessages = useCallback(async (cursor?: string, silent = false) => {
    try {
      const url = cursor
        ? `${API_URL}/messages/conversations/${conversationId}/messages?cursor=${cursor}`
        : `${API_URL}/messages/conversations/${conversationId}/messages`

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        if (cursor) {
          setMessages(prev => [...data.messages, ...prev])
        } else {
          setMessages(data.messages)
        }
        setNextCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      } else if (res.status === 404) {
        router.push('/messages')
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [conversationId, token, router])

  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login')
      return
    }
    loadConversationInfo()
    loadMessages()
  }, [token, hasHydrated, router, loadMessages])

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom()
    }
  }, [loading, messages.length])

  // Poll for new messages every 3 seconds for near-instant delivery
  useEffect(() => {
    if (!token || !conversationId || loading) return

    const interval = setInterval(() => {
      // Silent refresh - don't show loading spinner
      loadMessages(undefined, true)
    }, 3000) // 3 seconds for near-instant message delivery

    return () => clearInterval(interval)
  }, [token, conversationId, loading])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage.trim() })
      })

      if (res.ok) {
        const message = await res.json()
        setMessages(prev => [...prev, message])
        setNewMessage('')
        scrollToBottom()
      } else {
        setError('No se pudo enviar el mensaje. Intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Error de conexión. Verifica tu internet.')
    } finally {
      setSending(false)
    }
  }

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return `Ayer ${format(date, 'HH:mm')}`
    }
    return format(date, 'd MMM HH:mm', { locale: es })
  }

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ''

    msgs.forEach((msg) => {
      const msgDate = format(new Date(msg.createdAt), 'yyyy-MM-dd')
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msgDate, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    })

    return groups
  }

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Hoy'
    if (isYesterday(date)) return 'Ayer'
    return format(date, 'd MMMM yyyy', { locale: es })
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="min-h-screen bg-[#0f0f14] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0f0f14]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.push('/messages')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          {otherUser && (
            <button 
              onClick={() => router.push(`/${otherUser.username}`)}
              className="flex items-center gap-3 flex-1 hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {otherUser.avatar ? (
                  <img 
                    src={otherUser.avatar} 
                    alt={otherUser.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-white">
                    {otherUser.displayName[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">{otherUser.displayName}</p>
                <p className="text-xs text-white/40">@{otherUser.username}</p>
              </div>
            </button>
          )}

          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <MoreVertical className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Load More Button */}
          {hasMore && (
            <button
              onClick={() => loadMessages(nextCursor!)}
              className="w-full py-2 text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
            >
              Cargar mensajes anteriores
            </button>
          )}

          {messageGroups.map((group) => (
            <div key={group.date}>
              {/* Date Header */}
              <div className="flex items-center justify-center mb-4">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/50">
                  {formatDateHeader(group.date)}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {group.messages.map((msg) => {
                  const isOwn = msg.sender.id === user?.id
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-fuchsia-500 text-white rounded-br-md'
                              : 'bg-white/10 text-white rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-white/30">
                            {formatMessageDate(msg.createdAt)}
                          </span>
                          {isOwn && msg.readAt && (
                            <span className="text-xs text-fuchsia-400">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/50">
                Inicia la conversación enviando un mensaje
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-[#0f0f14] border-t border-white/10">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto px-4 py-3">
          {/* Error Message */}
          {error && (
            <div className="mb-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 focus-within:border-fuchsia-500/50 transition-colors">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="w-full px-4 py-3 bg-transparent text-white placeholder-white/40 resize-none focus:outline-none max-h-32"
                style={{ minHeight: '48px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-fuchsia-500/50 disabled:cursor-not-allowed rounded-full transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
