'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Star,
  Loader2,
  ChevronDown,
  Image as ImageIcon,
  X,
  MessageSquare
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { broadcastsApi, subscriptionsApi, BroadcastTarget, BroadcastStatus, Broadcast } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'

const TARGET_OPTIONS: { value: BroadcastTarget; label: string; description: string; icon: any }[] = [
  { 
    value: 'ALL_SUBSCRIBERS', 
    label: 'Todos los suscriptores', 
    description: 'Envía a todos tus suscriptores activos',
    icon: Users
  },
  { 
    value: 'SPECIFIC_TIERS', 
    label: 'Planes específicos', 
    description: 'Solo suscriptores de ciertos planes',
    icon: Star
  },
  { 
    value: 'NEW_SUBSCRIBERS', 
    label: 'Nuevos suscriptores', 
    description: 'Suscritos en los últimos 7 días',
    icon: Clock
  },
  { 
    value: 'EXPIRING_SOON', 
    label: 'Por vencer', 
    description: 'Suscripciones que expiran en 7 días',
    icon: AlertCircle
  },
]

const STATUS_BADGES: Record<BroadcastStatus, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  SCHEDULED: { label: 'Programado', color: 'bg-blue-500/20 text-blue-400', icon: Calendar },
  PROCESSING: { label: 'Enviando...', color: 'bg-purple-500/20 text-purple-400', icon: Loader2 },
  COMPLETED: { label: 'Enviado', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  FAILED: { label: 'Error', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-500/20 text-gray-400', icon: XCircle },
}

interface SubscriptionTier {
  id: string
  name: string
  price: number
  isActive: boolean
}

export default function BroadcastsPage() {
  const router = useRouter()
  const { token, user, hasHydrated } = useAuthStore()
  
  // State
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [tiers, setTiers] = useState<SubscriptionTier[]>([])
  
  // Form state
  const [content, setContent] = useState('')
  const [targetType, setTargetType] = useState<BroadcastTarget>('ALL_SUBSCRIBERS')
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [scheduledFor, setScheduledFor] = useState('')
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(false)
  
  // Stats
  const [stats, setStats] = useState<{
    totalBroadcasts: number
    totalMessagesSent: number
    scheduledBroadcasts: number
  } | null>(null)

  // Proteger ruta
  useEffect(() => {
    if (!hasHydrated) return
    if (!token || !user?.isCreator) {
      router.push('/login')
    }
  }, [token, user, hasHydrated, router])

  // Cargar datos
  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [broadcastsRes, tiersRes, statsRes] = await Promise.all([
        broadcastsApi.list(token),
        subscriptionsApi.getMyTiers(token),
        broadcastsApi.getStats(token)
      ])
      setBroadcasts(broadcastsRes.broadcasts)
      setTiers(tiersRes.filter((t: any) => t.isActive))
      setStats(statsRes)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cargar conteo de destinatarios cuando cambia el targeting
  useEffect(() => {
    if (!token) return
    
    const fetchCount = async () => {
      setLoadingCount(true)
      try {
        const result = await broadcastsApi.getSubscriberCount(
          targetType,
          targetType === 'SPECIFIC_TIERS' ? selectedTiers : undefined,
          token
        )
        setRecipientCount(result.count)
      } catch (error) {
        console.error('Error fetching count:', error)
        setRecipientCount(null)
      } finally {
        setLoadingCount(false)
      }
    }

    const debounce = setTimeout(fetchCount, 300)
    return () => clearTimeout(debounce)
  }, [token, targetType, selectedTiers])

  // Enviar broadcast
  const handleSend = async () => {
    if (!token || !content.trim()) return
    if (targetType === 'SPECIFIC_TIERS' && selectedTiers.length === 0) {
      alert('Selecciona al menos un plan')
      return
    }

    setSending(true)
    try {
      await broadcastsApi.create({
        content: content.trim(),
        targetType,
        targetTierIds: targetType === 'SPECIFIC_TIERS' ? selectedTiers : undefined,
        scheduledFor: scheduledFor || undefined
      }, token)

      // Limpiar formulario
      setContent('')
      setScheduledFor('')
      setSelectedTiers([])
      setTargetType('ALL_SUBSCRIBERS')

      // Recargar lista
      fetchData()

      alert(scheduledFor ? '✅ Mensaje programado correctamente' : '✅ Mensaje enviado correctamente')
    } catch (error: any) {
      console.error('Error sending broadcast:', error)
      alert(error.message || 'Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }

  // Cancelar broadcast
  const handleCancel = async (id: string) => {
    if (!token) return
    if (!confirm('¿Cancelar este mensaje programado?')) return

    try {
      await broadcastsApi.cancel(id, token)
      fetchData()
    } catch (error: any) {
      alert(error.message || 'Error al cancelar')
    }
  }

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Send className="w-7 h-7 text-pink-500" />
            Mass DM
          </h1>
          <p className="text-gray-400 mt-1">
            Envía mensajes a todos tus suscriptores o grupos específicos
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Mensajes enviados</p>
              <p className="text-2xl font-bold text-white">{stats.totalMessagesSent.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Broadcasts totales</p>
              <p className="text-2xl font-bold text-white">{stats.totalBroadcasts}</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Programados</p>
              <p className="text-2xl font-bold text-white">{stats.scheduledBroadcasts}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Compose Form */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-500" />
              Nuevo Mensaje
            </h2>

            {/* Message Content */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Mensaje</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{content.length}/1000 caracteres</p>
            </div>

            {/* Target Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Destinatarios</label>
              <div className="space-y-2">
                {TARGET_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTargetType(option.value)
                        if (option.value !== 'SPECIFIC_TIERS') {
                          setSelectedTiers([])
                        }
                      }}
                      className={`w-full p-3 rounded-xl border transition text-left flex items-center gap-3 ${
                        targetType === option.value
                          ? 'bg-pink-500/20 border-pink-500'
                          : 'bg-gray-900 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${targetType === option.value ? 'text-pink-400' : 'text-gray-400'}`} />
                      <div>
                        <p className={`font-medium ${targetType === option.value ? 'text-pink-400' : 'text-white'}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tier Selection (if SPECIFIC_TIERS) */}
            {targetType === 'SPECIFIC_TIERS' && tiers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Seleccionar planes</label>
                <div className="space-y-2">
                  {tiers.map((tier) => (
                    <label
                      key={tier.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                        selectedTiers.includes(tier.id)
                          ? 'bg-pink-500/10 border border-pink-500/50'
                          : 'bg-gray-900 border border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTiers.includes(tier.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTiers([...selectedTiers, tier.id])
                          } else {
                            setSelectedTiers(selectedTiers.filter(id => id !== tier.id))
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-500 text-pink-500 focus:ring-pink-500 bg-gray-800"
                      />
                      <span className="text-white">{tier.name}</span>
                      <span className="text-sm text-gray-400">${tier.price.toLocaleString('es-CL')}/mes</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Programar envío (opcional)
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">Deja vacío para enviar inmediatamente</p>
            </div>

            {/* Recipient Count & Send Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4" />
                {loadingCount ? (
                  <span className="text-sm">Calculando...</span>
                ) : recipientCount !== null ? (
                  <span className="text-sm">
                    <span className="text-white font-medium">{recipientCount}</span> destinatarios
                  </span>
                ) : (
                  <span className="text-sm">--</span>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={sending || !content.trim() || recipientCount === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : scheduledFor ? (
                  <>
                    <Calendar className="w-4 h-4" />
                    Programar
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar ahora
                  </>
                )}
              </button>
            </div>
          </div>

          {/* History */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Historial</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="text-center py-8">
                <Send className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Aún no has enviado mensajes masivos</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {broadcasts.map((broadcast) => {
                  const statusInfo = STATUS_BADGES[broadcast.status]
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <div
                      key={broadcast.id}
                      className="p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-white text-sm line-clamp-2">{broadcast.content}</p>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.color}`}>
                          <StatusIcon className={`w-3 h-3 ${broadcast.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {broadcast.sentCount}/{broadcast.totalRecipients}
                          </span>
                          <span>
                            {new Date(broadcast.createdAt).toLocaleDateString('es-CL', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {broadcast.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleCancel(broadcast.id)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>

                      {broadcast.failedCount > 0 && (
                        <p className="text-xs text-red-400 mt-2">
                          {broadcast.failedCount} mensajes fallidos
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
