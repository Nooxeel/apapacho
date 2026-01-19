import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Creator } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface AuthState {
  user: User | Creator | null
  token: string | null
  tokenExpiry: number | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean
  isRefreshing: boolean
  login: (user: User | Creator, token: string, expiresIn?: number) => void
  logout: () => Promise<void>
  updateUser: (updates: Partial<User | Creator>) => void
  setHasHydrated: (state: boolean) => void
  isTokenValid: () => boolean
  checkTokenExpiry: () => void
  refreshToken: () => Promise<boolean>
}

// Track if we're already refreshing to prevent multiple simultaneous refreshes
let refreshPromise: Promise<boolean> | null = null

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tokenExpiry: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      isRefreshing: false,

      login: (user, token, expiresIn) => {
        let expiry: number
        
        if (expiresIn) {
          // Use provided expiry (in seconds)
          expiry = Date.now() + expiresIn * 1000
        } else {
          // Decode JWT to get expiry (simplified - assumes JWT format)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            expiry = payload.exp ? payload.exp * 1000 : Date.now() + 15 * 60 * 1000 // Default to 15min
          } catch {
            // If can't decode, set expiry to 15min from now
            expiry = Date.now() + 15 * 60 * 1000
          }
        }
        
        set({ user, token, tokenExpiry: expiry, isAuthenticated: true })
      },

      logout: async () => {
        // Clear httpOnly cookies on backend
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          })
        } catch {
          // Ignore errors - still clear local state
        }
        
        set({
          user: null,
          token: null,
          tokenExpiry: null,
          isAuthenticated: false
        })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setHasHydrated: (state) => set({ hasHydrated: state }),

      isTokenValid: () => {
        const { token, tokenExpiry } = get()
        if (!token || !tokenExpiry) return false
        // Consider token invalid 30 seconds before actual expiry (buffer for network latency)
        return Date.now() < (tokenExpiry - 30000)
      },

      refreshToken: async () => {
        // If already refreshing, wait for that promise
        if (refreshPromise) {
          return refreshPromise
        }
        
        const { isAuthenticated } = get()
        if (!isAuthenticated) return false
        
        set({ isRefreshing: true })
        
        refreshPromise = (async () => {
          try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
              method: 'POST',
              credentials: 'include', // Send refresh token cookie
              headers: {
                'Content-Type': 'application/json',
              },
            })
            
            if (!response.ok) {
              // Refresh failed - logout
              get().logout()
              return false
            }
            
            const data = await response.json()
            
            // Update token in state
            set({
              token: data.token,
              tokenExpiry: Date.now() + (data.expiresIn * 1000),
            })
            
            return true
          } catch (error) {
            console.error('Token refresh failed:', error)
            get().logout()
            return false
          } finally {
            set({ isRefreshing: false })
            refreshPromise = null
          }
        })()
        
        return refreshPromise
      },

      checkTokenExpiry: async () => {
        const { isTokenValid, refreshToken, logout, isAuthenticated } = get()
        
        if (!isAuthenticated) return
        
        if (!isTokenValid()) {
          // Try to refresh the token
          const success = await refreshToken()
          if (!success) {
            logout()
          }
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
