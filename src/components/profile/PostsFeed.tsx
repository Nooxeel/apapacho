'use client'

import { useEffect, useState } from 'react'
import { Video, Heart, MessageCircle, DollarSign, Lock, Globe, Star, LogIn } from 'lucide-react'
import { Button } from '@/components/ui'
import { API_URL } from '@/lib/config'
import { useAuthStore } from '@/stores'
import type { PostVisibility } from '@/types'
import { useRouter } from 'next/navigation'

interface Post {
  id: string
  title: string | null
  description: string | null
  content: Array<{
    type: string
    url: string
    thumbnail: string | null
    isBlurred?: boolean
  }>
  visibility: PostVisibility
  likes: number
  comments: number
  views: number
  createdAt: string
}

interface PostsFeedProps {
  creatorId: string
  accentColor?: string
  filterType?: string
}

export function PostsFeed({ creatorId, accentColor = '#d946ef', filterType = 'posts' }: PostsFeedProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [creatorId])

  const loadPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts?creatorId=${creatorId}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filterType === 'posts') return true
    const hasVideo = post.content.some(c => c.type === 'video')
    const hasPhoto = post.content.some(c => c.type === 'image')
    
    if (filterType === 'videos') return hasVideo
    if (filterType === 'photos') return hasPhoto
    if (filterType === 'audio') return post.content.some(c => c.type === 'audio')
    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  // Determinar si el usuario puede ver el contenido
  const canViewPost = (post: Post): boolean => {
    if (post.visibility === 'public') return true
    if (post.visibility === 'authenticated') return isAuthenticated
    if (post.visibility === 'subscribers') {
      // TODO: Verificar si el usuario tiene suscripción activa
      return false
    }
    return false
  }

  // Obtener el badge de visibilidad
  const getVisibilityBadge = (visibility: PostVisibility) => {
    switch (visibility) {
      case 'public':
        return { icon: Globe, label: 'Público', color: 'text-blue-400 bg-blue-500/10' }
      case 'authenticated':
        return { icon: Lock, label: 'Solo usuarios', color: 'text-yellow-400 bg-yellow-500/10' }
      case 'subscribers':
        return { icon: Star, label: 'Solo suscriptores', color: 'text-fuchsia-400 bg-fuchsia-500/10' }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fuchsia-500 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Posts Feed */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-white/30" />
          </div>
          <p className="text-white/50 text-lg">No hay contenido todavía</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => {
            const videoContent = post.content.find(c => c.type === 'video')
            const imageContent = post.content.find(c => c.type === 'image')
            const mediaContent = videoContent || imageContent
            const canView = canViewPost(post)
            const visibilityBadge = getVisibilityBadge(post.visibility)
            const VisibilityIcon = visibilityBadge.icon

            return (
              <div
                key={post.id}
                className="bg-white/5 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
              >
                {/* Post Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      {post.title && (
                        <h3 className="font-semibold text-white text-lg">
                          {post.title}
                        </h3>
                      )}
                      <p className="text-sm text-white/50 mt-1">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                    {post.visibility !== 'public' && (
                      <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${visibilityBadge.color}`}>
                        <VisibilityIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">{visibilityBadge.label}</span>
                      </div>
                    )}
                  </div>
                  {post.description && (
                    <p className="text-white/70 text-sm mt-3 leading-relaxed">
                      {post.description}
                    </p>
                  )}
                </div>

                {/* Media Section */}
                <div className="relative bg-black">
                  {canView ? (
                    // Contenido desbloqueado
                    <>
                      {videoContent ? (
                        <video
                          src={videoContent.url}
                          className="w-full max-h-[500px] object-contain mx-auto"
                          controls
                          preload="metadata"
                        />
                      ) : imageContent ? (
                        <img
                          src={imageContent.url}
                          alt={post.title || 'Post image'}
                          className="w-full max-h-[500px] object-contain mx-auto"
                        />
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Video className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                    </>
                  ) : (
                    // Contenido bloqueado con blur
                    <div className="relative">
                      {videoContent ? (
                        <video
                          src={videoContent.url}
                          className="w-full max-h-[500px] object-contain mx-auto blur-2xl"
                          preload="metadata"
                        />
                      ) : imageContent ? (
                        <img
                          src={imageContent.url}
                          alt={post.title || 'Post image'}
                          className="w-full max-h-[500px] object-contain mx-auto blur-2xl"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 blur-xl" />
                      )}

                      {/* Overlay con CTA */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="text-center space-y-4 max-w-sm px-6">
                          <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto">
                            <VisibilityIcon className="w-10 h-10 text-primary-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {post.visibility === 'authenticated' ? 'Inicia sesión para ver' : 'Suscríbete para desbloquear'}
                            </h3>
                            <p className="text-white/70 text-sm">
                              {post.visibility === 'authenticated'
                                ? 'Este contenido está disponible solo para usuarios registrados'
                                : 'Este contenido exclusivo está disponible solo para suscriptores'}
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            onClick={() => router.push(post.visibility === 'authenticated' ? '/login' : '/pricing')}
                            className="w-full"
                          >
                            {post.visibility === 'authenticated' ? (
                              <>
                                <LogIn className="w-4 h-4 mr-2" />
                                Iniciar Sesión
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Ver Planes
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Footer - Stats */}
                <div className="p-4 flex items-center gap-6">
                  <button className="flex items-center gap-2 text-white/60 hover:text-red-400 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.likes.toLocaleString()}</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/60 hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments.toLocaleString()}</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/60 hover:text-green-400 transition-colors">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm font-medium">Propina</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
