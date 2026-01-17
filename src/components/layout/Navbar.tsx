'use client'

import Link from 'next/link'
import { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { messageApi } from '@/lib/api'
import { socketService } from '@/lib/socket'
import Image from 'next/image'

// Inline icons to avoid loading full lucide-react bundle
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const LogOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const FileTextIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
)

const MessageCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const DollarSignIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, token, logout, hasHydrated } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // WebSocket connection and unread count tracking
  useEffect(() => {
    if (!token || !user) {
      console.log('[Navbar] No token or user, skipping unread count')
      return
    }

    console.log('[Navbar] Setting up unread count tracking for user:', user.id)

    // Initial load
    const loadUnreadCount = async () => {
      try {
        console.log('[Navbar] Loading unread count...')
        const data = await messageApi.getUnreadCount(token) as { unread: number }
        console.log('[Navbar] Unread count:', data.unread)
        setUnreadCount(data.unread)
      } catch (error) {
        console.error('[Navbar] Error loading unread count:', error)
      }
    }

    loadUnreadCount()

    // Connect to WebSocket
    console.log('[Navbar] Connecting to WebSocket...')
    socketService.connect(user.id)

    // Listen for unread count updates via WebSocket
    const handleUnreadUpdate = (data: any) => {
      console.log('[Navbar] Received unread:update event:', data)
      loadUnreadCount() // Reload full count when any conversation updates
    }

    const handleNewMessage = (data: any) => {
      console.log('[Navbar] Received message:new event:', data)
      loadUnreadCount() // Reload count on new message
    }

    socketService.on('unread:update', handleUnreadUpdate)
    socketService.on('message:new', handleNewMessage)

    return () => {
      console.log('[Navbar] Cleaning up WebSocket listeners')
      socketService.off('unread:update', handleUnreadUpdate)
      socketService.off('message:new', handleNewMessage)
      // Don't disconnect - other components might be using it
      // socketService.disconnect()
    }
  }, [token, user])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Ir a página de inicio">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold gradient-text">Apapacho</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/explore" className="text-white/70 hover:text-white transition-colors">
              Explorar
            </Link>
            <Link href="/ruleta" className="text-white/70 hover:text-white transition-colors">
              Ruleta
            </Link>
            <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">
              Tarifas
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          {hasHydrated && (
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {/* Ícono de mensajes con contador */}
                  <Link
                    href="/messages"
                    className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
                    aria-label={unreadCount > 0 ? `Mensajes (${unreadCount} sin leer)` : 'Mensajes'}
                  >
                    <MessageCircleIcon className="w-6 h-6 text-white/70 hover:text-white transition-colors" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Menú de usuario */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                      aria-label="Menú de usuario"
                      aria-expanded={showUserMenu}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.displayName}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-white font-medium">{user.displayName}</span>
                    </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a24] border border-white/10 rounded-xl shadow-xl py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon />
                        Dashboard
                      </Link>
                      <Link
                        href={user.isCreator ? `/${user.username}` : '/profile/edit'}
                        className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon />
                        Mi Perfil
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <MessageCircleIcon className="w-4 h-4" />
                        Mensajes
                      </Link>
                      {user.isCreator && (
                        <>
                          <Link
                            href="/creator/earnings"
                            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <DollarSignIcon />
                            Mis Ganancias
                          </Link>
                          <Link
                            href="/creator/posts"
                            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FileTextIcon />
                            Mis Posts
                          </Link>
                          <Link
                            href="/creator/edit"
                            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <SettingsIcon />
                            Editar Perfil
                          </Link>
                          <Link
                            href="/creator/blocked"
                            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShieldIcon />
                            Bloqueados
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                      >
                        <LogOutIcon />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="primary" size="sm">
                      Comenzar Gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <Link
                href="/explore"
                className="text-white/70 hover:text-white transition-colors px-2 py-1"
              >
                Explorar
              </Link>
              <Link
                href="/ruleta"
                className="text-white/70 hover:text-white transition-colors px-2 py-1"
              >
                Ruleta
              </Link>
              <Link
                href="/pricing"
                className="text-white/70 hover:text-white transition-colors px-2 py-1"
              >
                Tarifas
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="w-full justify-center">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    Comenzar Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
