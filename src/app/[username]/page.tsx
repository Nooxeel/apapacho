'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { creatorApi, subscriptionsApi, promocodesApi, missionsApi } from '@/lib/api'
import { getFontStyle } from '@/lib/fonts'
import { MusicPlayer, Comments, FavoriteButton, PostsFeed } from '@/components/profile'
import { ProfileFontsLoader } from '@/components/profile/ProfileFontsLoader'
import { Navbar } from '@/components/layout'
import ChatModal from '@/components/messages/ChatModal'
import SocialLinksDisplay from '@/components/social/SocialLinksDisplay'
import { useAuthStore } from '@/stores/authStore'
import { socketService } from '@/lib/socket'
import { API_URL } from '@/lib/config'
import { useWebpay } from '@/hooks/useWebpay'
import {
  Heart,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  MessageCircle,
  Share2,
  BadgeCheck,
  Lock,
  Ticket,
  Check,
  X
} from 'lucide-react'
import { AvatarWithProgress } from '@/components/gamification'

interface CreatorProfile {
  id: string
  username: string
  displayName: string
  avatar?: string
  creatorProfile: {
    id: string
    bio?: string
    bioTitle?: string
    extendedInfo?: string
    extendedInfoTitle?: string
    profileImage?: string
    coverImage?: string
    backgroundColor: string
    backgroundGradient?: string
    accentColor: string
    textColor: string
    fontFamily: string
    isVerified: boolean
    visibilitySettings?: {
      tabs: {
        likes: boolean
        posts: boolean
        photos: boolean
        videos: boolean
        audio: boolean
        guestbook: boolean
        tipping: boolean
        postTipping: boolean
      }
      messaging?: 'all' | 'logged_in' | 'subscribers_only'
    }
    musicTracks: Array<{
      id: string
      youtubeUrl: string
      youtubeId: string
      title: string
      artist?: string
      thumbnail: string
      order: number
    }>
    socialLinks: Array<{
      id: string
      creatorId: string
      platform: string
      url: string
      label?: string
      icon?: string
      order: number
      isVisible: boolean
      createdAt: string
      updatedAt: string
    }>
    subscriptionTiers: Array<{
      id: string
      name: string
      price: number
      currency: string
      description?: string
      benefits: string
      isActive: boolean
    }>
    stats: {
      totalLikes: number
      totalViews: number
      postsCount: number
      photosCount: number
      videosCount: number
      subscribersCount: number
      audioCount: number
    }
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

export default function CreatorPublicProfile() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const { user, token } = useAuthStore()
  
  const [creator, setCreator] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'videos' | 'audio' | 'comments'>('posts')
  const [commentsCount, setCommentsCount] = useState(0)
  const [isSubscriber, setIsSubscriber] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatConversationId, setChatConversationId] = useState<string | null>(null)
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState<{ tierName: string; endDate: string } | null>(null)
  const [showManageModal, setShowManageModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null)

