'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { creatorApi } from '@/lib/api'
import { MusicPlayer, Comments, FavoriteButton, PostsFeed } from '@/components/profile'
import { Navbar } from '@/components/layout'
import { useAuthStore } from '@/stores/authStore'
import { API_URL } from '@/lib/config'
import { 
  Heart, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Mic,
  MessageCircle,
  Share2,
  BadgeCheck,
  Lock
} from 'lucide-react'

interface CreatorProfile {
  id: string
  username: string
  displayName: string
  avatar?: string
  creatorProfile: {
    id: string
    bio?: string
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
      platform: string
      url: string
      label?: string
    }>
    subscriptionTiers: Array<{
      id: string
      name: string
      price: number
      currency: string
      description?: string
      benefits: string
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
        if (token && user) {
          try {
            const subRes = await fetch(`${API_URL}/subscriptions/check/${data.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (subRes.ok) {
              const { isSubscribed } = await subRes.json()
              setIsSubscriber(isSubscribed)
            }
          } catch {}
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
        router.push(`/messages/${conversation.id}`)
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
      <Navbar />
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: profile.backgroundColor,
          color: profile.textColor,
          fontFamily: profile.fontFamily 
        }}
      >
        {/* Cover Image */}
        <div className="relative h-[300px] md:h-[400px] w-full">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${coverImageUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        </div>

      {/* Profile Section */}
      <div className="relative -mt-24 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div 
              className="relative w-36 h-36 rounded-full overflow-hidden border-4 shadow-lg"
              style={{ borderColor: profile.accentColor }}
            >
              <Image
                src={profileImageUrl}
                alt={creator.displayName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Username with verification */}
            <div className="mt-4 flex items-center gap-2">
              <h1 className="text-2xl font-bold">{creator.username}</h1>
              {profile.isVerified && (
                <BadgeCheck 
                  className="w-6 h-6" 
                  style={{ color: profile.accentColor }}
                  fill={profile.accentColor}
                />
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-2 text-center text-gray-300 max-w-md">
                {profile.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {mainTier && (
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: profile.accentColor }}
                >
                  <Lock className="w-5 h-5" />
                  Suscribirse ${mainTier.price.toFixed(2)} por mes
                </button>
              )}

              <button className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-600 bg-transparent hover:bg-white/5 transition-colors">
                <span className="text-lg">💰</span>
                Propina
              </button>

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
                  value={formatNumber(stats.totalLikes)} 
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
              <h3 className="font-semibold text-lg mb-3">Acerca de mí</h3>
              <p className="text-gray-300 text-sm">
                {profile.bio || 'Este creador aún no ha agregado una descripción.'}
              </p>
              
              {/* Social Links */}
              {profile.socialLinks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="font-medium text-sm mb-3">Redes Sociales</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.socialLinks.map(link => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white/10 rounded-full text-sm hover:bg-white/20 transition-colors"
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
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
              />
            )}
          </div>
        </div>
      </div>
      </div>
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
