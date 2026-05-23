/**
 * MFA (TOTP) API client — Ley 21.719 Ola 4 P1.1.
 *
 * Las cookies httpOnly del backend ya transportan la sesión, así que cada
 * request usa `credentials: 'include'` via el wrapper `api`. Solo
 * `mfaVerifyOnLogin` envía el challenge token + código y no requiere sesión.
 */

import { api } from './client'

export interface MfaStatus {
  enabled: boolean
  enabledAt: string | null
  recoveryCodesRemaining: number
}

export interface MfaSetupResult {
  secret: string
  otpAuthUrl: string
  qrCodeDataUrl: string
}

export interface MfaEnableResult {
  enabled: true
  recoveryCodes: string[]
}

export interface MfaVerifyLoginResult {
  user: {
    id: string
    email: string
    username: string
    displayName: string
    avatar?: string | null
    isCreator?: boolean
    creatorProfile?: any
  }
  token: string
  expiresIn?: number
  usedRecoveryCode?: boolean
}

export const mfaApi = {
  getStatus: () => api<MfaStatus>('/mfa/status'),

  setup: () => api<MfaSetupResult>('/mfa/setup', { method: 'POST' }),

  enable: (secret: string, totpCode: string) =>
    api<MfaEnableResult>('/mfa/enable', {
      method: 'POST',
      body: { secret, totpCode },
    }),

  disable: (password: string) =>
    api<{ disabled: true }>('/mfa/disable', {
      method: 'POST',
      body: { password },
    }),

  regenerateRecoveryCodes: (password: string, totpCode: string) =>
    api<{ recoveryCodes: string[] }>('/mfa/regenerate-recovery-codes', {
      method: 'POST',
      body: { password, totpCode },
    }),

  /**
   * Exchange a challenge token + MFA code for full auth cookies.
   * Called after /auth/login returns { requiresMfa: true, challengeToken }.
   */
  verifyOnLogin: (challengeToken: string, code: string) =>
    api<MfaVerifyLoginResult>('/auth/mfa/verify', {
      method: 'POST',
      body: { challengeToken, code },
    }),
}
