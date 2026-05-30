import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface RequireAuthOptions {
  /**
   * Path to redirect unauthenticated users to.
   * Defaults to '/login'.
   */
  redirectTo?: string
  /**
   * When true, also require the user to be a creator. Redirects to
   * '/login' if the user is authenticated but not a creator.
   */
  requireCreator?: boolean
}

interface RequireAuthResult {
  /**
   * True while waiting for localStorage hydration or cookie verification.
   * Render a loading/skeleton state while this is true.
   */
  isLoading: boolean
}

/**
 * Protege rutas autenticadas. Espera a que:
 *   1. El store de Zustand se hidrate desde localStorage (hasHydrated).
 *   2. La cookie de sesión sea verificada contra el backend (sessionChecked).
 *
 * Solo después de ambas condiciones decide si el usuario está autenticado.
 * Esto evita el redirect espurio a /login durante la ventana entre
 * "token en memoria es null" y "cookie válida confirmada por el servidor".
 *
 * SEGURIDAD: usuarios sin sesión válida SÍ son redirigidos una vez que
 * sessionChecked === true e isAuthenticated === false.
 */
export function useRequireAuth(options: RequireAuthOptions = {}): RequireAuthResult {
  const { redirectTo = '/login', requireCreator = false } = options
  const router = useRouter()
  const { hasHydrated, sessionChecked, isAuthenticated, user } = useAuthStore()

  const verificationPending = !hasHydrated || !sessionChecked

  useEffect(() => {
    if (verificationPending) return

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requireCreator && !(user as any)?.isCreator) {
      router.push('/login')
    }
  }, [verificationPending, isAuthenticated, user, router, redirectTo, requireCreator])

  // Show loading while verifying, and while the redirect is in flight
  // (to prevent a brief flash of protected content or an empty state).
  const isNotCreatorWhenRequired = requireCreator && !(user as any)?.isCreator
  const isRedirecting =
    !verificationPending && (!isAuthenticated || isNotCreatorWhenRequired)
  return { isLoading: verificationPending || isRedirecting }
}
