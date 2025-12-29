import { create } from 'zustand'
import type { CreatorProfile, YouTubeTrack, ProfileTheme } from '@/types'
import { creatorApi } from '@/lib/api'

interface ProfileCustomizationState {
  profile: Partial<CreatorProfile>
  isDirty: boolean
  isPreviewMode: boolean
  isSaving: boolean
  saveError: string | null

  // Actions
  setBackgroundColor: (color: string) => void
  setBackgroundGradient: (gradient: string) => void
  setBackgroundImage: (url: string) => void
  setAccentColor: (color: string) => void
  setTextColor: (color: string) => void
  setFontFamily: (font: string) => void
  setTheme: (theme: ProfileTheme) => void

  // Music
  addMusicTrack: (track: YouTubeTrack) => void
  removeMusicTrack: (trackId: string) => void
  reorderMusicTracks: (tracks: YouTubeTrack[]) => void

  // Preview
  togglePreviewMode: () => void
  resetChanges: () => void
  saveChanges: (token: string) => Promise<void>
  loadProfile: (profile: Partial<CreatorProfile>) => void
}

const defaultProfile: Partial<CreatorProfile> = {
  backgroundColor: '#0f0f14',
  accentColor: '#d946ef',
  textColor: '#ffffff',
  fontFamily: 'Inter',
  musicTracks: [],
  theme: {
    preset: 'dark',
    primaryColor: '#d946ef',
    secondaryColor: '#f43f5e',
    glowEnabled: true,
    particlesEnabled: false,
  },
}

export const useProfileCustomizationStore = create<ProfileCustomizationState>((set, get) => ({
  profile: defaultProfile,
  isDirty: false,
  isPreviewMode: false,
  isSaving: false,
  saveError: null,

  setBackgroundColor: (color) =>
    set((state) => ({
      profile: { ...state.profile, backgroundColor: color },
      isDirty: true,
    })),

  setBackgroundGradient: (gradient) =>
    set((state) => ({
      profile: { ...state.profile, backgroundGradient: gradient },
      isDirty: true,
    })),

  setBackgroundImage: (url) =>
    set((state) => ({
      profile: { ...state.profile, backgroundImage: url },
      isDirty: true,
    })),

  setAccentColor: (color) =>
    set((state) => ({
      profile: { ...state.profile, accentColor: color },
      isDirty: true,
    })),

  setTextColor: (color) =>
    set((state) => ({
      profile: { ...state.profile, textColor: color },
      isDirty: true,
    })),

  setFontFamily: (font) =>
    set((state) => ({
      profile: { ...state.profile, fontFamily: font },
      isDirty: true,
    })),

  setTheme: (theme) =>
    set((state) => ({
      profile: { ...state.profile, theme },
      isDirty: true,
    })),

  addMusicTrack: (track) =>
    set((state) => {
      const currentTracks = state.profile.musicTracks || []
      if (currentTracks.length >= 3) return state // Max 3 tracks
      return {
        profile: {
          ...state.profile,
          musicTracks: [...currentTracks, track],
        },
        isDirty: true,
      }
    }),

  removeMusicTrack: (trackId) =>
    set((state) => ({
      profile: {
        ...state.profile,
        musicTracks: (state.profile.musicTracks || []).filter((t) => t.id !== trackId),
      },
      isDirty: true,
    })),

  reorderMusicTracks: (tracks) =>
    set((state) => ({
      profile: { ...state.profile, musicTracks: tracks },
      isDirty: true,
    })),

  togglePreviewMode: () =>
    set((state) => ({ isPreviewMode: !state.isPreviewMode })),

  resetChanges: () =>
    set({ profile: defaultProfile, isDirty: false, saveError: null }),

  saveChanges: async (token: string) => {
    const { profile } = get()

    set({ isSaving: true, saveError: null })

    try {
      await creatorApi.updateProfile({
        backgroundColor: profile.backgroundColor,
        backgroundGradient: profile.backgroundGradient,
        backgroundImage: profile.backgroundImage,
        accentColor: profile.accentColor,
        textColor: profile.textColor,
        fontFamily: profile.fontFamily,
        coverImage: profile.coverImage,
      }, token)

      set({ isDirty: false, isSaving: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar cambios'
      set({ saveError: errorMessage, isSaving: false })
      throw error
    }
  },

  loadProfile: (profile: Partial<CreatorProfile>) =>
    set({ profile, isDirty: false, saveError: null }),
}))
