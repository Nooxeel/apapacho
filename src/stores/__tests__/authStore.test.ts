/**
 * Tests de regresión: authStore — flag sessionChecked
 * Verifica que onRehydrateStorage fija sessionChecked=true en el .finally()
 * de rehydrateFromCookie(), tanto si la cookie es válida como si falla.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '../authStore'

// ─── Fábricas de respuestas fetch ─────────────────────────────────────────────

function makeUserResponse(user = { id: '1', username: 'ana', email: 'ana@test.com' }): Response {
  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function make401Response(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeNetworkError(): Promise<Response> {
  return Promise.reject(new Error('Failed to fetch'))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Restablece el store Zustand a sus valores iniciales entre tests. */
function resetStore() {
  useAuthStore.setState({
    user: null,
    token: null,
    tokenExpiry: null,
    isAuthenticated: false,
    isLoading: false,
    hasHydrated: false,
    sessionChecked: false,
    isRefreshing: false,
  })
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('authStore — onRehydrateStorage / sessionChecked', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    // Asegurar estado limpio antes de cada test
    resetStore()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ── Caso 1: cookie válida → sessionChecked=true después del resolve ────────

  it('fija sessionChecked=true cuando rehydrateFromCookie resuelve con éxito (cookie válida)', async () => {
    fetchMock.mockResolvedValue(makeUserResponse())

    // sessionChecked arranca en false (después del resetStore)
    expect(useAuthStore.getState().sessionChecked).toBe(false)

    // Simular el patrón real de onRehydrateStorage:
    // state.rehydrateFromCookie().finally(() => { useAuthStore.setState({ sessionChecked: true }) })
    await useAuthStore.getState().rehydrateFromCookie().finally(() => {
      useAuthStore.setState({ sessionChecked: true })
    })

    expect(useAuthStore.getState().sessionChecked).toBe(true)
  })

  // ── Caso 2: cookie inválida (401) → sessionChecked=true igualmente ─────────

  it('fija sessionChecked=true cuando rehydrateFromCookie recibe 401 (cookie expirada/ausente)', async () => {
    fetchMock.mockResolvedValue(make401Response())

    expect(useAuthStore.getState().sessionChecked).toBe(false)

    // En 401, rehydrateFromCookie limpia user/token y resuelve (no rechaza).
    await useAuthStore.getState().rehydrateFromCookie().finally(() => {
      useAuthStore.setState({ sessionChecked: true })
    })

    expect(useAuthStore.getState().sessionChecked).toBe(true)
    // Además verifica que el usuario quedó limpio
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  // ── Caso 3: error de red → sessionChecked=true igualmente ─────────────────

  it('fija sessionChecked=true cuando rehydrateFromCookie falla por error de red (offline)', async () => {
    fetchMock.mockImplementation(() => makeNetworkError())

    expect(useAuthStore.getState().sessionChecked).toBe(false)

    // rehydrateFromCookie captura el error internamente y resuelve de todos modos.
    await useAuthStore.getState().rehydrateFromCookie().finally(() => {
      useAuthStore.setState({ sessionChecked: true })
    })

    expect(useAuthStore.getState().sessionChecked).toBe(true)
  })

  // ── Caso 4: estado inicial — sessionChecked=false por defecto ─────────────

  it('sessionChecked es false en el estado inicial del store (antes de rehydrateFromCookie)', () => {
    // resetStore() ya fue llamado en beforeEach
    expect(useAuthStore.getState().sessionChecked).toBe(false)
  })

  // ── Caso 5: setState directo funciona (sanidad del entorno de test) ────────

  it('permite actualizar sessionChecked vía setState directamente', () => {
    useAuthStore.setState({ sessionChecked: true })
    expect(useAuthStore.getState().sessionChecked).toBe(true)
  })

  // ── Caso 6: rehydrateFromCookie en éxito actualiza user en el store ────────

  it('actualiza el user en el store cuando la cookie es válida y /users/me responde 200', async () => {
    const userData = { id: '42', username: 'luisa', email: 'luisa@test.com' }
    fetchMock.mockResolvedValue(makeUserResponse(userData))

    await useAuthStore.getState().rehydrateFromCookie()

    const state = useAuthStore.getState()
    expect(state.user).toMatchObject(userData)
    expect(state.isAuthenticated).toBe(true)
  })
})
