/**
 * Factory: useAuthStore mock
 *
 * Provides a controllable stub for @/stores/authStore so tests that render
 * hooks or components depending on auth state don't need a real Zustand store.
 */

import { vi } from 'vitest';

export interface AuthStoreMockOptions {
  isAuthenticated?: boolean;
}

/**
 * Returns a vi.fn()-based mock of the useAuthStore hook.
 * Call vi.mock('@/stores/authStore', () => createAuthStoreMock()) in the test file.
 */
export function createAuthStoreMock(options: AuthStoreMockOptions = {}) {
  const { isAuthenticated = true } = options;

  return {
    useAuthStore: vi.fn(() => ({
      isAuthenticated,
      user: isAuthenticated ? { id: 'test-user-id', email: 'test@example.com' } : null,
      token: isAuthenticated ? 'fake-test-token-12345' : null,
      login: vi.fn(),
      logout: vi.fn(),
    })),
  };
}
