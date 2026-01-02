'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card } from '@/components/ui'
import { uploadApi, authApi, ApiError, interestsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { API_URL } from '@/lib/config'
import { User as UserIcon, ImagePlus, Save, ArrowLeft, Tag, Palette } from 'lucide-react'
import { InterestSelector } from '@/components/interests'
import type { Interest } from '@/types'

// Colores de fondo predefinidos
const backgroundColors = [
  { id: 'dark', name: 'Oscuro', color: '#0f0f14', gradient: 'from-[#0f0f14] to-[#1a1a24]' },
  { id: 'purple', name: 'Púrpura', color: '#2d1b4e', gradient: 'from-[#2d1b4e] to-[#1a1030]' },
  { id: 'blue', name: 'Azul', color: '#1a2744', gradient: 'from-[#1a2744] to-[#0d1520]' },
  { id: 'pink', name: 'Rosa', color: '#3d1a35', gradient: 'from-[#3d1a35] to-[#1f0d1a]' },
  { id: 'green', name: 'Verde', color: '#1a3d2e', gradient: 'from-[#1a3d2e] to-[#0d1f17]' },
  { id: 'orange', name: 'Naranja', color: '#3d2a1a', gradient: 'from-[#3d2a1a] to-[#1f150d]' },
]

// Colores de acento predefinidos
const accentColors = [
  { id: 'fuchsia', name: 'Fucsia', color: '#d946ef' },
  { id: 'cyan', name: 'Cyan', color: '#22d3ee' },
  { id: 'green', name: 'Verde', color: '#22c55e' },
  { id: 'orange', name: 'Naranja', color: '#f97316' },
  { id: 'blue', name: 'Azul', color: '#3b82f6' },
  { id: 'red', name: 'Rojo', color: '#ef4444' },
]

interface ProfileData {
  displayName: string
  username: string
  bio: string
  avatar: string | null
  coverImage: string | null
  backgroundColor: string
  backgroundGradient: string
  accentColor: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { token, logout, hasHydrated } = useAuthStore()
  const [profile, setProfile] = useState<ProfileData>({
    displayName: '',
    username: '',
    bio: '',
    avatar: null,
    coverImage: null,
    backgroundColor: backgroundColors[0].color,
    backgroundGradient: backgroundColors[0].gradient,
    accentColor: accentColors[0].color,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [previewCover, setPreviewCover] = useState<string | null>(null)
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([])
  const [initialInterests, setInitialInterests] = useState<Interest[]>([])
  const [selectedColorId, setSelectedColorId] = useState('dark')
  const [selectedAccentId, setSelectedAccentId] = useState('fuchsia')

  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!hasHydrated) return

    if (!token) {
      router.push('/login')
      return
    }

    loadProfile(token)
  }, [token, hasHydrated, router])

  const loadProfile = async (authToken: string) => {
    setIsLoading(true)
    try {
      const userData = await authApi.getMe(authToken) as any

      setProfile({
        displayName: userData.displayName || '',
        username: userData.username || '',
        bio: userData.bio || '',
        avatar: userData.avatar,
        coverImage: userData.coverImage,
        backgroundColor: userData.backgroundColor || backgroundColors[0].color,
        backgroundGradient: userData.backgroundGradient || backgroundColors[0].gradient,
        accentColor: userData.accentColor || accentColors[0].color,
      })

      // Set previews
      if (userData.coverImage) {
        setPreviewCover(userData.coverImage)
      }

      // Find matching color IDs
      const bgColor = backgroundColors.find(c => c.color === userData.backgroundColor)
      if (bgColor) setSelectedColorId(bgColor.id)

      const accent = accentColors.find(c => c.color === userData.accentColor)
      if (accent) setSelectedAccentId(accent.id)

      // Load user interests
      try {
        const interests = await interestsApi.getMyInterests(authToken)
        setSelectedInterests(interests)
        setInitialInterests(interests)
      } catch (err) {
        console.error('Error loading interests:', err)
      }
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        logout()
        router.push('/login')
        return
      }
      setError('Error al cargar el perfil')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewCover(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleColorSelect = (color: typeof backgroundColors[0]) => {
    setSelectedColorId(color.id)
    setProfile(prev => ({
      ...prev,
      backgroundColor: color.color,
      backgroundGradient: color.gradient,
    }))
  }

  const handleAccentColorSelect = (color: typeof accentColors[0]) => {
    setSelectedAccentId(color.id)
    setProfile(prev => ({
      ...prev,
      accentColor: color.color,
    }))
  }

  const handleSave = async () => {
    if (!token) {
      setError('No autenticado')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Upload cover image if changed
      if (coverImageFile && token) {
        await uploadApi.cover(coverImageFile, token)
      }

      // 2. Update profile data
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: profile.bio,
          backgroundColor: profile.backgroundColor,
          backgroundGradient: profile.backgroundGradient,
          accentColor: profile.accentColor,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      // 3. Update interests if changed
      const currentInterestIds = selectedInterests.map(i => i.id)
      const initialInterestIds = initialInterests.map(i => i.id)
      const toAdd = currentInterestIds.filter(id => !initialInterestIds.includes(id))
      const toRemove = initialInterestIds.filter(id => !currentInterestIds.includes(id))

      if (toAdd.length > 0) {
        await interestsApi.addMyInterests(toAdd, token)
      }

      for (const interestId of toRemove) {
        await interestsApi.removeMyInterest(interestId, token)
      }

      setSuccess('¡Perfil actualizado correctamente!')
      setCoverImageFile(null)

      // Reload to get updated data
      await loadProfile(token)
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 401) {
        logout()
        router.push('/login')
        return
      }
      setError(err.message || 'Error al guardar los cambios')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserIcon className="w-8 h-8" />
            Editar Mi Perfil
          </h1>
          <p className="text-white/70 mt-2">Personaliza tu perfil como fan de la plataforma</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Profile Info & Interests */}
          <div className="space-y-6">
            {/* Cover Image */}
            <Card variant="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ImagePlus className="w-5 h-5" />
                  Imagen de Portada
                </h2>

                <div
                  className="relative w-full h-48 rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {previewCover ? (
                    <img
                      src={previewCover}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                      <ImagePlus className="w-12 h-12 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">Cambiar portada</span>
                  </div>
                </div>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </Card>

            {/* Bio */}
            <Card variant="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Biografía</h2>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-fuchsia-500/50 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-white/40 mt-2">
                  {profile.bio.length}/500 caracteres
                </p>
              </div>
            </Card>

            {/* Interests */}
            <Card variant="glass">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-bold text-white">Intereses</h2>
                </div>
                <p className="text-sm text-white/50 mb-6">
                  Selecciona tus intereses (3-10) para descubrir creadores relevantes
                </p>

                <InterestSelector
                  selectedInterests={selectedInterests}
                  onSelectionChange={setSelectedInterests}
                  minInterests={3}
                  maxInterests={10}
                  mode="user"
                  showNSFW={true}
                />
              </div>
            </Card>
          </div>

          {/* Right Column: Customization */}
          <div className="space-y-6">
            {/* Background Color */}
            <Card variant="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color de Fondo
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  {backgroundColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color)}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedColorId === color.id
                          ? 'ring-2 ring-offset-2 ring-offset-transparent scale-105'
                          : 'hover:scale-105'
                      }`}
                      style={selectedColorId === color.id ? { outlineColor: profile.accentColor } : {}}
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${color.gradient}`} />
                      {selectedColorId === color.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Accent Color */}
            <Card variant="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Color de Acento</h2>

                <div className="grid grid-cols-3 gap-3">
                  {accentColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleAccentColorSelect(color)}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedAccentId === color.id
                          ? 'ring-2 ring-white/30 scale-105'
                          : 'hover:scale-105'
                      }`}
                    >
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: color.color }}
                      />
                      {selectedAccentId === color.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Preview */}
            <Card variant="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Vista Previa</h2>
                <div
                  className="rounded-xl overflow-hidden border border-white/10"
                  style={{
                    background: `linear-gradient(to bottom right, ${profile.backgroundColor}, ${profile.backgroundColor}dd)`
                  }}
                >
                  {/* Cover */}
                  <div className="h-24 bg-gradient-to-r from-white/5 to-white/10 relative">
                    {previewCover && (
                      <img src={previewCover} alt="Cover" className="w-full h-full object-cover opacity-50" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1">{profile.displayName || 'Tu Nombre'}</h3>
                    <p className="text-sm text-white/60 mb-3">@{profile.username}</p>
                    {profile.bio && (
                      <p className="text-sm text-white/70 mb-3 line-clamp-2">{profile.bio}</p>
                    )}
                    <div className="flex gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${profile.accentColor}20`,
                          color: profile.accentColor
                        }}
                      >
                        Color de acento
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => router.push('/dashboard')}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[200px]"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar Cambios
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
