'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { blockApi } from '@/lib/api'
import { Shield, ShieldOff, Loader2 } from 'lucide-react'

interface BlockUserButtonProps {
  userId: string
  username: string
  displayName: string
  isBlocked?: boolean
  onBlockChange?: (isBlocked: boolean) => void
  variant?: 'icon' | 'full' | 'menu'
  className?: string
}

export default function BlockUserButton({
  userId,
  username,
  displayName,
  isBlocked: initialIsBlocked = false,
  onBlockChange,
  variant = 'full',
  className = ''
}: BlockUserButtonProps) {
  const { token, user } = useAuthStore()
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked)
  const [isLoading, setIsLoading] = useState(false)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [reason, setReason] = useState('')

  // Solo mostrar para creadores y no para el propio perfil
  if (!user?.isCreator || user.id === userId) {
    return null
  }

  const handleBlock = async () => {
    if (!token) return
    
    // Mostrar modal para razón si no está bloqueado
    if (!isBlocked) {
      setShowReasonModal(true)
      return
    }
    
    // Si ya está bloqueado, desbloquear
    const confirmed = window.confirm(
      `¿Desbloquear a @${username}? Podrá volver a ver tu perfil, enviarte mensajes y suscribirse.`
    )
    if (!confirmed) return
    
    setIsLoading(true)
    try {
      await blockApi.unblockUser(userId, token)
      setIsBlocked(false)
      onBlockChange?.(false)
    } catch (err: any) {
      alert(err.message || 'Error al desbloquear usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmBlock = async () => {
    if (!token) return
    
    setIsLoading(true)
    try {
      await blockApi.blockUser(userId, reason || undefined, token)
      setIsBlocked(true)
      setShowReasonModal(false)
      setReason('')
      onBlockChange?.(true)
    } catch (err: any) {
      alert(err.message || 'Error al bloquear usuario')
    } finally {
      setIsLoading(false)
    }
  }

  // Render según variante
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleBlock}
          disabled={isLoading}
          className={`p-2 rounded-lg transition-colors ${
            isBlocked 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-red-400'
          } disabled:opacity-50 ${className}`}
          title={isBlocked ? 'Desbloquear usuario' : 'Bloquear usuario'}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isBlocked ? (
            <ShieldOff className="w-5 h-5" />
          ) : (
            <Shield className="w-5 h-5" />
          )}
        </button>
        
        {showReasonModal && (
          <BlockReasonModal
            displayName={displayName}
            username={username}
            reason={reason}
            setReason={setReason}
            onConfirm={confirmBlock}
            onCancel={() => {
              setShowReasonModal(false)
              setReason('')
            }}
            isLoading={isLoading}
          />
        )}
      </>
    )
  }

  if (variant === 'menu') {
    return (
      <>
        <button
          onClick={handleBlock}
          disabled={isLoading}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 
                    transition-colors ${isBlocked ? 'text-red-400' : 'text-white/80'} ${className}`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isBlocked ? (
            <ShieldOff className="w-5 h-5" />
          ) : (
            <Shield className="w-5 h-5 text-red-400" />
          )}
          <span>{isBlocked ? 'Desbloquear usuario' : 'Bloquear usuario'}</span>
        </button>
        
        {showReasonModal && (
          <BlockReasonModal
            displayName={displayName}
            username={username}
            reason={reason}
            setReason={setReason}
            onConfirm={confirmBlock}
            onCancel={() => {
              setShowReasonModal(false)
              setReason('')
            }}
            isLoading={isLoading}
          />
        )}
      </>
    )
  }

  // variant === 'full'
  return (
    <>
      <button
        onClick={handleBlock}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isBlocked
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-white/10 text-white/80 hover:bg-red-500/20 hover:text-red-400'
        } disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isBlocked ? (
          <ShieldOff className="w-4 h-4" />
        ) : (
          <Shield className="w-4 h-4" />
        )}
        <span>{isBlocked ? 'Desbloquear' : 'Bloquear'}</span>
      </button>
      
      {showReasonModal && (
        <BlockReasonModal
          displayName={displayName}
          username={username}
          reason={reason}
          setReason={setReason}
          onConfirm={confirmBlock}
          onCancel={() => {
            setShowReasonModal(false)
            setReason('')
          }}
          isLoading={isLoading}
        />
      )}
    </>
  )
}

// Modal para ingresar razón de bloqueo
function BlockReasonModal({
  displayName,
  username,
  reason,
  setReason,
  onConfirm,
  onCancel,
  isLoading
}: {
  displayName: string
  username: string
  reason: string
  setReason: (r: string) => void
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="bg-[#1a1a24] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Bloquear usuario</h3>
            <p className="text-sm text-white/60">@{username}</p>
          </div>
        </div>

        <p className="text-white/70 mb-4">
          <strong>{displayName}</strong> no podrá:
        </p>
        
        <ul className="text-sm text-white/60 space-y-2 mb-6 pl-4">
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            Ver tu perfil ni contenido
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            Enviarte mensajes
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            Suscribirse a tu contenido
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            Comentar en tu perfil
          </li>
        </ul>

        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Razón del bloqueo (opcional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Comportamiento inapropiado, spam, acoso..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                     focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500
                     placeholder:text-white/40 resize-none"
          />
          <p className="text-xs text-white/40 mt-1">
            Solo tú podrás ver esta razón
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium
                     transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-medium
                     transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Bloqueando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Bloquear
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
