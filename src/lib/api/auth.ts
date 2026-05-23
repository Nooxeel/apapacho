import { api } from './client'

/**
 * Granular consents captured at signup (Ley 21.719 — Group 3.3).
 * `service` is the only mandatory finality (T&C + Privacy Policy + 18+).
 * The other three are independent opt-ins.
 */
export interface SignupConsents {
  service: true
  marketing?: boolean
  profiling?: boolean
  internationalTransfer?: boolean
}

/**
 * Login response shape. When the user has MFA enabled the backend returns
 * `requiresMfa: true` + a short-lived challenge token instead of the normal
 * `{ user, token }`. The frontend then prompts for a TOTP / recovery code
 * and exchanges them via `mfaApi.verifyOnLogin` (see ./mfa.ts).
 */
export type LoginResponse =
  | { user: any; token: string; expiresIn?: number; requiresMfa?: false }
  | { requiresMfa: true; challengeToken: string }

// Auth API
export const authApi = {
  register: (data: {
    email: string
    username: string
    password: string
    displayName: string
    isCreator?: boolean
    referralCode?: string
    consents?: SignupConsents
  }) => api('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    api<LoginResponse>('/auth/login', { method: 'POST', body: data }),

  googleLogin: (data: {
    credential: string
    isCreator?: boolean
    referralCode?: string
    consents?: SignupConsents
  }) =>
    api<{ user: any; token: string; isNewUser: boolean }>('/auth/google', { method: 'POST', body: data }),

  getMe: (token: string) => api('/auth/me', { token }),
}
