'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores'
import { importApi, ImportPlatformInfo, PlatformImport } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'

// Icons
const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function ImportPage() {
  const router = useRouter()
  const { token, hasHydrated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [platforms, setPlatforms] = useState<ImportPlatformInfo[]>([])
  const [imports, setImports] = useState<PlatformImport[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<ImportPlatformInfo | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Profile import form
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: ''
  })

  const fetchData = useCallback(async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const [platformsRes, importsRes] = await Promise.all([
        importApi.getPlatforms(),
        importApi.getImports(token)
      ])
      setPlatforms(platformsRes.platforms)
      setImports(importsRes.imports)
    } catch (err) {
      console.error('Error fetching import data:', err)
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [hasHydrated, token, router, fetchData])

  const handleImportProfile = async () => {
    if (!token || !selectedPlatform) return
    
    if (!profileData.displayName && !profileData.bio) {
      setError('Ingresa al menos un campo para importar')
      return
    }

    setImporting(true)
    setError('')
    
    try {
      const result = await importApi.importProfile(
        selectedPlatform.id,
        profileData,
        token
      )
      
      if (result.success) {
        setSuccess('Perfil importado correctamente')
        setShowImportModal(false)
        setProfileData({ displayName: '', bio: '' })
        fetchData()
        
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al importar'
      setError(msg)
    } finally {
      setImporting(false)
    }
  }

  const handleCancelImport = async (importId: string) => {
    if (!token) return
    
    try {
      await importApi.cancelImport(importId, token)
      fetchData()
    } catch (err) {
      console.error('Error cancelling import:', err)
    }
  }

  const getStatusBadge = (status: PlatformImport['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1"><CheckIcon /> Completado</span>
      case 'PROCESSING':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1 animate-pulse"><ClockIcon /> Procesando</span>
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1"><ClockIcon /> Pendiente</span>
      case 'PARTIAL':
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Parcial</span>
      case 'FAILED':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1"><XIcon /> Fallido</span>
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-zinc-500/20 text-zinc-400 text-xs rounded-full">Cancelado</span>
      default:
        return null
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPlatformName = (platform: PlatformImport['platform']) => {
    const names: Record<string, string> = {
      ONLYFANS: 'OnlyFans',
      ARSMATE: 'Arsmate',
      FANSLY: 'Fansly',
      OTHER: 'Otra'
    }
    return names[platform] || platform
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a]">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-600 to-pink-600 flex items-center justify-center">
            <DownloadIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Importar Contenido</h1>
            <p className="text-zinc-400">Importa tu perfil y contenido desde otras plataformas</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline">Cerrar</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400">
            {success}
          </div>
        )}

        {/* Platform Cards */}
        <h2 className="text-lg font-semibold text-white mb-4">Plataformas Soportadas</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {platforms.map(platform => (
            <div
              key={platform.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-fuchsia-500/50 transition-colors"
            >
              <div className="text-4xl mb-3">{platform.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{platform.name}</h3>
              <p className="text-sm text-zinc-400 mb-4">{platform.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {platform.supported.map(feature => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded"
                  >
                    {feature === 'profile' ? 'Perfil' : 
                     feature === 'posts' ? 'Posts' : 
                     feature === 'settings' ? 'Config' : feature}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedPlatform(platform)
                  setShowImportModal(true)
                  setError('')
                }}
                className="w-full py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg transition-colors"
              >
                Importar
              </button>
            </div>
          ))}
        </div>

        {/* Import History */}
        <h2 className="text-lg font-semibold text-white mb-4">Historial de Importaciones</h2>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          {imports.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <DownloadIcon />
              <p className="mt-2">Aún no has importado contenido</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {imports.map(imp => (
                <div key={imp.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{getPlatformName(imp.platform)}</span>
                      {getStatusBadge(imp.status)}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {imp.profileImported && '✓ Perfil '}
                      {imp.postsImported > 0 && `✓ ${imp.postsImported} posts `}
                      {imp.mediaImported > 0 && `✓ ${imp.mediaImported} archivos `}
                      {imp.errorsCount > 0 && (
                        <span className="text-red-400">⚠ {imp.errorsCount} errores</span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {formatDate(imp.completedAt || imp.createdAt)}
                    </div>
                  </div>
                  
                  {['PENDING', 'PROCESSING'].includes(imp.status) && (
                    <button
                      onClick={() => handleCancelImport(imp.id)}
                      className="px-3 py-1 text-red-400 hover:text-red-300 text-sm"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Import Modal */}
      {showImportModal && selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-2">
              Importar desde {selectedPlatform.name}
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              Ingresa los datos de tu perfil de {selectedPlatform.name} para importarlos
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Nombre/Apodo
                </label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  placeholder="Tu nombre en la otra plataforma"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Biografía / Descripción
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tu bio de la otra plataforma"
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-fuchsia-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setSelectedPlatform(null)
                  setProfileData({ displayName: '', bio: '' })
                }}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportProfile}
                disabled={importing}
                className="flex-1 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {importing ? 'Importando...' : 'Importar Perfil'}
              </button>
            </div>

            <p className="mt-4 text-xs text-zinc-500 text-center">
              💡 Próximamente: Importación automática con API
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
