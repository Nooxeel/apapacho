'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  CreditCard, 
  User, 
  Bell, 
  Shield, 
  LogOut,
  ChevronRight,
  Loader2,
  Trash2,
  AlertTriangle,
  Download
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import SavedCardsList from '@/components/cards/SavedCardsList'
import api from '@/lib/api'

type SettingsSection = 'cards' | 'profile' | 'notifications' | 'privacy' | 'account' | null

interface DeletionCheck {
  canDelete: boolean
  blockers: string[]
  warnings: string[]
  stats: {
    activeSubscriptions: number
    pendingBalance: number
    totalPosts: number
    totalMessages: number
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const { token, hasHydrated, logout, user } = useAuthStore()
  const [activeSection, setActiveSection] = useState<SettingsSection>('cards')
  
  // Account deletion state
  const [deletionCheck, setDeletionCheck] = useState<DeletionCheck | null>(null)
  const [deletionLoading, setDeletionLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)
  
  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login')
    }
  }, [hasHydrated, token, router])
  
  // Check deletion eligibility when account section is opened
  useEffect(() => {
    if (activeSection === 'account' && !deletionCheck) {
      checkDeletion()
    }
  }, [activeSection])
  
  const checkDeletion = async () => {
    setDeletionLoading(true)
    try {
      const result = await api<DeletionCheck>('/users/me/deletion-check', { token: token || undefined })
      setDeletionCheck(result)
    } catch (error) {
      console.error('Error checking deletion:', error)
    } finally {
      setDeletionLoading(false)
    }
  }
  
  const handleExportData = async () => {
    try {
      const data = await api<object>('/users/me/export', { token: token || undefined })
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `apapacho-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }
  
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Ingresa tu contraseña para confirmar')
      return
    }
    
    setDeleting(true)
    setDeleteError('')
    
    try {
      await api('/users/me', {
        method: 'DELETE',
        body: { password: deletePassword, reason: deleteReason },
        token: token || undefined
      })
      logout()
      router.push('/')
    } catch (error: any) {
      setDeleteError(error.message || 'Error al eliminar cuenta')
    } finally {
      setDeleting(false)
    }
  }
  
  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }
  
  const menuItems = [
    {
      id: 'cards' as const,
      icon: CreditCard,
      label: 'Métodos de Pago',
      description: 'Gestiona tus tarjetas guardadas',
    },
    {
      id: 'profile' as const,
      icon: User,
      label: 'Perfil',
      description: 'Edita tu información personal',
      href: '/profile/edit',
    },
    {
      id: 'notifications' as const,
      icon: Bell,
      label: 'Notificaciones',
      description: 'Configura tus preferencias',
      disabled: true,
    },
    {
      id: 'privacy' as const,
      icon: Shield,
      label: 'Privacidad',
      description: 'Controla tu privacidad',
      href: '/privacidad',
    },
    {
      id: 'account' as const,
      icon: Trash2,
      label: 'Eliminar Cuenta',
      description: 'Eliminar tu cuenta permanentemente',
      danger: true,
    },
  ]
  
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-[#222]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#222] rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Configuración</h1>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Menu */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                      isActive 
                        ? 'bg-pink-500/20 text-pink-400' 
                        : 'hover:bg-[#1a1a1a] text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </Link>
                )
              }
              
              return (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && setActiveSection(item.id)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                    isActive 
                      ? (item as any).danger 
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-pink-500/20 text-pink-400' 
                      : item.disabled
                        ? 'opacity-50 cursor-not-allowed text-gray-500'
                        : (item as any).danger
                          ? 'hover:bg-red-500/10 text-red-400'
                          : 'hover:bg-[#1a1a1a] text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">
                      {item.disabled ? 'Próximamente' : item.description}
                    </p>
                  </div>
                  {!item.disabled && <ChevronRight className="h-4 w-4 text-gray-500" />}
                </button>
              )
            })}
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition mt-4"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
          
          {/* Content */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-6">
            {activeSection === 'cards' && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Métodos de Pago
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Gestiona las tarjetas guardadas para suscripciones automáticas.
                  Tu tarjeta principal se usará para renovar automáticamente tus suscripciones.
                </p>
                
                <SavedCardsList />
              </div>
            )}
            
            {activeSection === 'notifications' && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Próximamente</p>
              </div>
            )}
            
            {activeSection === 'account' && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Eliminar Cuenta
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Esta acción es permanente y no se puede deshacer. Todos tus datos serán eliminados.
                </p>
                
                {deletionLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : deletionCheck ? (
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0a0a0a] p-4 rounded-lg">
                        <p className="text-2xl font-bold text-white">{deletionCheck.stats.totalPosts}</p>
                        <p className="text-xs text-gray-500">Publicaciones</p>
                      </div>
                      <div className="bg-[#0a0a0a] p-4 rounded-lg">
                        <p className="text-2xl font-bold text-white">{deletionCheck.stats.totalMessages}</p>
                        <p className="text-xs text-gray-500">Mensajes</p>
                      </div>
                      <div className="bg-[#0a0a0a] p-4 rounded-lg">
                        <p className="text-2xl font-bold text-white">{deletionCheck.stats.activeSubscriptions}</p>
                        <p className="text-xs text-gray-500">Suscripciones activas</p>
                      </div>
                      <div className="bg-[#0a0a0a] p-4 rounded-lg">
                        <p className="text-2xl font-bold text-white">
                          ${deletionCheck.stats.pendingBalance.toLocaleString('es-CL')}
                        </p>
                        <p className="text-xs text-gray-500">Balance pendiente</p>
                      </div>
                    </div>
                    
                    {/* Blockers */}
                    {deletionCheck.blockers.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <h3 className="font-medium text-red-400 mb-2">No puedes eliminar tu cuenta:</h3>
                        <ul className="space-y-1">
                          {deletionCheck.blockers.map((b, i) => (
                            <li key={i} className="text-sm text-red-300">• {b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Warnings */}
                    {deletionCheck.warnings.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <h3 className="font-medium text-yellow-400 mb-2">Advertencias:</h3>
                        <ul className="space-y-1">
                          {deletionCheck.warnings.map((w, i) => (
                            <li key={i} className="text-sm text-yellow-300">• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Export Data Button */}
                    <button
                      onClick={handleExportData}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-[#0a0a0a] hover:bg-[#151515] rounded-lg transition text-gray-300"
                    >
                      <Download className="h-5 w-5" />
                      Descargar mis datos
                    </button>
                    
                    {/* Delete Button */}
                    {deletionCheck.canDelete && !showDeleteConfirm && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition font-medium"
                      >
                        Eliminar mi cuenta permanentemente
                      </button>
                    )}
                    
                    {/* Confirmation Form */}
                    {showDeleteConfirm && (
                      <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4 space-y-4">
                        <h3 className="font-medium text-red-400">Confirmar eliminación</h3>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Contraseña actual *
                          </label>
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            ¿Por qué te vas? (opcional)
                          </label>
                          <textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder="Nos ayuda a mejorar..."
                            rows={2}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white resize-none"
                          />
                        </div>
                        
                        {deleteError && (
                          <p className="text-red-400 text-sm">{deleteError}</p>
                        )}
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 p-2 bg-[#333] hover:bg-[#444] rounded-lg transition"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="flex-1 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {deleting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Eliminando...
                              </>
                            ) : (
                              'Eliminar cuenta'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={checkDeletion}
                    className="px-4 py-2 bg-[#333] hover:bg-[#444] rounded-lg transition"
                  >
                    Verificar elegibilidad
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
