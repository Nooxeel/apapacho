import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Creator } from '@/types'

interface AuthState {
  user: User | Creator | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean
  login: (user: User | Creator, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User | Creator>) => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'apapacho-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
