'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Droplet, 
  Eye, 
  EyeOff,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Maximize2,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Image as ImageIcon
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { watermarkApi, WatermarkSettings } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'

const POSITION_OPTIONS: { value: WatermarkSettings['position']; label: string; icon: any }[] = [
  { value: 'top-left', label: 'Arriba Izq', icon: ArrowUpLeft },
  { value: 'top-right', label: 'Arriba Der', icon: ArrowUpRight },
  { value: 'bottom-left', label: 'Abajo Izq', icon: ArrowDownLeft },
  { value: 'bottom-right', label: 'Abajo Der', icon: ArrowDownRight },
  { value: 'center', label: 'Centro', icon: Maximize2 },
]

const SIZE_OPTIONS: { value: WatermarkSettings['size']; label: string }[] = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
]

export default function WatermarkPage() {
  const router = useRouter()
  const { token, user, hasHydrated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [settings, setSettings] = useState<WatermarkSettings>({
    enabled: false,
    text: '',
    position: 'bottom-right',
    opacity: 0.7,
    size: 'medium'
  })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Proteger ruta
  useEffect(() => {
    if (!hasHydrated) return
    if (!token || !user?.isCreator) {
      router.push('/login')
    }
  }, [token, user, hasHydrated, router])

  // Cargar settings
  useEffect(() => {
    if (!token) return

    const fetchSettings = async () => {
      try {
        const response = await watermarkApi.getSettings(token)
        setSettings(response.settings)
        
        // Si no tiene texto, usar @username por defecto
        if (!response.settings.text && user?.username) {
          setSettings(s => ({ ...s, text: `@${user.username}` }))
        }
      } catch (err) {
        console.error('Error fetching watermark settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [token, user])

  // Generar preview cuando cambian los settings
  useEffect(() => {
    if (!token || !settings.enabled) {
      setPreviewUrl(null)
      return
    }

    const debounce = setTimeout(async () => {
      setLoadingPreview(true)
      try {
        const result = await watermarkApi.preview(settings, undefined, token)
        setPreviewUrl(result.watermarkedUrl)
      } catch (err) {
        console.error('Error generating preview:', err)
      } finally {
        setLoadingPreview(false)
      }
    }, 500)

    return () => clearTimeout(debounce)
  }, [token, settings])

  const handleSave = async () => {
    if (!token) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      await watermarkApi.updateSettings(settings, token)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplet className="w-7 h-7 text-pink-500" />
            Marca de Agua
          </h1>
          <p className="text-gray-400 mt-1">
            Protege tu contenido agregando una marca de agua automática
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Configuración</h2>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700">
              <div>
                <p className="font-medium text-white">Activar marca de agua</p>
                <p className="text-sm text-gray-400">
                  Se aplicará automáticamente a todo tu contenido
                </p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  settings.enabled ? 'bg-pink-500' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                  settings.enabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Texto de la marca
              </label>
              <input
                type="text"
                value={settings.text}
                onChange={(e) => setSettings(s => ({ ...s, text: e.target.value }))}
                placeholder={`@${user?.username || 'tunombre'}`}
                maxLength={50}
                disabled={!settings.enabled}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 50 caracteres</p>
            </div>

            {/* Position */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Posición
              </label>
              <div className="grid grid-cols-5 gap-2">
                {POSITION_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSettings(s => ({ ...s, position: option.value }))}
                      disabled={!settings.enabled}
                      className={`p-3 rounded-lg border transition flex flex-col items-center gap-1 ${
                        settings.position === option.value
                          ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                          : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-gray-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tamaño
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings(s => ({ ...s, size: option.value }))}
                    disabled={!settings.enabled}
                    className={`py-2.5 rounded-lg border transition font-medium ${
                      settings.size === option.value
                        ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                        : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-gray-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Opacidad: {Math.round(settings.opacity * 100)}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={settings.opacity * 100}
                onChange={(e) => setSettings(s => ({ ...s, opacity: parseInt(e.target.value) / 100 }))}
                disabled={!settings.enabled}
                className="w-full accent-pink-500 disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Sutil</span>
                <span>Visible</span>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                Configuración guardada
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Configuración
                </>
              )}
            </button>
          </div>

          {/* Preview */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              {settings.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              Vista Previa
            </h2>

            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-gray-700">
              {!settings.enabled ? (
                <div className="text-center text-gray-500">
                  <EyeOff className="w-12 h-12 mx-auto mb-2" />
                  <p>Marca de agua desactivada</p>
                </div>
              ) : loadingPreview ? (
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview con watermark"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewUrl(null)}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>Generando preview...</p>
                </div>
              )}

              {/* Simulated watermark position indicator */}
              {settings.enabled && !previewUrl && (
                <div 
                  className={`absolute text-white/70 font-bold text-sm px-3 py-1 bg-black/30 rounded ${
                    settings.position === 'top-left' ? 'top-4 left-4' :
                    settings.position === 'top-right' ? 'top-4 right-4' :
                    settings.position === 'bottom-left' ? 'bottom-4 left-4' :
                    settings.position === 'bottom-right' ? 'bottom-4 right-4' :
                    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                  }`}
                  style={{ opacity: settings.opacity }}
                >
                  {settings.text || `@${user?.username || 'ejemplo'}`}
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <h3 className="text-sm font-medium text-white mb-2">ℹ️ Información</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• La marca de agua se aplica automáticamente a nuevas imágenes y videos</li>
                <li>• El contenido existente no se modificará</li>
                <li>• La marca usa transformaciones de Cloudinary (no afecta el archivo original)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
