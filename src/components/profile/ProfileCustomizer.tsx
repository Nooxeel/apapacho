'use client'

import { useState } from 'react'
import { Card, Button, Input, Badge } from '@/components/ui'
import { useProfileCustomizationStore } from '@/stores'
import { useAuthStore } from '@/stores/authStore'
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/utils'
import type { YouTubeTrack } from '@/types'

const presetThemes = [
  { name: 'Neón', primary: '#d946ef', secondary: '#f43f5e', bg: 'from-purple-900 via-black to-pink-900' },
  { name: 'Ocean', primary: '#06b6d4', secondary: '#3b82f6', bg: 'from-cyan-900 via-black to-blue-900' },
  { name: 'Forest', primary: '#22c55e', secondary: '#84cc16', bg: 'from-green-900 via-black to-lime-900' },
  { name: 'Sunset', primary: '#f97316', secondary: '#eab308', bg: 'from-orange-900 via-black to-yellow-900' },
  { name: 'Dark', primary: '#6366f1', secondary: '#8b5cf6', bg: 'from-slate-900 via-black to-violet-900' },
  { name: 'Retro', primary: '#ec4899', secondary: '#f472b6', bg: 'from-pink-900 via-black to-rose-900' },
]

const fontOptions = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Playfair', value: 'Playfair Display' },
  { name: 'Comic Sans', value: 'Comic Sans MS' },
]

export function ProfileCustomizer() {
  const {
    profile,
    setBackgroundColor,
    setAccentColor,
    setTextColor,
    setFontFamily,
    addMusicTrack,
    removeMusicTrack,
    isDirty,
    saveChanges,
    resetChanges,
  } = useProfileCustomizationStore()

  const { token } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'theme' | 'music' | 'advanced'>('theme')
  const [newMusicUrl, setNewMusicUrl] = useState('')
  const [musicError, setMusicError] = useState('')

  const handleSaveChanges = async () => {
    if (!token) return
    try {
      await saveChanges(token)
    } catch (error) {
      console.error('Error saving changes:', error)
    }
  }

  const handleAddMusic = () => {
    setMusicError('')
    const videoId = extractYouTubeId(newMusicUrl)
    
    if (!videoId) {
      setMusicError('URL de YouTube inválida')
      return
    }

    if ((profile.musicTracks?.length || 0) >= 3) {
      setMusicError('Máximo 3 canciones permitidas')
      return
    }

    const newTrack: YouTubeTrack = {
      id: crypto.randomUUID(),
      youtubeUrl: newMusicUrl,
      youtubeId: videoId,
      title: 'Nueva canción', // In real app, would fetch from YouTube API
      thumbnail: getYouTubeThumbnail(videoId),
      order: (profile.musicTracks?.length || 0) + 1,
    }

    addMusicTrack(newTrack)
    setNewMusicUrl('')
  }

  const tabs = [
    { id: 'theme', label: 'Tema', icon: '🎨' },
    { id: 'music', label: 'Música', icon: '🎵' },
    { id: 'advanced', label: 'Avanzado', icon: '⚙️' },
  ]

  return (
    <Card variant="glass" className="w-full max-w-md">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-1">Personalizar Perfil</h3>
        <p className="text-white/50 text-sm mb-6">Hazlo único como tú</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            {/* Preset Themes */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Temas Predefinidos
              </label>
              <div className="grid grid-cols-3 gap-2">
                {presetThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      setAccentColor(theme.primary)
                      setBackgroundColor(theme.primary)
                    }}
                    className="group relative p-3 rounded-xl border border-white/10 hover:border-primary-500/50 transition-all"
                  >
                    <div
                      className={`w-full h-8 rounded-lg bg-gradient-to-r ${theme.bg} mb-2`}
                    />
                    <span className="text-xs text-white/60 group-hover:text-white">
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Color Principal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={profile.accentColor || '#d946ef'}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <span className="text-sm text-white/50">{profile.accentColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Color de Texto
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={profile.textColor || '#ffffff'}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <span className="text-sm text-white/50">{profile.textColor}</span>
                </div>
              </div>
            </div>

            {/* Font Selector */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Fuente
              </label>
              <div className="flex flex-wrap gap-2">
                {fontOptions.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => setFontFamily(font.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      profile.fontFamily === font.value
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white/80">
                  Canciones del Perfil
                </label>
                <Badge variant="primary" size="sm">
                  {profile.musicTracks?.length || 0}/3
                </Badge>
              </div>

              {/* Add new music */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="URL de YouTube..."
                  value={newMusicUrl}
                  onChange={(e) => setNewMusicUrl(e.target.value)}
                  error={musicError}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  onClick={handleAddMusic}
                  disabled={(profile.musicTracks?.length || 0) >= 3}
                >
                  +
                </Button>
              </div>

              {/* Music list */}
              <div className="space-y-2">
                {profile.musicTracks?.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{track.title}</p>
                      <p className="text-xs text-white/40">Track {index + 1}</p>
                    </div>
                    <button
                      onClick={() => removeMusicTrack(track.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {!profile.musicTracks?.length && (
                  <div className="text-center py-8 text-white/40">
                    <p className="text-3xl mb-2">🎵</p>
                    <p className="text-sm">Agrega música a tu perfil</p>
                    <p className="text-xs">Máximo 3 canciones de YouTube</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Efectos Visuales
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <span className="text-sm text-white">Efecto de brillo (Glow)</span>
                  <input
                    type="checkbox"
                    checked={profile.theme?.glowEnabled || false}
                    className="w-4 h-4 accent-primary-500"
                    readOnly
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <span className="text-sm text-white">Partículas flotantes</span>
                  <input
                    type="checkbox"
                    checked={profile.theme?.particlesEnabled || false}
                    className="w-4 h-4 accent-primary-500"
                    readOnly
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                CSS Personalizado
              </label>
              <textarea
                placeholder="/* Escribe tu CSS aquí */"
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none"
              />
              <p className="text-xs text-white/40 mt-1">
                ⚠️ Funcionalidad avanzada. Úsala con cuidado.
              </p>
            </div>
          </div>
        )}

        {/* Save/Reset Buttons */}
        {isDirty && (
          <div className="flex gap-2 mt-6 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={resetChanges} className="flex-1">
              Descartar
            </Button>
            <Button variant="primary" onClick={handleSaveChanges} className="flex-1">
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
