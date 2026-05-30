/**
 * Tests de guarda de páginas — migración a useRequireAuth (fix/session-first-party-cookie)
 *
 * Verifica que las páginas protegidas:
 *  1. Muestran un estado de carga mientras useRequireAuth devuelve isLoading=true.
 *  2. NO renderizan contenido protegido durante esa ventana.
 *
 * Se cubren 3 páginas de la migración:
 *  - /dashboard      (usuario normal protegido)
 *  - /settings       (usuario normal protegido)
 *  - /creator/earnings (requireCreator: true)
 */
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Fábricas de estado ────────────────────────────────────────────────────────

function makeAuthStoreState(overrides: {
  user?: object | null
  token?: string | null
  isAuthenticated?: boolean
} = {}) {
  return {
    user: { id: '1', username: 'ana', displayName: 'Ana', email: 'ana@test.com', isCreator: false },
    token: 'fake-token-12345',
    isAuthenticated: true,
    logout: vi.fn(),
    updateUser: vi.fn(),
    hasHydrated: true,
    sessionChecked: true,
    ...overrides,
  }
}

// ─── Mocks de módulos comunes ─────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/dynamic', () => ({
  default: (_loader: () => Promise<any>, _opts?: any) => {
    const Stub = () => null
    return Stub
  },
}))

vi.mock('@/components/layout/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

vi.mock('@/components/layout', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

vi.mock('@/components/ui/KycBanner', () => ({
  KycBanner: () => null,
}))

vi.mock('@/components/ui/Dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
}))

vi.mock('@/components/gamification', () => ({
  StreakDisplay: () => null,
  LevelDisplay: () => null,
  LevelBadge: () => null,
  AvatarWithProgress: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  BadgesDisplay: () => null,
  MissionsDisplay: () => null,
  Leaderboard: () => null,
}))

vi.mock('@/components/cards/SavedCardsList', () => ({
  default: () => null,
}))

vi.mock('@/lib/api', () => ({
  default: vi.fn().mockResolvedValue({}),
  api: vi.fn().mockResolvedValue({}),
  ApiError: class ApiError extends Error {
    statusCode?: number
    constructor(msg: string, statusCode?: number) {
      super(msg)
      this.name = 'ApiError'
      this.statusCode = statusCode
    }
  },
  uploadApi: { avatar: vi.fn().mockResolvedValue({ url: '/avatar.jpg' }) },
  subscriptionsApi: { unsubscribe: vi.fn().mockResolvedValue({}) },
  gamificationApi: { getMyLevel: vi.fn().mockResolvedValue(null) },
  creatorEarningsApi: {
    getBalance: vi.fn().mockResolvedValue({ balance: {}, config: {}, tier: 'STANDARD' }),
    getTransactionStats: vi.fn().mockResolvedValue({}),
    getTransactions: vi.fn().mockResolvedValue([]),
    getPayouts: vi.fn().mockResolvedValue([]),
    getPayoutEligibility: vi.fn().mockResolvedValue({ canCreatePayout: false, totals: {} }),
    getDonations: vi.fn().mockResolvedValue({ donations: [] }),
    getSubscribers: vi.fn().mockResolvedValue({ subscribers: [] }),
  },
}))

vi.mock('@/lib/config', () => ({
  API_URL: 'http://localhost:3001/api',
}))

vi.mock('@/lib/sanitize', () => ({
  sanitizeText: (t: string) => t,
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

// ─── El mock clave: useRequireAuth — controla el estado de carga ───────────────
// Se declara como let + factory para poder cambiar isLoading por test.

let mockIsLoading = true

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({ isLoading: mockIsLoading }),
}))

// El authStore es necesario para que las páginas no exploten antes de llegar al guard.
// Cuando isLoading=true el usuario SÍ está disponible en el store — la guarda SOLO
// depende del hook para mostrar el spinner, no de la ausencia de user.
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => makeAuthStoreState(),
}))

// ─── Suite: dashboard/page ─────────────────────────────────────────────────────

describe('Página /dashboard — guarda de sesión con useRequireAuth', () => {
  beforeEach(() => {
    mockIsLoading = true
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )
  })

  it('muestra estado de carga (spinner) mientras useRequireAuth devuelve isLoading=true', async () => {
    mockIsLoading = true
    const { default: DashboardPage } = await import('../page')
    const { container } = render(<DashboardPage />)

    // La página tiene: if (authLoading || !user) → spinner con clase animate-spin
    // Cuando authLoading=true el componente retorna anticipadamente con el spinner.
    const spinners = container.querySelectorAll('[class*="animate-spin"]')
    expect(spinners.length).toBeGreaterThan(0)
  })

  it('NO muestra el header del perfil de usuario mientras isLoading=true', async () => {
    mockIsLoading = true
    const { default: DashboardPage } = await import('../page')
    render(<DashboardPage />)

    // "Cerrar sesión" sólo aparece en el header del dashboard (contenido post-autenticación)
    expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument()
  })
})

// ─── Suite: settings/page ─────────────────────────────────────────────────────

describe('Página /settings — guarda de sesión con useRequireAuth', () => {
  beforeEach(() => {
    mockIsLoading = true
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )
  })

  it('muestra estado de carga (spinner) mientras useRequireAuth devuelve isLoading=true', async () => {
    mockIsLoading = true
    const { default: SettingsPage } = await import('../../settings/page')
    const { container } = render(<SettingsPage />)

    // La página settings renderiza Loader2 (animate-spin) mientras authLoading=true
    const spinners = container.querySelectorAll('[class*="animate-spin"]')
    expect(spinners.length).toBeGreaterThan(0)
  })

  it('NO muestra las opciones de configuración mientras isLoading=true', async () => {
    mockIsLoading = true
    const { default: SettingsPage } = await import('../../settings/page')
    render(<SettingsPage />)

    // "Métodos de Pago" es contenido protegido que sólo aparece después de auth
    expect(screen.queryByText('Métodos de Pago')).not.toBeInTheDocument()
  })
})

// ─── Suite: creator/earnings/page ─────────────────────────────────────────────

describe('Página /creator/earnings — guarda de sesión con useRequireAuth (requireCreator:true)', () => {
  beforeEach(() => {
    mockIsLoading = true
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )
  })

  it('muestra estado de carga (spinner) mientras useRequireAuth devuelve isLoading=true', async () => {
    mockIsLoading = true
    const { default: CreatorEarningsPage } = await import('../../creator/earnings/page')
    const { container } = render(<CreatorEarningsPage />)

    const spinners = container.querySelectorAll('[class*="animate-spin"]')
    expect(spinners.length).toBeGreaterThan(0)
  })

  it('NO muestra el contenido de ganancias mientras isLoading=true', async () => {
    mockIsLoading = true
    const { default: CreatorEarningsPage } = await import('../../creator/earnings/page')
    render(<CreatorEarningsPage />)

    // Estos textos sólo aparecen cuando la página está completamente cargada
    expect(screen.queryByText('Balance disponible')).not.toBeInTheDocument()
    expect(screen.queryByText('Solicitar pago')).not.toBeInTheDocument()
  })
})
