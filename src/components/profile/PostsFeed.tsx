'use client'

import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { Video, Heart, MessageCircle, DollarSign, Lock, Globe, Star, LogIn, Send, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { API_URL } from '@/lib/config'
import { useAuthStore } from '@/stores'
import { postApi } from '@/lib/api'
import { sanitizePostDescription, sanitizeComment } from '@/lib/sanitize'
import type { PostVisibility, PostComment } from '@/types'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'

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
  onSubscribeClick?: () => void
  isSubscriber?: boolean
  isOwner?: boolean
  showPostTipping?: boolean
}

export function PostsFeed({ creatorId, accentColor = '#d946ef', filterType = 'posts', onSubscribeClick, isSubscriber = false, isOwner = false, showPostTipping = true }: PostsFeedProps) {
  const router = useRouter()
  const { user, token, isAuthenticated } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  // Infinite scroll trigger
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  })

  // Like states (postId => isLiked)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})

  // Comments states
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Record<string, PostComment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadPosts()
  }, [creatorId])

  // Trigger load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMore()
    }
  }, [inView, hasMore, loadingMore])

  const loadPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts?creatorId=${creatorId}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore)

        // Load like status for ALL posts in a single batch request (fixes N+1 query)
        if (token && user && data.posts.length > 0) {
          loadBatchLikeStatus(data.posts.map((post: Post) => post.id))
        }
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return

    setLoadingMore(true)
    try {
      const response = await fetch(`${API_URL}/posts?creatorId=${creatorId}&limit=10&cursor=${nextCursor}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(prev => [...prev, ...data.posts])
        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore)

        // Load like status for new posts
        if (token && user && data.posts.length > 0) {
          const newPostIds = data.posts.map((post: Post) => post.id)
          const likeStatuses = await postApi.getBatchLikeStatus(newPostIds, token) as Record<string, boolean>
          setLikedPosts(prev => ({ ...prev, ...likeStatuses }))
        }
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const loadBatchLikeStatus = useCallback(async (postIds: string[]) => {
    if (!token || postIds.length === 0) return
    try {
      const data = await postApi.getBatchLikeStatus(postIds, token) as Record<string, boolean>
      setLikedPosts(data)
    } catch (error) {
      console.error('Error loading batch like status:', error)
    }
  }, [token])

  const handleLike = useCallback(async (postId: string) => {
    if (!token || !user) {
      router.push('/login')
      return
    }

    const currentLiked = likedPosts[postId] || false
    const currentPost = posts.find(p => p.id === postId)
    if (!currentPost) return

    // Optimistic update
    setLikedPosts(prev => ({ ...prev, [postId]: !currentLiked }))
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: currentLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ))

    try {
      const data = await postApi.toggleLike(postId, token) as { liked: boolean; likes: number }

      // Update with server response
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes: data.likes }
          : p
      ))
      setLikedPosts(prev => ({ ...prev, [postId]: data.liked }))
    } catch (error) {
      // Revert on error
      setLikedPosts(prev => ({ ...prev, [postId]: currentLiked }))
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? currentPost
          : p
      ))
      console.error('Error toggling like:', error)
    }
  }, [token, user, router, likedPosts, posts])

  const loadComments = useCallback(async (postId: string) => {
    try {
      const data = await postApi.getComments(postId, 50, 0) as { comments: PostComment[]; total: number }
      setComments(prev => ({ ...prev, [postId]: data.comments }))
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }, [])

  const toggleComments = useCallback((postId: string) => {
    setShowComments(prev => {
      const isShowing = prev[postId]
      if (!isShowing && !comments[postId]) {
        loadComments(postId)
      }
      return { ...prev, [postId]: !isShowing }
    })
  }, [comments, loadComments])

  const handleSubmitComment = useCallback(async (postId: string) => {
    if (!token || !user) {
      router.push('/login')
      return
    }

    const content = newComment[postId]?.trim()
    if (!content) return

    setSubmittingComment(prev => ({ ...prev, [postId]: true }))

    try {
      const comment = await postApi.createComment(postId, content, token) as PostComment

      // Add comment to list
      setComments(prev => ({
        ...prev,
        [postId]: [comment, ...(prev[postId] || [])]
      }))

      // Increment comment count
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments: p.comments + 1 }
          : p
      ))

      // Clear input
      setNewComment(prev => ({ ...prev, [postId]: '' }))
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Error al enviar el comentario')
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }))
    }
  }, [token, user, router, newComment])

  const handleDeleteComment = useCallback(async (postId: string, commentId: string) => {
    if (!token || !user) return

    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return

    try {
      await postApi.deleteComment(commentId, token)

      // Remove comment from list
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }))

      // Decrement comment count
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments: Math.max(0, p.comments - 1) }
          : p
      ))
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Error al eliminar el comentario')
    }
  }, [token, user])

  const filteredPosts = useMemo(() => posts.filter(post => {
    if (filterType === 'posts') return true
    const hasVideo = post.content.some(c => c.type === 'video')
    const hasPhoto = post.content.some(c => c.type === 'image')

    if (filterType === 'videos') return hasVideo
    if (filterType === 'photos') return hasPhoto
    if (filterType === 'audio') return post.content.some(c => c.type === 'audio')
    return true
  }), [posts, filterType])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }, [])

  const canViewPost = useCallback((post: Post): boolean => {
    // El creador siempre puede ver su propio contenido
    if (isOwner) return true
    if (post.visibility === 'public') return true
    if (post.visibility === 'authenticated') return isAuthenticated
    if (post.visibility === 'subscribers') {
      return isSubscriber
    }
    return false
  }, [isOwner, isAuthenticated, isSubscriber])

  const getVisibilityBadge = useCallback((visibility: PostVisibility) => {
    switch (visibility) {
      case 'public':
        return { icon: Globe, label: 'Público', color: 'text-blue-400 bg-blue-500/10' }
      case 'authenticated':
        return { icon: Lock, label: 'Solo usuarios', color: 'text-yellow-400 bg-yellow-500/10' }
      case 'subscribers':
        return { icon: Star, label: 'Solo suscriptores', color: 'text-fuchsia-400 bg-fuchsia-500/10' }
    }
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fuchsia-500 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredPosts.length === 0 && !loading ? (
        <div className="text-center py-20 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-white/30" />
          </div>
          <p className="text-white/50 text-lg">No hay contenido todavía</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {filteredPosts.map((post) => {
            const videoContent = post.content.find(c => c.type === 'video')
            const imageContent = post.content.find(c => c.type === 'image')
            const mediaContent = videoContent || imageContent
            const canView = canViewPost(post)
            const visibilityBadge = getVisibilityBadge(post.visibility)
            const VisibilityIcon = visibilityBadge.icon
            const isLiked = likedPosts[post.id] || false
            const showingComments = showComments[post.id] || false
            const postComments = comments[post.id] || []

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
                      {sanitizePostDescription(post.description)}
                    </p>
                  )}
                </div>

                {/* Media Section */}
                <div className="relative bg-black">
                  {canView ? (
                    <>
                      {videoContent ? (
                        <video
                          src={videoContent.url}
                          className="w-full max-h-[500px] object-contain mx-auto"
                          controls
                          preload="metadata"
                        />
                      ) : imageContent ? (
                        <div className="relative w-full" style={{ maxHeight: '500px', aspectRatio: '16/9' }}>
                          <Image
                            src={imageContent.url}
                            alt={post.title || 'Post image'}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Video className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="relative">
                      {videoContent ? (
                        <video
                          src={videoContent.url}
                          className="w-full max-h-[500px] object-contain mx-auto blur-2xl"
                          preload="metadata"
                        />
                      ) : imageContent ? (
                        <div className="relative w-full" style={{ maxHeight: '500px', aspectRatio: '16/9' }}>
                          <Image
                            src={imageContent.url}
                            alt={post.title || 'Post image'}
                            fill
                            className="object-contain blur-2xl"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 blur-xl" />
                      )}

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
                            onClick={() => {
                              if (post.visibility === 'authenticated') {
                                router.push('/login')
                              } else if (onSubscribeClick) {
                                onSubscribeClick()
                              } else {
                                router.push('/pricing')
                              }
                            }}
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
                                Suscribirse
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Footer - Stats */}
                <div className="p-4 flex items-center gap-6 border-b border-white/10">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      isLiked
                        ? 'text-red-500'
                        : 'text-white/60 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{post.likes.toLocaleString()}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 text-white/60 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments.toLocaleString()}</span>
                  </button>
                  {showPostTipping && (
                    <button className="flex items-center gap-2 text-white/60 hover:text-green-400 transition-colors">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm font-medium">Propina</span>
                    </button>
                  )}
                </div>

                {/* Comments Section */}
                {showingComments && (
                  <div className="p-4 bg-white/5 space-y-4">
                    {/* Comment Input */}
                    {isAuthenticated && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                          placeholder="Escribe un comentario..."
                          maxLength={1000}
                          disabled={submittingComment[post.id]}
                          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-fuchsia-500 disabled:opacity-50"
                        />
                        <button
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!newComment[post.id]?.trim() || submittingComment[post.id]}
                          className="p-2 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-colors"
                        >
                          <Send className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-3">
                      {postComments.length === 0 ? (
                        <p className="text-white/50 text-sm text-center py-4">
                          No hay comentarios aún
                        </p>
                      ) : (
                        postComments.map((comment) => {
                          const canDelete = user && (comment.userId === user.id || creatorId === user.id)

                          return (
                            <div key={comment.id} className="flex gap-3">
                              <Image
                                src={comment.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.displayName)}&background=a21caf&color=fff`}
                                alt={comment.user.displayName}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="bg-white/10 rounded-2xl px-4 py-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white text-sm">
                                      {comment.user.displayName}
                                    </span>
                                    <span className="text-xs text-white/40">
                                      @{comment.user.username}
                                    </span>
                                  </div>
                                  <p className="text-white text-sm whitespace-pre-wrap break-words">
                                    {sanitizeComment(comment.content)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 mt-1 px-2">
                                  <span className="text-xs text-white/40">
                                    {format(new Date(comment.createdAt), "d 'de' MMM 'a las' HH:mm", { locale: es })}
                                  </span>
                                  {canDelete && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Eliminar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          </div>

          {/* Infinite Scroll Trigger */}
          {hasMore && (
            <div ref={ref} className="flex justify-center py-8">
              {loadingMore && (
                <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
              )}
            </div>
          )}

          {/* End of posts message */}
          {!hasMore && filteredPosts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">Has visto todos los posts</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
