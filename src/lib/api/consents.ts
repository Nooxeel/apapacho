/**
 * Consent management API client (Ley 21.719 — Group 3.3).
 *
 * Used by:
 *  - /settings/privacy page (read state, toggle, opt-in/out profiling)
 *  - CookieConsent component (persist cookie purposes after login)
 */
import { api } from './client'

// Mirror of backend `ConsentPurpose` enum. Keep in sync with
// backend/prisma/schema.prisma:1749.
export type ConsentPurpose =
  | 'SERVICE_EXECUTION'
  | 'MARKETING'
  | 'PROFILING'
  | 'INTERNATIONAL_TRANSFER'
  | 'THIRD_PARTY_TRANSFER'
  | 'SENSITIVE_DATA'
  | 'COOKIES_ANALYTICS'
  | 'COOKIES_PREFERENCES'
  | 'COOKIES_MARKETING'

export interface ConsentState {
  purpose: ConsentPurpose
  granted: boolean
  grantedAt: string | null
  withdrawnAt: string | null
  consentVersionId: string | null
  source: string | null
}

export interface ConsentHistoryEntry {
  id: string
  purpose: ConsentPurpose
  granted: boolean
  grantedAt: string
  withdrawnAt: string | null
  ipAddress: string | null
  source: string | null
  consentVersionId: string | null
}

export interface MyConsentsResponse {
  consents: ConsentState[]
  history: ConsentHistoryEntry[]
}

// ---------------------------------------------------------------------------
// Re-consent (Ola 5A) — surfaced when a ConsentVersion changes after the user
// last accepted. The frontend polls `/users/me/consent-status` once after
// login and pops a blocking modal if any purpose returns `needsReconsent: true`.
// ---------------------------------------------------------------------------

export type ConsentDocType = 'TERMS' | 'PRIVACY' | 'COOKIES'

export interface ConsentStatusEntry {
  purpose: ConsentPurpose
  docType: ConsentDocType
  currentAcceptedVersionId: string | null
  currentAcceptedVersion: string | null
  latestVersionId: string | null
  latestVersion: string | null
  needsReconsent: boolean
}

export interface ConsentStatusResponse {
  entries: ConsentStatusEntry[]
  needsReconsent: boolean
  pendingPurposes: ConsentPurpose[]
}

export interface AcceptLatestResponse {
  ok: true
  acceptedPurposes: ConsentPurpose[]
}

export const consentsApi = {
  /** Read current state per purpose + last 20 transitions. */
  getMyConsents: (token: string) =>
    api<MyConsentsResponse>('/users/me/consents', { token }),

  /** Toggle a single purpose. SERVICE_EXECUTION is rejected by the server. */
  updateConsent: (purpose: ConsentPurpose, granted: boolean, token: string) =>
    api<{ ok: true; purpose: ConsentPurpose; granted: boolean }>(
      '/users/me/consents',
      { method: 'POST', body: { purpose, granted }, token }
    ),

  /** Convenience: opt out of profiling (also flips User.profilingOptedOut). */
  optOutProfiling: (token: string) =>
    api<{ ok: true; profilingOptedOut: true }>('/users/me/profiling/opt-out', {
      method: 'POST',
      token,
    }),

  /** Convenience: opt back in to profiling. */
  optInProfiling: (token: string) =>
    api<{ ok: true; profilingOptedOut: false }>('/users/me/profiling/opt-in', {
      method: 'POST',
      token,
    }),

  /**
   * Compute which purposes need re-consent after a ConsentVersion bump.
   * Returns `needsReconsent: false` when everything is in sync.
   */
  getConsentStatus: (token?: string) =>
    api<ConsentStatusResponse>('/users/me/consent-status', { token }),

  /**
   * Re-accept all pending purposes at once with the latest versions.
   * Preserves the user's previous granted/withdrawn decision per purpose.
   */
  acceptLatest: (token?: string) =>
    api<AcceptLatestResponse>('/users/me/consents/accept-latest', {
      method: 'POST',
      token,
    }),
}
