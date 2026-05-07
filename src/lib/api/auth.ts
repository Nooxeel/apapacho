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
    api<{ user: any; token: string }>('/auth/login', { method: 'POST', body: data }),

  googleLogin: (data: {
    credential: string
    isCreator?: boolean
    referralCode?: string
    consents?: SignupConsents
  }) =>
    api<{ user: any; token: string; isNewUser: boolean }>('/auth/google', { method: 'POST', body: data }),

  getMe: (token: string) => api('/auth/me', { token }),
}
