import { api } from './client'

/**
 * Numeric snapshot of the current user's "digital footprint" — surfaced by the
 * Privacy Dashboard (/settings/privacy/overview).
 *
 * Sourced today from `/users/me/stats` (already deployed). When the backend
 * ships a dedicated `/users/me/privacy-summary` endpoint, switch the
 * `getPrivacySummary` implementation to read from it directly.
 */
export interface PrivacySummaryStats {
  /** Total posts the user has authored (creators only — 0 for fans). */
  totalPosts: number
  /** Total chat messages sent by the user across all conversations. */
  totalMessages: number
  /** Active subscriptions the user holds (consumed creator content). */
  activeSubscriptions: number
  /** Account creation date (ISO string), null when the API does not include it. */
  memberSince: string | null
}

interface UserStatsResponse {
  // /users/me/stats currently returns these — exact shape lives in the backend.
  // We map defensively because the endpoint is shared with other features.
  totalPosts?: number
  totalMessages?: number
  activeSubscriptions?: number
  memberSince?: string
  createdAt?: string
  // Fan-side aliases sometimes used by the dashboard payload.
  subscriptions?: number
  posts?: number
  comments?: number
}

// Users API
export const usersApi = {
  // Search users by username or displayName
  search: (query: string, token: string, limit = 10) =>
    api<{
      users: Array<{
        id: string;
        username: string;
        displayName: string;
        avatar?: string;
        isCreator: boolean;
      }>;
    }>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`, { token }),

  /**
   * Privacy summary used by /settings/privacy/overview. Reads from the existing
   * `/users/me/stats` endpoint and normalises the shape so the UI does not have
   * to deal with backend aliasing. Throws on network/HTTP failure — the caller
   * handles error state.
   */
  getPrivacySummary: async (token?: string): Promise<PrivacySummaryStats> => {
    const raw = await api<UserStatsResponse>('/users/me/stats', { token })
    return {
      totalPosts: raw.totalPosts ?? raw.posts ?? 0,
      totalMessages: raw.totalMessages ?? 0,
      activeSubscriptions: raw.activeSubscriptions ?? raw.subscriptions ?? 0,
      memberSince: raw.memberSince ?? raw.createdAt ?? null,
    }
  },
}

// Block Lists API
export const blockApi = {
  // Block a user
  blockUser: (userId: string, reason: string | undefined, token: string) =>
    api<{ success: boolean; message: string; blocked: any }>(`/creator/block/${userId}`, {
      method: 'POST',
      body: { reason },
      token
    }),

  // Unblock a user
  unblockUser: (userId: string, token: string) =>
    api<{ success: boolean; message: string }>(`/creator/block/${userId}`, {
      method: 'DELETE',
      token
    }),

  // Get blocked users list
  getBlockedUsers: (token: string, page = 1, limit = 20) =>
    api<{
      blockedUsers: Array<{
        id: string;
        user: { id: string; username: string; displayName: string; avatar?: string };
        reason?: string;
        createdAt: string;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/creator/block?page=${page}&limit=${limit}`, { token }),

  // Check if a specific user is blocked
  checkBlocked: (userId: string, token: string) =>
    api<{ isBlocked: boolean; blockedAt?: string; reason?: string }>(`/creator/block/check/${userId}`, { token }),

  // Check if current user is blocked by a creator (for fans)
  amIBlocked: (creatorUsername: string, token: string) =>
    api<{ isBlocked: boolean }>(`/block/am-i-blocked/${creatorUsername}`, { token }),
}

// ====================
// AGE VERIFICATION API
// ====================

export interface AgeVerificationStatus {
  verified: boolean
  verifiedAt: string | null
  hasBirthdate: boolean
}

export interface AgeVerificationResult {
  success: boolean
  verified: boolean
  verifiedAt: string
  message: string
}

export const ageVerificationApi = {
  // Get verification status
  getStatus: (token: string) =>
    api<AgeVerificationStatus>('/age-verification/status', { token }),

  // Verify age with birthdate
  verify: (birthdate: string, token: string) =>
    api<AgeVerificationResult>('/age-verification/verify', {
      method: 'POST',
      body: { birthdate },
      token
    }),

  // Confirm age (for already verified users)
  confirm: (token: string) =>
    api<{ verified: boolean; message: string }>('/age-verification/confirm', {
      method: 'POST',
      token
    }),
}
