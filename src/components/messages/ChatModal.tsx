'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Minimize2, Send, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { messageApi } from '@/lib/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import type { Message, User } from '@/types'

interface ChatModalProps {
  conversationId: string
  otherUser: {
    id: string
    username: string
    displayName: string
    avatar: string | null
  }
  onClose: () => void
}

export default function ChatModal({ conversationId, otherUser, onClose }: ChatModalProps) {
  const { token } = useAuthStore()
  const [messages, setMessages] = useState<(Message & { sender: User })[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = useCallback(async (silent = false) => {
    if (!token) return

    if (!silent) {
      setLoading(true)
    }
    setError(null)

    try {
      const data = await messageApi.getMessages(conversationId, token) as { messages: (Message & { sender: User })[] }
      setMessages(data.messages)

      // Scroll to bottom on first load
      if (!silent) {
        setTimeout(scrollToBottom, 100)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Error al cargar los mensajes')
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [conversationId, token])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !token || sending) return

    setSending(true)
    setError(null)

    try {
      const message = await messageApi.sendMessage(conversationId, {
        content: newMessage.trim(),
        type: 'TEXT'
      }, token) as Message & { sender: User }

      setMessages(prev => [...prev, message])
      setNewMessage('')
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Error al enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages(true)
    }, 15000)

    return () => clearInterval(interval)
  }, [loadMessages])

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 bg-surface-800 border border-white/10 rounded-t-2xl shadow-2xl">
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setIsMinimized(false)}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.displayName)}&background=a21caf&color=fff`}
                alt={otherUser.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-800 rounded-full" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{otherUser.displayName}</h3>
              <p className="text-xs text-gray-400">@{otherUser.username}</p>
            </div>
          </div>
          <X className="w-5 h-5 text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); onClose() }} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full md:w-96 h-[600px] md:h-[600px] max-h-[90vh] bg-surface-800 border border-white/10 rounded-2xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.displayName)}&background=a21caf&color=fff`}
              alt={otherUser.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-800 rounded-full" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{otherUser.displayName}</h3>
            <p className="text-xs text-gray-400">@{otherUser.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Minimizar"
          >
            <Minimize2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-fuchsia-500" />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No hay mensajes aún</p>
            <p className="text-sm text-gray-500 mt-1">Envía el primero para iniciar la conversación</p>
          </div>
        )}

        {messages.map((message) => {
          const isOwn = message.sender.id === useAuthStore.getState().user?.id
          const messageDate = new Date(message.createdAt)

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-fuchsia-500 text-white'
                      : 'bg-white/5 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                  {format(messageDate, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-colors"
            aria-label="Enviar mensaje"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
