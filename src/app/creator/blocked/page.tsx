'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/layout'
import { useAuthStore } from '@/stores/authStore'
import { blockApi } from '@/lib/api'
import { 
  Shield, 
  ShieldOff, 
  Search, 
  AlertCircle, 
  UserX,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'

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

  useEffect(() => {
    if (!hasHydrated) return
    if (!token || !user?.isCreator) {
      router.push('/login')
      return
    }
    loadBlockedUsers()
  }, [hasHydrated, token, user, page])

  const loadBlockedUsers = async () => {
    if (!token) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await blockApi.getBlockedUsers(token, page, 20)
      setBlockedUsers(response.blockedUsers)
      setTotalPages(response.pagination.totalPages)
      setTotal(response.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios bloqueados')
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
                placeholder="Buscar por nombre o username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500
                         placeholder:text-white/40"
              />
            </div>
          </div>

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
