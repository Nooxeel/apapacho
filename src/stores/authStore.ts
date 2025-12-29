import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Creator } from '@/types'

interface AuthState {
  user: User | Creator | null
  token: string | null
  tokenExpiry: number | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean
  login: (user: User | Creator, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User | Creator>) => void
  setHasHydrated: (state: boolean) => void
  isTokenValid: () => boolean
  checkTokenExpiry: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tokenExpiry: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      login: (user, token) => {
        // Decode JWT to get expiry (simplified - assumes JWT format)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const expiry = payload.exp ? payload.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000 // Default to 24h if no exp
          set({ user, token, tokenExpiry: expiry, isAuthenticated: true })
        } catch {
          // If can't decode, set expiry to 24h from now
          set({ user, token, tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, isAuthenticated: true })
        }
      },

      logout: () => set({
        user: null,
        token: null,
        tokenExpiry: null,
        isAuthenticated: false
      }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setHasHydrated: (state) => set({ hasHydrated: state }),

      isTokenValid: () => {
        const { token, tokenExpiry } = get()
        if (!token || !tokenExpiry) return false
        return Date.now() < tokenExpiry
      },

      checkTokenExpiry: () => {
        const { isTokenValid, logout } = get()
        if (!isTokenValid()) {
          logout()
        }
      },
    }),
    {
      name: 'apapacho-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
        // Check token validity after hydration
        state?.checkTokenExpiry()
      },
    }
  )
)
