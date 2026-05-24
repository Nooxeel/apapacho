/**
 * Active Sessions API client — Ley 21.719 Ola 5B.
 *
 * Permite al titular ver y revocar las sesiones de su cuenta desde
 * /settings/security. Todos los endpoints requieren autenticación: las
 * cookies httpOnly viajan automáticamente vía `credentials: 'include'` que
 * configura el wrapper `api`.
 */

import { api } from './client'

export interface ActiveSession {
  id: string
  deviceLabel: string
  ipAddress: string | null
  createdAt: string
  lastUsedAt: string
  isCurrent: boolean
}

export interface ListSessionsResponse {
  sessions: ActiveSession[]
}

export const sessionsApi = {
  /** GET /users/me/sessions */
  list: () => api<ListSessionsResponse>('/users/me/sessions'),

  /** DELETE /users/me/sessions/:id */
  terminate: (sessionId: string) =>
    api<{ revoked: true }>(`/users/me/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    }),

  /** DELETE /users/me/sessions — revoke all OTHER sessions, keep the current one */
  terminateAllOthers: () =>
    api<{ revokedCount: number }>('/users/me/sessions', {
      method: 'DELETE',
    }),
}
