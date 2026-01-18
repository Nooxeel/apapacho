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
  Loader2
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import SavedCardsList from '@/components/cards/SavedCardsList'

type SettingsSection = 'cards' | 'profile' | 'notifications' | 'privacy' | null

export default function SettingsPage() {
  const router = useRouter()
  const { token, hasHydrated, logout, user } = useAuthStore()
  const [activeSection, setActiveSection] = useState<SettingsSection>('cards')
  
  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login')
    }
  }, [hasHydrated, token, router])
  
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
                      ? 'bg-pink-500/20 text-pink-400' 
                      : item.disabled
                        ? 'opacity-50 cursor-not-allowed text-gray-500'
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
          </div>
        </div>
      </main>
    </div>
  )
}
