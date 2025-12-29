import { create } from 'zustand'
import type { CreatorProfile, YouTubeTrack, ProfileTheme } from '@/types'

interface ProfileCustomizationState {
  profile: Partial<CreatorProfile>
  isDirty: boolean
  isPreviewMode: boolean
  
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
  saveChanges: () => void
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
    set({ profile: defaultProfile, isDirty: false }),

  saveChanges: () => {
    // TODO: Implement API call to save profile
    set({ isDirty: false })
  },
}))