  // Promocode state
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoDiscount, setPromoDiscount] = useState<{
    promocodeId: string
    code: string
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL'
    value: number
    description: string
    originalAmount: number
    discountAmount: number
    finalAmount: number
  } | null>(null)
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null)

  // Real-time stats (sincronizado con polling de mensajes)
  const [totalLikes, setTotalLikes] = useState(0)

  // Webpay hook
  const { payForSubscription, loading: webpayLoading, error: webpayError } = useWebpay()
  const [totalPostComments, setTotalPostComments] = useState(0)

  // Set initial active tab based on visibility settings
  useEffect(() => {
    if (creator?.creatorProfile?.visibilitySettings?.tabs) {
      const tabs = creator.creatorProfile.visibilitySettings.tabs
      if (tabs.posts === false && activeTab === 'posts') {
        // Find first visible tab
        if (tabs.photos !== false) setActiveTab('photos')
        else if (tabs.videos !== false) setActiveTab('videos')
        else if (tabs.audio !== false) setActiveTab('audio')
        else if (tabs.guestbook !== false) setActiveTab('comments')
      }
    }
  }, [creator, activeTab])

  useEffect(() => {
    async function fetchCreator() {
      try {
        setLoading(true)
        const data = await creatorApi.getByUsername(username) as CreatorProfile
        console.log('[PROFILE] Loaded creator data, fontFamily:', data.creatorProfile?.fontFamily)
        setCreator(data)

        // Cargar conteo de comentarios
        try {
          const statsRes = await fetch(`${API_URL}/comments/${data.creatorProfile.id}/stats`)
          if (statsRes.ok) {
            const stats = await statsRes.json()
            setCommentsCount(stats.approved)
          }
        } catch {}

        // Verificar si el usuario actual es suscriptor
        if (token && user && data.creatorProfile?.id) {
          try {
            const subCheck = await subscriptionsApi.checkSubscription(data.creatorProfile.id, token)
            setIsSubscriber(subCheck.isSubscribed)
          } catch (error) {
            console.error('Error checking subscription:', error)
          }

          // Track profile visit for missions (only if not viewing own profile)
          if (user.id !== data.id) {
            missionsApi.trackProgress(token, 'visit').catch(() => {})
          }
        }
      } catch (err) {
        setError('Creador no encontrado')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchCreator()
    }
  }, [username, token, user])

  // Polling para actualizar stats en tiempo real (sincronizado con mensajes - cada 3 segundos)
  useEffect(() => {
    if (!creator?.creatorProfile?.id) return

    const loadStats = async () => {
      try {
        const stats = await creatorApi.getStats(creator.creatorProfile.id) as { totalLikes: number; totalPostComments: number }
        setTotalLikes(stats.totalLikes)
        setTotalPostComments(stats.totalPostComments)
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    // Cargar stats iniciales
    loadStats()

    // Listen for stats updates via WebSocket (only if user is authenticated)
    if (user) {
      socketService.connect(user.id)

      const handleStatsUpdate = () => {
        loadStats() // Reload stats when likes/comments change
      }

      socketService.on('stats:update', handleStatsUpdate)

      return () => {
        socketService.off('stats:update', handleStatsUpdate)
      }
    }
  }, [creator?.creatorProfile?.id, user])

  // Verificar si el usuario puede enviar mensajes según la configuración de privacidad
  const canSendMessage = () => {
    if (!creator) return false

    const messagingPrivacy = creator.creatorProfile.visibilitySettings?.messaging || 'logged_in'

    // Si es 'all', cualquiera puede enviar mensajes (aunque aún requiere login para funcionar)
    if (messagingPrivacy === 'all') {
      return true
    }

    // Si es 'logged_in', necesita estar autenticado
    if (messagingPrivacy === 'logged_in') {
      return !!user
    }

    // Si es 'subscribers_only', necesita estar suscrito
    if (messagingPrivacy === 'subscribers_only') {
      return isSubscriber
    }

    return false
  }

  // Formatear precio en CLP
  const formatPriceCLP = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Validar código promocional
  const handleValidatePromocode = async () => {
    if (!promoCode.trim() || !creator || !selectedTierId) return

    const tier = profile.subscriptionTiers.find(t => t.id === selectedTierId)
    if (!tier) return

    setPromoLoading(true)
    setPromoError('')

    try {
      const result = await promocodesApi.validate(
        promoCode.trim(),
        creator.creatorProfile.id,
        selectedTierId,
        tier.price,
        token || undefined
      )

      if (result.valid && result.promocode && result.discount) {
        setPromoDiscount({
          promocodeId: result.promocode.id,
          code: result.promocode.code,
          type: result.promocode.type,
          value: result.promocode.value,
          description: result.promocode.description,
          originalAmount: result.discount.originalAmount,
          discountAmount: result.discount.discountAmount,
          finalAmount: result.discount.finalAmount
        })
      } else {
        setPromoError(result.error || 'Código inválido')
        setPromoDiscount(null)
      }
    } catch (error: any) {
      setPromoError(error.message || 'Error al validar código')
      setPromoDiscount(null)
    } finally {
      setPromoLoading(false)
    }
  }

  // Limpiar promocode
  const clearPromocode = () => {
    setPromoCode('')
    setPromoDiscount(null)
    setPromoError('')
  }

  // Handler para suscribirse
  const handleSubscribe = async (tierId: string) => {
    if (!token || !creator) {
      router.push('/login')
      return
    }

    const tier = profile.subscriptionTiers.find(t => t.id === tierId)
    if (!tier) {
      alert('Plan no encontrado')
      return
    }

    // Calcular precio final (con promocode si aplica)
    const finalPrice = promoDiscount && selectedTierId === tierId 
      ? promoDiscount.finalAmount 
      : tier.price

    setSubscribing(true)
    try {
      // Si el precio es 0 (promocode free trial), suscribir directamente
      if (finalPrice === 0) {
        const response = await subscriptionsApi.subscribe(creator.creatorProfile.id, tierId, token)
        
        // Registrar redención del promocode
        if (promoDiscount) {
          try {
            await promocodesApi.redeem({
              promocodeId: promoDiscount.promocodeId,
              subscriptionId: response.subscription?.id,
              originalAmount: promoDiscount.originalAmount,
              discountAmount: promoDiscount.discountAmount,
              finalAmount: promoDiscount.finalAmount
            }, token)
          } catch (redeemError) {
            console.error('Error redeeming promocode:', redeemError)
          }
        }
        
        setIsSubscriber(true)
        setShowSubscribeModal(false)
        clearPromocode()
        setSelectedTierId(null)
        
        setSuccessMessage({
          tierName: tier.name,
          endDate: new Date(response.subscription.endDate).toLocaleDateString('es-CL')
        })
        setShowSuccessModal(true)
        
        const updatedCreator = await creatorApi.getByUsername(username)
        setCreator(updatedCreator as CreatorProfile)
        return
      }

      // Usar Webpay para pagos con monto > 0
      // El usuario será redirigido a la página de Transbank
      const result = await payForSubscription(tierId, creator.creatorProfile.id, finalPrice)
      
      if (!result.success) {
        throw new Error(result.error || 'Error al iniciar pago')
      }
      
      // Si llegamos aquí, el usuario fue redirigido a Webpay
      // La página /payments/result manejará el resultado
      
    } catch (error: any) {
      console.error('Error al suscribirse:', error)
      alert(error.message || 'Error al procesar el pago. Intenta de nuevo.')
    } finally {
      setSubscribing(false)
    }
  }

  // Handler para cancelar suscripción
  const handleCancelSubscription = async () => {
    if (!token || !creator) return

    setCancelling(true)
    try {
      await subscriptionsApi.unsubscribe(creator.creatorProfile.id, token)
      
      setShowCancelConfirm(false)
      setShowManageModal(false)
      
      // Recargar perfil para obtener el estado actualizado de la suscripción
      const updatedCreator = await creatorApi.getByUsername(username) as CreatorProfile
      setCreator(updatedCreator)
      
      // Verificar estado de suscripción actualizado
      if (token && user) {
        try {
          const subCheck = await subscriptionsApi.checkSubscription(updatedCreator.creatorProfile.id, token)
          setIsSubscriber(subCheck.isSubscribed)
          setSubscriptionDetails(subCheck.subscription)
          
          if (subCheck.subscription?.endDate) {
            const endDate = new Date(subCheck.subscription.endDate)
            const formattedDate = endDate.toLocaleDateString('es-CL', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })
            alert(`✅ Suscripción cancelada. Mantendrás acceso hasta el ${formattedDate}.`)
          } else {
            alert('✅ Suscripción cancelada.')
          }
        } catch (error) {
          console.error('Error checking subscription:', error)
        }
      }
      
    } catch (error: any) {
      console.error('Error al cancelar suscripción:', error)
      alert(error.message || 'Error al cancelar la suscripción. Intenta de nuevo.')
    } finally {
      setCancelling(false)
    }
  }

  // Cargar detalles de suscripción cuando se abre el modal
  const loadSubscriptionDetails = async () => {
    if (!token || !creator) return
    
    try {
      const result = await subscriptionsApi.checkSubscription(creator.creatorProfile.id, token)
      if (result.subscription) {
        setSubscriptionDetails(result.subscription)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  // Handler para enviar mensaje
  const handleSendMessage = async () => {
    if (!token || !creator) {
      // Si no está autenticado, redirigir al login
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${API_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipientId: creator.id })
      })

      if (res.ok) {
        const conversation = await res.json()
        setChatConversationId(conversation.id)
        setShowChat(true)
      } else {
        console.error('Error creating conversation:', res.status)
        alert('No se pudo iniciar la conversación. Intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert('Error de conexión. Verifica tu internet.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    )
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Creador no encontrado</h1>
          <p className="text-gray-400">El perfil que buscas no existe o fue eliminado.</p>
        </div>
      </div>
    )
  }

  const profile = creator.creatorProfile
  const stats = profile.stats
  const mainTier = profile.subscriptionTiers[0]
  
  // Verificar si el usuario actual es el dueño del perfil
  const isOwner = user?.id === creator.id

  // Build image URLs (images are now served from frontend /public/images)
  const coverImageUrl = profile.coverImage 
    ? profile.coverImage 
    : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop'
  
  const profileImageUrl = profile.profileImage 
    ? profile.profileImage 
    : creator.avatar 
      ? creator.avatar 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.displayName)}&size=150&background=random`

  return (
    <>
      <ProfileFontsLoader />
      <Navbar />
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: profile.backgroundColor,
          color: profile.textColor,
          fontFamily: getFontStyle(profile.fontFamily),
        }}
      >
        {/* Cover Image */}
        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden bg-black/40">
          <Image
            src={coverImageUrl}
            alt={`${creator.displayName} cover`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            quality={95}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        </div>

      {/* Profile Section */}
      <div className="relative -mt-24 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <AvatarWithProgress
              userId={creator.id}
              size={152}
              strokeWidth={5}
              accentColor={profile.accentColor}
              showLevelBadge={true}
            >
              <Image
                src={profileImageUrl}
                alt={creator.displayName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 150px, 200px"
              />
            </AvatarWithProgress>

            {/* Title with verification */}
            <div className="mt-4 flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.extendedInfoTitle || creator.username}</h1>
              {profile.isVerified && (
                <BadgeCheck 
                  className="w-6 h-6" 
                  style={{ color: profile.accentColor }}
                  fill={profile.accentColor}
                />
              )}
            </div>

            {/* Extended Info - Main content */}
            {profile.extendedInfo && (
              <div className="mt-4 text-center text-gray-300 max-w-2xl whitespace-pre-line">
                <p className="text-lg leading-relaxed">
                  {profile.extendedInfo}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {/* Botón de Suscripción */}
              {mainTier && !isOwner && !isSubscriber && (
                <button
                  onClick={() => setShowSubscribeModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: profile.accentColor }}
                >
                  <Lock className="w-5 h-5" />
                  Suscribirse {formatPriceCLP(mainTier.price)}/mes
                </button>
              )}

              {/* Botón de gestión si ya está suscrito */}
              {isSubscriber && !isOwner && (
                <button
                  onClick={() => {
                    loadSubscriptionDetails()
                    setShowManageModal(true)
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: profile.accentColor }}
                >
                  <BadgeCheck className="w-5 h-5" />
                  Suscrito
                </button>
              )}

              {/* Botón de Propina - Configurable */}
              {(profile.visibilitySettings?.tabs?.tipping !== false) && (
                <button className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-600 bg-transparent hover:bg-white/5 transition-colors">
                  <span className="text-lg">💰</span>
                  Propina
                </button>
              )}

              {/* Botón de Favorito */}
              {!isOwner && (
                <FavoriteButton
                  creatorId={profile.id}
                  accentColor={profile.accentColor}
                  size="md"
                />
              )}

              {/* Botón de Mensaje - Con control de privacidad */}
              {!isOwner && canSendMessage() && (
                <button
                  onClick={handleSendMessage}
                  className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-fuchsia-500/50 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-colors text-white font-medium"
                  title="Enviar mensaje"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Mensaje</span>
                </button>
              )}

              <button className="p-3 rounded-full border border-gray-600 hover:bg-white/5 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-12">
              {(profile.visibilitySettings?.tabs?.likes !== false) && (
                <StatItem
                  icon={<Heart className="w-5 h-5" />}
                  value={formatNumber(totalLikes || stats.totalLikes)}
                  label="Likes"
                  accentColor={profile.accentColor}
                />
              )}
              {(profile.visibilitySettings?.tabs?.posts !== false) && (
                <StatItem
                  icon={<FileText className="w-5 h-5" />}
                  value={formatNumber(stats.postsCount)}
                  label="Posts"
                  accentColor={profile.accentColor}
                  active={activeTab === 'posts'}
                  onClick={() => setActiveTab('posts')}
                />
              )}
              {/* Nuevo: Contador de comentarios de posts */}
              {(profile.visibilitySettings?.tabs?.posts !== false) && totalPostComments > 0 && (
                <StatItem
                  icon={<MessageCircle className="w-5 h-5" />}
                  value={formatNumber(totalPostComments)}
                  label="Comentarios"
                  accentColor={profile.accentColor}
                />
              )}
              {(profile.visibilitySettings?.tabs?.photos !== false) && (
                <StatItem 
                  icon={<ImageIcon className="w-5 h-5" />} 
                  value={formatNumber(stats.photosCount)} 
                  label="Fotos" 
                  accentColor={profile.accentColor}
                  active={activeTab === 'photos'}
                  onClick={() => setActiveTab('photos')}
                />
              )}
              {(profile.visibilitySettings?.tabs?.videos !== false) && (
                <StatItem 
                  icon={<Video className="w-5 h-5" />} 
                  value={formatNumber(stats.videosCount)} 
                  label="Videos" 
                  accentColor={profile.accentColor}
                  active={activeTab === 'videos'}
                  onClick={() => setActiveTab('videos')}
                />
              )}
              {(profile.visibilitySettings?.tabs?.audio !== false) && (
                <StatItem 
                  icon={<Mic className="w-5 h-5" />} 
                  value={formatNumber(stats.audioCount)} 
                  label="Audio" 
                  accentColor={profile.accentColor}
                  active={activeTab === 'audio'}
                  onClick={() => setActiveTab('audio')}
                />
              )}
              {(profile.visibilitySettings?.tabs?.guestbook !== false) && (
                <StatItem 
                  icon={<MessageCircle className="w-5 h-5" />} 
                  value={formatNumber(commentsCount)} 
                  label="Libro de visitas" 
                  accentColor={profile.accentColor}
                  active={activeTab === 'comments'}
                  onClick={() => setActiveTab('comments')}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* About Me */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 rounded-xl p-5 backdrop-blur-sm border border-white/10">
              <h3 className="font-semibold text-lg mb-3">{profile.bioTitle || 'Acerca de mí'}</h3>
              <p className="text-gray-300 text-sm whitespace-pre-line">
                {profile.bio || 'Este creador aún no ha agregado una descripción.'}
              </p>
              
              {/* Social Links */}
              {profile.socialLinks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="font-medium text-sm mb-3">Enlaces</h4>
                  <SocialLinksDisplay
                    links={profile.socialLinks}
                    variant="default"
                  />
                </div>
              )}

              {/* Subscription Tiers */}
              {profile.subscriptionTiers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="font-medium text-sm mb-3">Planes de Suscripción</h4>
                  <div className="space-y-2">
                    {profile.subscriptionTiers.map(tier => (
                      <div
                        key={tier.id}
                        className="p-3 rounded-lg border border-white/20 hover:border-white/40 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{tier.name}</span>
                          <span 
                            className="font-bold"
                            style={{ color: profile.accentColor }}
                          >
                            ${tier.price.toFixed(2)}/mes
                          </span>
                        </div>
                        {tier.description && (
                          <p className="text-xs text-gray-400 mt-1">{tier.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Music Player */}
            {profile.musicTracks && profile.musicTracks.length > 0 && (
              <MusicPlayer
                tracks={profile.musicTracks}
                autoPlay={false}
                accentColor={profile.accentColor}
              />
            )}
          </div>

          {/* Posts Feed / Comments */}
          <div className="lg:col-span-5">
            {activeTab === 'comments' ? (
              <Comments 
                creatorId={profile.id}
                isOwner={isOwner}
                accentColor={profile.accentColor}
              />
            ) : (
              <PostsFeed 
                creatorId={profile.id}
                accentColor={profile.accentColor}
                filterType={activeTab}
                onSubscribeClick={() => setShowSubscribeModal(true)}
                isSubscriber={isSubscriber}
                isOwner={isOwner}
                showPostTipping={profile.visibilitySettings?.tabs?.postTipping !== false}
              />
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Chat Modal */}
      {showChat && chatConversationId && creator && (
        <ChatModal
          conversationId={chatConversationId}
          otherUser={{
            id: creator.id,
            username: creator.username,
            displayName: creator.displayName,
            avatar: creator.avatar || null
          }}
          onClose={() => {
            setShowChat(false)
            setChatConversationId(null)
          }}
        />
      )}

      {/* Subscribe Modal */}
      {showSubscribeModal && creator && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => {
            setShowSubscribeModal(false)
            clearPromocode()
            setSelectedTierId(null)
          }}
        >
          <div 
            className="bg-[#1a1a24] rounded-2xl border border-white/10 max-w-md w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2">Suscribirse a {creator.displayName}</h2>
              <p className="text-white/60 text-sm mb-6">Elige un plan para acceder a contenido exclusivo</p>
              
              <div className="space-y-4">
                {profile.subscriptionTiers.filter(t => t.isActive).map((tier) => {
                  const isSelected = selectedTierId === tier.id
                  const showDiscount = isSelected && promoDiscount
                  const finalPrice = showDiscount ? promoDiscount.finalAmount : tier.price
                  
                  return (
                    <div
                      key={tier.id}
                      onClick={() => {
                        setSelectedTierId(tier.id)
                        // Revalidar promocode si hay uno ingresado
                        if (promoCode.trim() && promoDiscount) {
                          setPromoDiscount(null)
                          // La validación se hará al hacer click en aplicar
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-pink-500 bg-pink-500/10' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{tier.name}</h3>
                        <div className="text-right">
                          {showDiscount && (
                            <span className="text-sm text-white/40 line-through mr-2">
                              {formatPriceCLP(tier.price)}
                            </span>
                          )}
                          <span className="text-xl font-bold" style={{ color: profile.accentColor }}>
                            {formatPriceCLP(finalPrice)}
                            <span className="text-sm font-normal text-white/50">/mes</span>
                          </span>
                        </div>
                      </div>
                      
                      {tier.description && (
                        <p className="text-sm text-white/60 mb-3">{tier.description}</p>
                      )}
                      
                      {tier.benefits && (
                        <div className="text-sm text-white/50 mb-4 space-y-1">
                          {tier.benefits.split('\n').filter(b => b.trim()).map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-green-400 text-xs">✓</span>
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Promocode section - solo visible cuando está seleccionado */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <Ticket className="w-4 h-4" />
                            <span>¿Tienes un código promocional?</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => {
                                  setPromoCode(e.target.value.toUpperCase())
                                  setPromoError('')
                                }}
                                placeholder="CODIGO2024"
                                disabled={!!promoDiscount}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm disabled:opacity-50"
                              />
                              {promoDiscount && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    clearPromocode()
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded transition"
                                >
                                  <X className="w-4 h-4 text-gray-400" />
                                </button>
                              )}
                            </div>
                            {!promoDiscount ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleValidatePromocode()
                                }}
                                disabled={promoLoading || !promoCode.trim()}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {promoLoading ? '...' : 'Aplicar'}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                <Check className="w-4 h-4" />
                                <span>Aplicado</span>
                              </div>
                            )}
                          </div>

                          {/* Error de promocode */}
                          {promoError && (
                            <p className="text-red-400 text-xs mt-2">{promoError}</p>
                          )}

                          {/* Descuento aplicado */}
                          {promoDiscount && (
                            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <p className="text-green-400 text-sm font-medium">
                                {promoDiscount.description}
                              </p>
                              <p className="text-green-300/80 text-xs mt-1">
                                Ahorras {formatPriceCLP(promoDiscount.discountAmount)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSubscribe(tier.id)
                        }}
                        disabled={subscribing}
                        className="w-full py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-3"
                        style={{ backgroundColor: profile.accentColor }}
                      >
                        {subscribing ? 'Procesando...' : (
                          showDiscount && promoDiscount.finalAmount === 0 
                            ? '¡Suscribirse Gratis!' 
                            : `Suscribirse ${showDiscount ? `por ${formatPriceCLP(finalPrice)}` : ''}`
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
              
              <button
                onClick={() => {
                  setShowSubscribeModal(false)
                  clearPromocode()
                  setSelectedTierId(null)
                }}
                className="w-full mt-4 py-2 text-white/50 hover:text-white transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <div 
            className="bg-[#1a1a24] rounded-2xl border border-white/10 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              {/* Success Icon */}
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: `${profile.accentColor}20` }}
              >
                <BadgeCheck 
                  className="w-10 h-10" 
                  style={{ color: profile.accentColor }}
                  fill={profile.accentColor}
                />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white">
                ¡Suscripción exitosa! 🎉
              </h2>

              {/* Message */}
              <div className="space-y-2 text-white/80">
                <p>Ahora eres suscriptor de <span className="font-semibold text-white">{creator.displayName}</span></p>
                <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm">
                  <p><span className="text-white/50">Plan:</span> <span className="font-medium">{successMessage.tierName}</span></p>
                  <p><span className="text-white/50">Válido hasta:</span> <span className="font-medium">{successMessage.endDate}</span></p>
                </div>
                <p className="text-sm text-white/60 mt-3">Disfruta del contenido exclusivo</p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 mt-4"
                style={{ backgroundColor: profile.accentColor }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Subscription Modal */}
      {showManageModal && subscriptionDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowManageModal(false)}
        >
          <div 
            className="bg-[#1a1a24] rounded-2xl border border-white/10 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Gestionar Suscripción</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Subscription Info */}
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Creador</span>
                  <span className="font-semibold text-white">{creator.displayName}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Plan</span>
                  <span className="font-semibold text-white">{subscriptionDetails.tier?.name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Precio</span>
                  <span className="font-semibold" style={{ color: profile.accentColor }}>
                    {formatPriceCLP(subscriptionDetails.tier?.price)}/mes
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Fecha de inicio</span>
                  <span className="text-white">{new Date(subscriptionDetails.startDate).toLocaleDateString('es-CL')}</span>
                </div>
                {subscriptionDetails.endDate && (
                  <div className="flex justify-between items-start">
                    <span className="text-white/50 text-sm">Válido hasta</span>
                    <span className="text-white">{new Date(subscriptionDetails.endDate).toLocaleDateString('es-CL')}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Estado</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscriptionDetails.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : subscriptionDetails.status === 'cancelled'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {subscriptionDetails.status === 'active' 
                      ? 'Activa' 
                      : subscriptionDetails.status === 'cancelled'
                      ? 'Cancelada'
                      : subscriptionDetails.status}
                  </span>
                </div>
                {subscriptionDetails.autoRenew !== undefined && (
                  <div className="flex justify-between items-start">
                    <span className="text-white/50 text-sm">Renovación automática</span>
                    <span className={subscriptionDetails.autoRenew ? "text-green-400" : "text-yellow-400"}>
                      {subscriptionDetails.autoRenew ? 'Activada' : 'Desactivada'}
                    </span>
                  </div>
                )}
              </div>

              {/* Benefits */}
              {subscriptionDetails.tier?.benefits && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white/70">Beneficios incluidos:</h3>
                  <div className="bg-white/5 rounded-lg p-3 text-sm text-white/80 whitespace-pre-line">
                    {subscriptionDetails.tier.benefits}
                  </div>
                </div>
              )}

              {/* Cancel Button - solo si está activa */}
              {subscriptionDetails.status === 'active' && (
                <button
                  onClick={() => {
                    setShowManageModal(false)
                    setShowCancelConfirm(true)
                  }}
                  className="w-full py-3 rounded-lg font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  Cancelar Suscripción
                </button>
              )}

              {/* Mensaje si está cancelada */}
              {subscriptionDetails.status === 'cancelled' && subscriptionDetails.endDate && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm text-center">
                    Tu suscripción está cancelada. Mantendrás acceso hasta el{' '}
                    <span className="font-semibold">
                      {new Date(subscriptionDetails.endDate).toLocaleDateString('es-CL', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowManageModal(false)}
                className="w-full py-2 text-white/50 hover:text-white transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => !cancelling && setShowCancelConfirm(false)}
        >
          <div 
            className="bg-[#1a1a24] rounded-2xl border border-white/10 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              {/* Warning Icon */}
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-white">
                ¿Cancelar suscripción?
              </h2>

              {/* Message */}
              <div className="space-y-2 text-white/70 text-sm">
                <p>Estás a punto de cancelar tu suscripción a <span className="font-semibold text-white">{creator?.displayName}</span></p>
                {subscriptionDetails?.endDate && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-200">
                    <p className="font-medium">ℹ️ Importante:</p>
                    <p className="mt-1">Mantendrás acceso al contenido exclusivo hasta el <span className="font-semibold">{new Date(subscriptionDetails.endDate).toLocaleDateString('es-CL')}</span></p>
                  </div>
                )}
                <p className="text-white/50 text-xs mt-3">Podrás volver a suscribirte en cualquier momento</p>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="w-full py-3 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelando...' : 'Sí, cancelar suscripción'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelling}
                  className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: `${profile.accentColor}20`,
                    color: profile.accentColor 
                  }}
                >
                  No, mantener suscripción
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface StatItemProps {
  icon: React.ReactNode
  value: string
  label: string
  accentColor: string
  active?: boolean
  onClick?: () => void
}

function StatItem({ icon, value, label, accentColor, active, onClick }: StatItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center group transition-all ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-xl">{value}</span>
      </div>
      <div 
        className={`flex items-center gap-1 text-sm mt-1 pb-1 border-b-2 transition-colors ${
          active ? 'border-current' : 'border-transparent'
        }`}
        style={active ? { borderColor: accentColor, color: accentColor } : {}}
      >
        {icon}
        <span>{label}</span>
      </div>
    </button>
  )
}
