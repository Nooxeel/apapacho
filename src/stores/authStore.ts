import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Creator } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

/**
 * Auth store — R0-05
 *
 * Security model:
 *  - The JWT access token and refresh token are set as httpOnly cookies by
 *    the backend. They are NEVER persisted to localStorage (XSS hardening).
 *  - Only the `user` profile is persisted, purely for UX so the UI can render
 *    a signed-in shell immediately on page load. Real authorization is
 *    enforced server-side via the cookie on every request.
 *  - We keep an in-memory `token` field as a transitional shim for callers
 *    that still pass `token` into API wrappers (the `api()` client falls back
 *    to `credentials: 'include'` and the cookie, so passing undefined is OK).
 *    This field is intentionally excluded from `persist.partialize`.
 *  - `isAuthenticated` is derived from `!!user` so that it cannot go out of
 *    sync with the persisted state across tabs.
 */

interface AuthState {
  user: User | Creator | null
  /**
   * In-memory access token, if we happen to have one in this browser tab
   * (e.g. right after login while the backend still echoes `token` in the
   * response body). Never persisted. May be null even when the user is
   * authenticated — cookies are the source of truth.
   */
  token: string | null
  tokenExpiry: number | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean
  isRefreshing: boolean
  login: (user: User | Creator, token?: string, expiresIn?: number) => void
  logout: () => Promise<void>
  updateUser: (updates: Partial<User | Creator>) => void
  setHasHydrated: (state: boolean) => void
  isTokenValid: () => boolean
  checkTokenExpiry: () => Promise<void>
  refreshToken: () => Promise<boolean>
  /** Rehydrate user from server using the session cookie. */
  rehydrateFromCookie: () => Promise<void>
}

// Guard against concurrent refresh calls.
let refreshPromise: Promise<boolean> | null = null

function decodeTokenExpiry(token: string, expiresIn?: number): number {
  if (expiresIn) {
    return Date.now() + expiresIn * 1000
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? payload.exp * 1000 : Date.now() + 15 * 60 * 1000
  } catch {
    return Date.now() + 15 * 60 * 1000
  }
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
      isRefreshing: false,

      login: (user, token, expiresIn) => {
        const tokenExpiry = token ? decodeTokenExpiry(token, expiresIn) : null
        set({
          user,
          token: token ?? null,
          tokenExpiry,
          isAuthenticated: true,
        })
      },

      logout: async () => {
        // Ask the backend to clear httpOnly cookies. We ignore errors because
        // we want the local state cleared either way.
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          })
        } catch {
          // Swallow — cookie may already be gone.
        }

        set({
          user: null,
          token: null,
          tokenExpiry: null,
          isAuthenticated: false,
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
        // 30s buffer to avoid racing the server clock.
        return Date.now() < tokenExpiry - 30000
      },

      refreshToken: async () => {
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
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
              },
            })

            if (!response.ok) {
              await get().logout()
              return false
            }

            const data = await response.json()
            set({
              token: data.token ?? null,
              tokenExpiry: data.token ? decodeTokenExpiry(data.token, data.expiresIn) : null,
            })
            return true
          } catch (error) {
            console.error('Token refresh failed:', error)
            await get().logout()
            return false
          } finally {
            set({ isRefreshing: false })
            refreshPromise = null
          }
        })()

        return refreshPromise
      },

      checkTokenExpiry: async () => {
        const { isAuthenticated, isTokenValid, refreshToken, logout, token } = get()

        if (!isAuthenticated) return
        // If we have no in-memory token (typical after a full page reload now
        // that token is not persisted), trust the cookie until a 401 proves
        // otherwise. `api()` will auto-refresh on 401.
        if (!token) return

        if (!isTokenValid()) {
          const success = await refreshToken()
          if (!success) {
            await logout()
          }
        }
      },

      rehydrateFromCookie: async () => {
        // Called once on store hydration. Uses the cookie-authenticated
        // /users/me endpoint to rebuild the user profile and confirm the
        // session is still valid. If no cookie is present or the cookie is
        // invalid we clear the persisted user so the UI degrades to logged
        // out without a forced logout call.
        try {
          const response = await fetch(`${API_URL}/users/me`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          })

          if (response.status === 401) {
            // Session expired or no cookie — clear persisted user silently.
            set({ user: null, token: null, tokenExpiry: null, isAuthenticated: false })
            return
          }

          if (!response.ok) {
            // Network or server error. Keep the persisted user so the UI
            // isn't knocked offline on a transient failure; api() will
            // re-validate on the next call.
            return
          }

          const user = (await response.json()) as User | Creator
          set({ user, isAuthenticated: true })
        } catch {
          // Ignore — offline or CORS hiccup; keep persisted state.
        }
      },
    }),
    {
      name: 'apapacho-auth',
      // SECURITY: persist ONLY the user profile. Never persist `token`,
      // `tokenExpiry`, or `isAuthenticated` — they live in memory only.
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Derive isAuthenticated from the presence of a persisted user so
        // the shell renders signed-in immediately.
        if (state.user) {
          state.isAuthenticated = true
        }
        state.setHasHydrated(true)
        // Fire-and-forget session verification against the cookie.
        state.rehydrateFromCookie()
      },
    }
  )
)
