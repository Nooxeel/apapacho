/**
 * Tests de regresión: useRequireAuth
 * Cubre la lógica central del guard de sesión introducida en fix/session-first-party-cookie.
 */
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Fábricas de mocks ────────────────────────────────────────────────────────

/** Estado mínimo del authStore que el hook consume. */
function makeAuthState(overrides: {
  hasHydrated?: boolean
  sessionChecked?: boolean
  isAuthenticated?: boolean
  user?: object | null
} = {}) {
  return {
    hasHydrated: true,
    sessionChecked: true,
    isAuthenticated: true,
    user: { id: '1', username: 'ana', displayName: 'Ana', isCreator: false },
    ...overrides,
  }
}

/** Mock mutable del router de Next.js. */
function makeRouter() {
  return { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }
}

// ─── Setup de mocks de módulos ────────────────────────────────────────────────

const mockRouter = makeRouter()

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

// El estado del store se controla por test via mockAuthState.
let mockAuthState = makeAuthState()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthState,
}))

// ─── Importación bajo prueba (después de los mocks) ───────────────────────────
import { useRequireAuth } from '../useRequireAuth'

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('useRequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Estado base: hidratado, cookie verificada, usuario autenticado.
    mockAuthState = makeAuthState()
    mockRouter.push = vi.fn()
  })

  // ── Caso 1: verificación pendiente — hasHydrated=false ───────────────────

  it('devuelve isLoading=true y NO redirige mientras hasHydrated es false', () => {
    mockAuthState = makeAuthState({ hasHydrated: false, sessionChecked: false, isAuthenticated: false })

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.isLoading).toBe(true)
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  // ── Caso 2: verificación pendiente — sessionChecked=false ────────────────

  it('devuelve isLoading=true y NO redirige mientras sessionChecked es false aunque hasHydrated sea true', () => {
    mockAuthState = makeAuthState({ hasHydrated: true, sessionChecked: false, isAuthenticated: false })

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.isLoading).toBe(true)
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('devuelve isLoading=true y NO redirige cuando tanto hasHydrated como sessionChecked son false', () => {
    mockAuthState = makeAuthState({ hasHydrated: false, sessionChecked: false, isAuthenticated: true })

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.isLoading).toBe(true)
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  // ── Caso 3: verificado + no autenticado → redirige ───────────────────────

  it('redirige a /login y mantiene isLoading=true cuando sessionChecked=true e isAuthenticated=false', async () => {
    mockAuthState = makeAuthState({ sessionChecked: true, isAuthenticated: false, user: null })

    const { result } = renderHook(() => useRequireAuth())

    // isLoading=true mientras la redirección está en vuelo
    expect(result.current.isLoading).toBe(true)
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
    expect(mockRouter.push).toHaveBeenCalledTimes(1)
  })

  it('redirige a la ruta personalizada cuando se pasa redirectTo', () => {
    mockAuthState = makeAuthState({ sessionChecked: true, isAuthenticated: false, user: null })

    renderHook(() => useRequireAuth({ redirectTo: '/login?redirect=/dashboard' }))

    expect(mockRouter.push).toHaveBeenCalledWith('/login?redirect=/dashboard')
  })

  // ── Caso 4: verificado + autenticado → sin redirección, isLoading=false ──

  it('devuelve isLoading=false y NO redirige cuando sessionChecked=true e isAuthenticated=true', () => {
    mockAuthState = makeAuthState({ sessionChecked: true, isAuthenticated: true })

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.isLoading).toBe(false)
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  // ── Caso 5: requireCreator=true, usuario NO es creador → redirige ─────────

  it('redirige a /login cuando requireCreator=true y el usuario no es creador', () => {
    mockAuthState = makeAuthState({
      sessionChecked: true,
      isAuthenticated: true,
      user: { id: '1', username: 'ana', displayName: 'Ana', isCreator: false },
    })

    const { result } = renderHook(() => useRequireAuth({ requireCreator: true }))

    expect(result.current.isLoading).toBe(true)
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  it('mantiene isLoading=true mientras se redirige a /login por requireCreator no cumplido', () => {
    mockAuthState = makeAuthState({
      sessionChecked: true,
      isAuthenticated: true,
      user: { id: '1', username: 'ana', displayName: 'Ana', isCreator: false },
    })

    const { result } = renderHook(() => useRequireAuth({ requireCreator: true }))

    expect(result.current.isLoading).toBe(true)
  })

  // ── Caso 6: requireCreator=true, usuario ES creador → sin redirección ─────

  it('devuelve isLoading=false y NO redirige cuando requireCreator=true y el usuario es creador', () => {
    mockAuthState = makeAuthState({
      sessionChecked: true,
      isAuthenticated: true,
      user: { id: '2', username: 'crea', displayName: 'Crea', isCreator: true },
    })

    const { result } = renderHook(() => useRequireAuth({ requireCreator: true }))

    expect(result.current.isLoading).toBe(false)
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  // ── Caso 7: valor por defecto de redirectTo ───────────────────────────────

  it('usa /login como redirectTo por defecto cuando no se pasa la opción', () => {
    mockAuthState = makeAuthState({ sessionChecked: true, isAuthenticated: false, user: null })

    renderHook(() => useRequireAuth())

    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  // ── Caso 8: requireCreator=false no redirige si el usuario no es creador ──

  it('NO redirige por rol cuando requireCreator no se especifica (default false)', () => {
    mockAuthState = makeAuthState({
      sessionChecked: true,
      isAuthenticated: true,
      user: { id: '1', username: 'fan', displayName: 'Fan', isCreator: false },
    })

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.isLoading).toBe(false)
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
})
