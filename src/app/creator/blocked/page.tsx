'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/layout'
import { useAuthStore } from '@/stores/authStore'
import { blockApi, usersApi } from '@/lib/api'
import { 
  Shield, 
  ShieldOff, 
  Search, 
  AlertCircle, 
  UserX,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  X
} from 'lucide-react'

interface SearchUser {
  id: string
  username: string
  displayName: string
  avatar?: string
  isCreator: boolean
}

interface BlockedUser {
  id: string
  user: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
  reason?: string
  createdAt: string
}

export default function BlockedUsersPage() {
  const router = useRouter()
  const { token, user, hasHydrated } = useAuthStore()
  
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)
  
  // Search for new users to block
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [blockingId, setBlockingId] = useState<string | null>(null)
  const [blockReason, setBlockReason] = useState('')

  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login')
      return
    }
    if (!user?.isCreator) {
      // Redirect non-creators to their profile or home
      router.push('/profile')
      return
    }
    loadBlockedUsers()
  }, [hasHydrated, token, user, page, router])

  const loadBlockedUsers = async () => {
    if (!token || !user?.isCreator) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await blockApi.getBlockedUsers(token, page, 20)
      setBlockedUsers(response.blockedUsers)
      setTotalPages(response.pagination.totalPages)
      setTotal(response.pagination.total)
    } catch (err: any) {
      // Handle specific error for non-creators
      if (err.message?.includes('Solo los creadores') || err.status === 403) {
        setError('Esta función solo está disponible para creadores')
      } else {
        setError(err.message || 'Error al cargar usuarios bloqueados')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnblock = async (blockedUserId: string, username: string) => {
    if (!token) return
    
    const confirmed = window.confirm(`¿Desbloquear a @${username}? Podrá volver a ver tu perfil, enviarte mensajes y suscribirse.`)
    if (!confirmed) return
    
    setUnblockingId(blockedUserId)
    
    try {
      await blockApi.unblockUser(blockedUserId, token)
      // Remover de la lista local
      setBlockedUsers(prev => prev.filter(b => b.user.id !== blockedUserId))
      setTotal(prev => prev - 1)
    } catch (err: any) {
      alert(err.message || 'Error al desbloquear usuario')
    } finally {
      setUnblockingId(null)
    }
  }

  // Search for users to block
  const handleSearchUsers = useCallback(async (query: string) => {
    if (!token || query.trim().length < 2) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const response = await usersApi.search(query, token, 10)
      // Filter out already blocked users
      const blockedIds = blockedUsers.map(b => b.user.id)
      const filteredResults = response.users.filter(u => !blockedIds.includes(u.id))
      setSearchResults(filteredResults)
    } catch (err) {
      console.error('Error searching users:', err)
    } finally {
      setIsSearching(false)
    }
  }, [token, blockedUsers])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchQuery.trim().length >= 2) {
        handleSearchUsers(userSearchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [userSearchQuery, handleSearchUsers])

  const handleBlockUser = async (userId: string, username: string) => {
    if (!token) return
    
    setBlockingId(userId)
    
    try {
      await blockApi.blockUser(userId, blockReason || undefined, token)
      // Add to blocked list
      const blockedUser = searchResults.find(u => u.id === userId)
      if (blockedUser) {
        setBlockedUsers(prev => [{
          id: Date.now().toString(), // Temporary ID
          user: {
            id: blockedUser.id,
            username: blockedUser.username,
            displayName: blockedUser.displayName,
            avatar: blockedUser.avatar
          },
          reason: blockReason || undefined,
          createdAt: new Date().toISOString()
        }, ...prev])
        setTotal(prev => prev + 1)
      }
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== userId))
      setBlockReason('')
    } catch (err: any) {
      alert(err.message || 'Error al bloquear usuario')
    } finally {
      setBlockingId(null)
    }
  }

  const filteredUsers = blockedUsers.filter(b => 
    b.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    )
  }

  // Show loading while checking creator status
  if (!user?.isCreator) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acceso restringido</h2>
          <p className="text-white/60 mb-4">Esta función solo está disponible para creadores</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 rounded-lg text-white font-medium transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0f0f14] text-white pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-fuchsia-500" />
              <h1 className="text-2xl font-bold">Usuarios Bloqueados</h1>
            </div>
            <p className="text-white/60">
              Los usuarios bloqueados no pueden ver tu perfil, enviarte mensajes ni suscribirse.
            </p>
          </div>

          {/* Stats & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
              <UserX className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-white/60">Total bloqueados</p>
                <p className="text-lg font-semibold">{total}</p>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar usuario para bloquear..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                onFocus={() => setShowSearchModal(true)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500
                         placeholder:text-white/40"
              />
              
              {/* Search Results Dropdown */}
              {showSearchModal && userSearchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a24] border border-white/10 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-fuchsia-500" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-white/60">
                      <UserX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron usuarios</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {searchResults.map(result => (
                        <div
                          key={result.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-fuchsia-500 to-pink-500">
                            {result.avatar ? (
                              <Image
                                src={result.avatar}
                                alt={result.displayName}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-white font-semibold">
                                {result.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{result.displayName}</p>
                            <p className="text-sm text-white/60">@{result.username}</p>
                          </div>
                          <button
                            onClick={() => handleBlockUser(result.id, result.username)}
                            disabled={blockingId === result.id}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {blockingId === result.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Shield className="w-4 h-4" />
                                Bloquear
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Close dropdown when clicking outside */}
            {showSearchModal && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => {
                  setShowSearchModal(false)
                  setUserSearchQuery('')
                  setSearchResults([])
                }}
              />
            )}
          </div>
          
          {/* Filter blocked list */}
          {blockedUsers.length > 0 && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Filtrar lista de bloqueados..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm
                           focus:outline-none focus:ring-1 focus:ring-white/20
                           placeholder:text-white/40"
                />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-fuchsia-500 mb-4" />
              <p className="text-white/60">Cargando usuarios bloqueados...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <ShieldOff className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <h3 className="text-lg font-medium text-white/80 mb-2">
                {searchQuery ? 'No se encontraron resultados' : 'No tienes usuarios bloqueados'}
              </h3>
              <p className="text-white/50">
                {searchQuery 
                  ? 'Prueba con otro término de búsqueda'
                  : 'Cuando bloquees a alguien, aparecerá aquí'
                }
              </p>
            </div>
          ) : (
            /* Users List */
            <div className="space-y-3">
              {filteredUsers.map((blocked) => (
                <div 
                  key={blocked.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4
                           hover:bg-white/8 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    {blocked.user.avatar ? (
                      <Image
                        src={blocked.user.avatar}
                        alt={blocked.user.displayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/60">
                        {blocked.user.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{blocked.user.displayName}</p>
                    <p className="text-sm text-white/50">@{blocked.user.username}</p>
                    {blocked.reason && (
                      <p className="text-xs text-white/40 mt-1 truncate">
                        Razón: {blocked.reason}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-white/40">Bloqueado el</p>
                    <p className="text-sm text-white/60">{formatDate(blocked.createdAt)}</p>
                  </div>

                  {/* Unblock Button */}
                  <button
                    onClick={() => handleUnblock(blocked.user.id, blocked.user.username)}
                    disabled={unblockingId === blocked.user.id}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-2"
                  >
                    {unblockingId === blocked.user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldOff className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Desbloquear</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 
                         disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-white/60">
                Página {page} de {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 
                         disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
