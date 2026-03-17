import { api } from './client'

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
