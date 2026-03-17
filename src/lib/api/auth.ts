import { api } from './client'

// Auth API
export const authApi = {
  register: (data: {
    email: string
    username: string
    password: string
    displayName: string
    isCreator?: boolean
    referralCode?: string
  }) => api('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    api<{ user: any; token: string }>('/auth/login', { method: 'POST', body: data }),

  googleLogin: (data: { credential: string; isCreator?: boolean; referralCode?: string }) =>
    api<{ user: any; token: string; isNewUser: boolean }>('/auth/google', { method: 'POST', body: data }),

  getMe: (token: string) => api('/auth/me', { token }),
}
