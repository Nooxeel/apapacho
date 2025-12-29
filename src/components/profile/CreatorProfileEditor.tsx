'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card } from '@/components/ui'
import { creatorApi, uploadApi, authApi } from '@/lib/api'

// Opciones de colores de fondo predefinidos
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
  profileImage: string | null
  coverImage: string | null
  backgroundColor: string
  backgroundGradient: string
  accentColor: string
}

interface MusicTrack {
  id: string
  youtubeUrl: string
  youtubeId: string
  title: string
  artist?: string
  thumbnail: string
  order: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function CreatorProfileEditor() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileData>({
    displayName: '',
    username: '',
    bio: '',
    avatar: null,
    profileImage: null,
    coverImage: null,
    backgroundColor: backgroundColors[0].color,
    backgroundGradient: backgroundColors[0].gradient,
    accentColor: accentColors[0].color,
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(null)
  const [previewCover, setPreviewCover] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('')
  const [isAddingTrack, setIsAddingTrack] = useState(false)
  
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Load current profile data
  useEffect(() => {
    const storedToken = localStorage.getItem('apapacho-token')
    if (!storedToken) {
      router.push('/login')
      return
    }
    setToken(storedToken)
    loadProfile(storedToken)
  }, [router])

  const loadProfile = async (authToken: string) => {
    setIsLoading(true)
    try {
      const userData = await authApi.getMe(authToken) as any
      if (!userData.creatorProfile) {
        setError('No eres un creador')
        return
      }

      setProfile({
        displayName: userData.displayName || '',
        username: userData.username || '',
        bio: userData.creatorProfile.bio || '',
        avatar: userData.avatar,
        profileImage: userData.creatorProfile.profileImage,
        coverImage: userData.creatorProfile.coverImage,
        backgroundColor: userData.creatorProfile.backgroundColor || backgroundColors[0].color,
        backgroundGradient: userData.creatorProfile.backgroundGradient || backgroundColors[0].gradient,
        accentColor: userData.creatorProfile.accentColor || accentColors[0].color,
      })

      // Set previews from existing images (images are served from frontend /public)
      if (userData.creatorProfile.profileImage) {
        setPreviewProfileImage(userData.creatorProfile.profileImage)
      }
      if (userData.creatorProfile.coverImage) {
        setPreviewCover(userData.creatorProfile.coverImage)
      }
      
      // Load music tracks
      if (userData.creatorProfile.musicTracks) {
        setMusicTracks(userData.creatorProfile.musicTracks)
      }
    } catch (err) {
      setError('Error al cargar el perfil')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
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
    setProfile(prev => ({
      ...prev,
      backgroundColor: color.color,
      backgroundGradient: color.gradient,
    }))
  }

  const handleAccentColorSelect = (color: typeof accentColors[0]) => {
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
      // 1. Upload images first (if changed) using separate endpoints
      if (profileImageFile) {
        const profileFormData = new FormData()
        profileFormData.append('profileImage', profileImageFile)
        
        const profileRes = await fetch(`${API_URL}/upload/profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: profileFormData,
        })
        
        if (!profileRes.ok) {
          const error = await profileRes.json()
          throw new Error(error.error || 'Error al subir imagen de perfil')
        }
      }

      if (coverImageFile) {
        const coverFormData = new FormData()
        coverFormData.append('coverImage', coverImageFile)
        
        const coverRes = await fetch(`${API_URL}/upload/cover`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: coverFormData,
        })
        
        if (!coverRes.ok) {
          const error = await coverRes.json()
          throw new Error(error.error || 'Error al subir imagen de portada')
        }
      }

      // 2. Update profile data (without files)
      const response = await fetch(`${API_URL}/creators/profile`, {
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

      setSuccess('¡Perfil actualizado correctamente!')
      setProfileImageFile(null)
      setCoverImageFile(null)

      // Reload to get updated data
      await loadProfile(token)
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleViewProfile = () => {
    if (profile.username) {
      window.open(`/${profile.username}`, '_blank')
    }
  }

  // Extract YouTube video ID from URL
  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // Add a music track
  const handleAddMusicTrack = async () => {
    if (!token || !newYoutubeUrl.trim()) return
    
    if (musicTracks.length >= 3) {
      setError('Solo puedes agregar un máximo de 3 canciones')
      return
    }

    const youtubeId = extractYoutubeId(newYoutubeUrl)
    if (!youtubeId) {
      setError('URL de YouTube no válida')
      return
    }

    setIsAddingTrack(true)
    setError(null)

    try {
      // Get video info from YouTube oEmbed API
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`
      const response = await fetch(oembedUrl)
      
      if (!response.ok) {
        throw new Error('No se pudo obtener información del video')
      }

      const videoInfo = await response.json()
      
      const trackData = {
        youtubeUrl: newYoutubeUrl,
        youtubeId,
        title: videoInfo.title || 'Sin título',
        artist: videoInfo.author_name || undefined,
        thumbnail: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
      }

      const newTrack = await creatorApi.addMusicTrack(trackData, token) as MusicTrack
      setMusicTracks(prev => [...prev, newTrack])
      setNewYoutubeUrl('')
      setSuccess('¡Canción agregada!')
    } catch (err: any) {
      setError(err.message || 'Error al agregar la canción')
    } finally {
      setIsAddingTrack(false)
    }
  }

  // Delete a music track
  const handleDeleteMusicTrack = async (trackId: string) => {
    if (!token) return

    try {
      await creatorApi.deleteMusicTrack(trackId, token)
      setMusicTracks(prev => prev.filter(t => t.id !== trackId))
      setSuccess('Canción eliminada')
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la canción')
    }
  }

  const selectedColorId = backgroundColors.find(c => c.color === profile.backgroundColor)?.id || 'dark'
  const selectedAccentId = accentColors.find(c => c.color === profile.accentColor)?.id || 'fuchsia'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{ 
        background: `linear-gradient(to bottom, ${profile.backgroundColor}, ${profile.backgroundColor}dd)` 
      }}
    >
      {/* Live Preview Banner */}
      <div 
        className="border-b px-4 py-2"
        style={{ 
          backgroundColor: `${profile.accentColor}15`,
          borderColor: `${profile.accentColor}30`
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-sm" style={{ color: profile.accentColor }}>
            ✨ Vista previa en vivo - Los cambios se reflejan automáticamente
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/creator/comments')}>
              Comentarios
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewProfile}
              disabled={!profile.username}
            >
              Ver Perfil
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSave} 
              isLoading={isSaving}
              style={{ backgroundColor: profile.accentColor }}
            >
              Guardar Perfil
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        </div>
      )}
      {success && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm">
            {success}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cover Image Section */}
        <div className="relative mb-20">
          <div 
            className="h-48 md:h-64 rounded-2xl overflow-hidden cursor-pointer group"
            style={{ 
              background: previewCover 
                ? 'none' 
                : `linear-gradient(to right, ${profile.accentColor}30, ${profile.accentColor}10)`
            }}
            onClick={() => coverInputRef.current?.click()}
          >
            {previewCover ? (
              <img src={previewCover} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-white/30 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white/30 mt-2 group-hover:text-white/50 transition-colors">
                    Click para subir imagen de portada
                  </p>
                </div>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
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

          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-8">
            <div 
              className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group"
              style={{ 
                borderWidth: '4px',
                borderStyle: 'solid',
                borderColor: profile.accentColor 
              }}
              onClick={() => profileImageInputRef.current?.click()}
            >
              {previewProfileImage ? (
                <img src={previewProfileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${profile.accentColor}, ${profile.accentColor}80)`
                  }}
                >
                  <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Info Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Información del Perfil</h2>
                
                <div className="space-y-4">
                  <Input
                    label="Nombre para mostrar"
                    placeholder="Tu nombre artístico"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    disabled
                  />
                  
                  <Input
                    label="Nombre de usuario"
                    placeholder="tunombre"
                    value={profile.username}
                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                    helperText={`apapacho.com/${profile.username}`}
                    leftIcon={<span className="text-white/50">@</span>}
                    disabled
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Biografía
                    </label>
                    <textarea
                      placeholder="Cuéntale al mundo sobre ti..."
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 resize-none"
                      style={{ 
                        '--tw-ring-color': `${profile.accentColor}50`
                      } as any}
                    />
                    <p className="text-white/40 text-sm mt-1">
                      {profile.bio.length}/500 caracteres
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Customization */}
          <div className="space-y-6">
            {/* Background Color */}
            <Card variant="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Color de Fondo</h2>
                
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
                      <div 
                        className={`w-full h-full bg-gradient-to-br ${color.gradient}`}
                      />
                      {selectedColorId === color.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white/70 font-medium">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/50 mb-2">Color personalizado</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={profile.backgroundColor}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        backgroundColor: e.target.value,
                        backgroundGradient: `from-[${e.target.value}] to-[${e.target.value}dd]`
                      }))}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <span className="text-sm text-white/50 font-mono">
                      {profile.backgroundColor}
                    </span>
                  </div>
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
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-105' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <div 
                        className="w-full h-full"
                        style={{ backgroundColor: color.color }}
                      />
                      {selectedAccentId === color.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white/70 font-medium">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/50 mb-2">Color personalizado</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={profile.accentColor}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        accentColor: e.target.value
                      }))}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <span className="text-sm text-white/50 font-mono">
                      {profile.accentColor}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Music Tracks */}
            <Card variant="glass">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">🎵 Música del Perfil</h2>
                <p className="text-sm text-white/50 mb-6">
                  Agrega hasta 3 canciones de YouTube que sonarán en tu perfil
                </p>

                {/* Current tracks */}
                {musicTracks.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {musicTracks.map((track, index) => (
                      <div 
                        key={track.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={track.thumbnail} 
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{track.title}</p>
                          {track.artist && (
                            <p className="text-xs text-white/50 truncate">{track.artist}</p>
                          )}
                        </div>
                        <span className="text-xs text-white/30">#{index + 1}</span>
                        <button
                          onClick={() => handleDeleteMusicTrack(track.id)}
                          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          title="Eliminar canción"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new track */}
                {musicTracks.length < 3 ? (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        <svg className="w-6 h-6 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="Pega aquí el link de YouTube..."
                          value={newYoutubeUrl}
                          onChange={(e) => setNewYoutubeUrl(e.target.value)}
                          className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
                        />
                      </div>
                      <Button
                        onClick={handleAddMusicTrack}
                        isLoading={isAddingTrack}
                        disabled={!newYoutubeUrl.trim()}
                        className="w-full"
                        style={{ backgroundColor: profile.accentColor }}
                      >
                        Agregar Canción
                      </Button>
                    </div>
                    <p className="text-xs text-white/40 text-center">
                      {3 - musicTracks.length} espacios disponibles • Las canciones se reproducirán en loop
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-white/50 text-center py-2">
                    Has alcanzado el límite de 3 canciones
                  </p>
                )}
              </div>
            </Card>

            {/* Quick Stats Preview */}
            <Card variant="glass">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Estado del Perfil</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Foto de perfil</span>
                    <span className={previewProfileImage ? 'text-green-400' : 'text-white/30'}>
                      {previewProfileImage ? '✓ Subida' : 'No subida'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Portada</span>
                    <span className={previewCover ? 'text-green-400' : 'text-white/30'}>
                      {previewCover ? '✓ Subida' : 'No subida'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Nombre</span>
                    <span className={profile.displayName ? 'text-green-400' : 'text-white/30'}>
                      {profile.displayName ? '✓ Completado' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Bio</span>
                    <span className={profile.bio ? 'text-green-400' : 'text-white/30'}>
                      {profile.bio ? '✓ Completado' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Música</span>
                    <span className={musicTracks.length > 0 ? 'text-green-400' : 'text-white/30'}>
                      {musicTracks.length > 0 ? `${musicTracks.length}/3 canciones` : 'Sin música'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
