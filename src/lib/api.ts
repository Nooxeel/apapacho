const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  token?: string
  signal?: AbortSignal
  skipRefresh?: boolean // Skip auto-refresh on 401 (to prevent loops)
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public method?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Helper to refresh token
async function tryRefreshToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.token
    }
  } catch {
    // Refresh failed
  }
  return null
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token, signal, skipRefresh = false } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials: 'include', // Send httpOnly cookies for authentication
    })

    // If 401 and not skipping refresh, try to refresh token and retry
    if (response.status === 401 && !skipRefresh && token) {
      const newToken = await tryRefreshToken()
      if (newToken) {
        // Retry with new token
        return api<T>(endpoint, { ...options, token: newToken, skipRefresh: true })
      }
    }

    if (!response.ok) {
      let errorMessage = 'API request failed'
      let errorDetails = undefined

      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
          errorDetails = errorData.details
        } else {
          errorMessage = await response.text() || errorMessage
        }
      } catch {
        // If parsing error response fails, use generic message
      }

      throw new ApiError(errorMessage, response.status, endpoint, method, errorDetails)
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request cancelled', undefined, endpoint, method)
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new ApiError('Network error. Please check your connection.', undefined, endpoint, method)
      }

      throw new ApiError(error.message, undefined, endpoint, method)
    }

    throw new ApiError('An unexpected error occurred', undefined, endpoint, method)
  }
}

// File upload helper
async function uploadFile(
  endpoint: string,
  file: File,
  fieldName: string,
  token: string,
  signal?: AbortSignal
) {
  const formData = new FormData()
  formData.append(fieldName, file)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      signal,
    })

    if (!response.ok) {
      let errorMessage = 'Upload failed'

      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        }
      } catch {
        // If parsing error response fails, use generic message
      }

      throw new ApiError(errorMessage, response.status, endpoint, 'POST')
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Upload cancelled', undefined, endpoint, 'POST')
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new ApiError('Network error during upload. Please check your connection.', undefined, endpoint, 'POST')
      }

      throw new ApiError(error.message, undefined, endpoint, 'POST')
    }

    throw new ApiError('Upload failed unexpectedly', undefined, endpoint, 'POST')
  }
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
  }) => api('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    api<{ user: any; token: string }>('/auth/login', { method: 'POST', body: data }),

  getMe: (token: string) => api('/auth/me', { token }),
}

// Creator API
export const creatorApi = {
  getByUsername: (username: string) => api(`/creators/username/${username}`),

  getById: (id: string) => api(`/creators/${id}`),

  getAll: (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.offset) query.set('offset', params.offset.toString())
    return api(`/creators?${query}`)
  },

  updateProfile: (
    data: {
      bio?: string
      backgroundColor?: string
      backgroundGradient?: string
      backgroundImage?: string
      accentColor?: string
      textColor?: string
      fontFamily?: string
      coverImage?: string
    },
    token: string
  ) => api('/creators/profile', { method: 'PUT', body: data, token }),

  addMusicTrack: (
    data: {
      youtubeUrl: string
      youtubeId: string
      title: string
      artist?: string
      thumbnail: string
    },
    token: string
  ) => api('/creators/music', { method: 'POST', body: data, token }),

  deleteMusicTrack: (trackId: string, token: string) =>
    api(`/creators/music/${trackId}`, { method: 'DELETE', token }),

  getStats: (creatorId: string) =>
    api(`/creators/${creatorId}/stats`, {}),
}

// Message API
export const messageApi = {
  getConversations: (token: string) => api('/messages/conversations', { token }),

  createConversation: (recipientId: string, token: string) =>
    api('/messages/conversations', { method: 'POST', body: { recipientId }, token }),

  getMessages: (conversationId: string, token: string, cursor?: string) => {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
    return api(`/messages/conversations/${conversationId}/messages${query}`, { token })
  },

  sendMessage: (
    conversationId: string,
    data: { content: string; type?: string; price?: number },
    token: string
  ) => api(`/messages/conversations/${conversationId}/messages`, { method: 'POST', body: data, token }),

  getUnreadCount: (token: string) => api('/messages/unread-count', { token }),

  deleteMessage: (messageId: string, token: string) =>
    api(`/messages/messages/${messageId}`, { method: 'DELETE', token }),

  updateConversationStatus: (conversationId: string, status: string, token: string) =>
    api(`/messages/conversations/${conversationId}/status`, { method: 'PATCH', body: { status }, token }),
}

// Post API
export const postApi = {
  // Likes
  toggleLike: (postId: string, token: string) =>
    api(`/posts/${postId}/like`, { method: 'POST', token }),

  getLikeStatus: (postId: string, token: string) =>
    api(`/posts/${postId}/like-status`, { token }),

  // Batch like status (fixes N+1 query problem)
  getBatchLikeStatus: (postIds: string[], token: string) =>
    api(`/posts/like-status/batch?postIds=${postIds.join(',')}`, { token }),

  // Comments
  getComments: (postId: string, limit = 50, offset = 0) =>
    api(`/posts/${postId}/comments?limit=${limit}&offset=${offset}`, {}),

  createComment: (postId: string, content: string, token: string) =>
    api(`/posts/${postId}/comments`, { method: 'POST', body: { content }, token }),

  deleteComment: (commentId: string, token: string) =>
    api(`/posts/comments/${commentId}`, { method: 'DELETE', token }),
}

// Upload API
export const uploadApi = {
  avatar: (file: File, token: string) => uploadFile('/upload/avatar', file, 'avatar', token),

  profile: (file: File, token: string) => uploadFile('/upload/profile', file, 'profileImage', token),

  cover: (file: File, token: string) => uploadFile('/upload/cover', file, 'coverImage', token),

  // Note: userCover removed - fans should only be able to upload avatar, not cover

  content: async (files: File[], token: string, signal?: AbortSignal) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    try {
      const response = await fetch(`${API_URL}/upload/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal,
      })

      if (!response.ok) {
        let errorMessage = 'Upload failed'

        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
          }
        } catch {
          // If parsing error response fails, use generic message
        }

        throw new ApiError(errorMessage, response.status, '/upload/content', 'POST')
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Upload cancelled', undefined, '/upload/content', 'POST')
        }

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new ApiError('Network error during upload. Please check your connection.', undefined, '/upload/content', 'POST')
        }

        throw new ApiError(error.message, undefined, '/upload/content', 'POST')
      }

      throw new ApiError('Upload failed unexpectedly', undefined, '/upload/content', 'POST')
    }
  },
}

// Interests API
export const interestsApi = {
  // Get all available interests (optionally filtered)
  getAll: (params?: { category?: string; search?: string }) =>
    api<any[]>(`/interests${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`),

  // Get interests grouped by category
  getByCategory: () => api<Record<string, any[]>>('/interests/by-category'),

  // User interests
  getMyInterests: (token: string) => api<any[]>('/interests/me', { token }),

  addMyInterests: (interestIds: string[], token: string) =>
    api<any[]>('/interests/me', { method: 'POST', body: { interestIds }, token }),

  removeMyInterest: (interestId: string, token: string) =>
    api<{ success: boolean }>(`/interests/me/${interestId}`, { method: 'DELETE', token }),

  // Creator interests
  getCreatorInterests: (username: string) =>
    api<any[]>(`/interests/creator/${username}`),

  getMyCreatorInterests: (token: string) =>
    api<any[]>('/interests/creator/me', { token }),

  addMyCreatorInterests: (interestIds: string[], token: string) =>
    api<any[]>('/interests/creator/me', { method: 'POST', body: { interestIds }, token }),

  removeMyCreatorInterest: (interestId: string, token: string) =>
    api<{ success: boolean }>(`/interests/creator/me/${interestId}`, { method: 'DELETE', token }),
}

// Discovery API
export const discoverApi = {
  // Discover creators by interests
  discoverCreators: (params?: { interestIds?: string; limit?: number; offset?: number }) =>
    api<any[]>(`/discover/creators${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`),

  // Get personalized recommendations (requires auth)
  getRecommended: (token: string, params?: { limit?: number; offset?: number }) =>
    api<any[]>(`/discover/recommended${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`, { token }),

  // Search creators by interests and keywords
  search: (params?: { query?: string; interestIds?: string; limit?: number; offset?: number }) =>
    api<any[]>(`/discover/search${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`),
}

// Social Links API
export const socialLinksApi = {
  // Get public social links for a creator
  getByUsername: (username: string) =>
    api<any[]>(`/sociallinks/${username}`),

  // Get all social links for authenticated creator
  getMySocialLinks: (token: string) =>
    api<any[]>('/sociallinks/me/all', { token }),

  // Get available platforms
  getPlatforms: () =>
    api<any[]>('/sociallinks/platforms/list'),

  // Create new social link
  create: (data: { platform: string; url: string; label?: string; icon?: string }, token: string) =>
    api<any>('/sociallinks', { method: 'POST', body: data, token }),

  // Update social link
  update: (id: string, data: { platform?: string; url?: string; label?: string; icon?: string; isVisible?: boolean }, token: string) =>
    api<any>(`/sociallinks/${id}`, { method: 'PUT', body: data, token }),

  // Reorder social links
  reorder: (linkIds: string[], token: string) =>
    api<any[]>('/sociallinks/reorder/batch', { method: 'PUT', body: { linkIds }, token }),

  // Delete social link
  delete: (id: string, token: string) =>
    api<{ message: string }>(`/sociallinks/${id}`, { method: 'DELETE', token }),
}

// Subscriptions API
export const subscriptionsApi = {
  // Get tiers for a creator (public)
  getTiers: (creatorId: string) =>
    api<any[]>(`/subscriptions/tiers/${creatorId}`),

  // Get my tiers as creator
  getMyTiers: (token: string) =>
    api<any[]>('/subscriptions/my-tiers', { token }),

  // Create tier
  createTier: (data: { name: string; description?: string; price: number; currency?: string; durationDays?: number; benefits?: string }, token: string) =>
    api<any>('/subscriptions/tiers', { method: 'POST', body: data, token }),

  // Update tier
  updateTier: (tierId: string, data: { name?: string; description?: string; price?: number; currency?: string; durationDays?: number; benefits?: string; isActive?: boolean }, token: string) =>
    api<any>(`/subscriptions/tiers/${tierId}`, { method: 'PUT', body: data, token }),

  // Delete tier
  deleteTier: (tierId: string, token: string) =>
    api<{ message: string }>(`/subscriptions/tiers/${tierId}`, { method: 'DELETE', token }),

  // Check if user is subscribed to a creator
  checkSubscription: (creatorId: string, token: string) =>
    api<{ isSubscribed: boolean; subscription: any | null }>(`/subscriptions/check/${creatorId}`, { token }),

  // Subscribe to a creator
  subscribe: (creatorId: string, tierId: string, token: string) =>
    api<{ message: string; subscription: any }>('/subscriptions/subscribe', { method: 'POST', body: { creatorId, tierId }, token }),

  // Unsubscribe from a creator
  unsubscribe: (creatorId: string, token: string) =>
    api<{ message: string }>(`/subscriptions/unsubscribe/${creatorId}`, { method: 'POST', token }),

  // Get my subscriptions as fan
  getMySubscriptions: (token: string) =>
    api<any[]>('/subscriptions/my-subscriptions', { token }),

  // Get my subscribers as creator
  getMySubscribers: (token: string) =>
    api<any[]>('/subscriptions/subscribers', { token }),
}

// Creator Earnings API - Balance, Transactions, Payouts
export const creatorEarningsApi = {
  // Get creator balance (total, available, pending, paid)
  getBalance: (token: string) =>
    api<{
      balance: { total: string; available: string; pending: string; paid: string };
      config: { holdDays: number; minPayout: string; payoutFrequency: string };
      tier: string;
      tierEffectiveFrom: string;
    }>('/creator/balance', { token }),

  // Get transactions received
  getTransactions: (token: string, params?: { limit?: number; offset?: number; status?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.offset) query.set('offset', params.offset.toString())
    if (params?.status) query.set('status', params.status)
    return api<any[]>(`/creator/transactions?${query}`, { token })
  },

  // Get transaction statistics by type
  getTransactionStats: (token: string) =>
    api<{
      totalTransactions: number;
      totalGross: string;
      totalFees: string;
      totalPayable: string;
      byType: { type: string; count: number; total: string }[];
    }>('/creator/transactions/stats', { token }),

  // Get payout history
  getPayouts: (token: string) =>
    api<any[]>('/creator/payouts', { token }),

  // Get fee and tier info
  getFeeInfo: (token: string) =>
    api<{
      tier: string;
      tierEffectiveFrom: string;
      currentFeeBps: number;
      currentFeePercent: string;
      feeSchedule: any;
      tierHistory: any[];
    }>('/creator/fee-info', { token }),

  // Check payout eligibility
  getPayoutEligibility: (token: string) =>
    api<{
      canCreatePayout: boolean;
      reason: string;
      totals: { grossTotal: string; platformFeeTotal: string; creatorPayableTotal: string };
      eligibleTransactionsCount: number;
      pendingHoldCount: number;
    }>('/payouts/eligibility', { token }),

  // Request payout
  requestPayout: (token: string) =>
    api<{ message: string; payout: any }>('/payouts/request', { method: 'POST', token }),

  // Get payout history with pagination
  getPayoutHistory: (token: string, page = 1, limit = 10) =>
    api<{ payouts: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/payouts/history?page=${page}&limit=${limit}`, { token }
    ),

  // Get payout detail
  getPayoutDetail: (id: string, token: string) =>
    api<any>(`/payouts/${id}`, { token }),

  // Get donations received
  getDonations: (token: string, params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.offset) query.set('offset', params.offset.toString())
    return api<{
      donations: any[];
      pagination: { total: number; limit: number; offset: number };
    }>(`/creator/donations?${query}`, { token })
  },

  // Get subscribers with details
  getSubscribers: (token: string, params?: { limit?: number; offset?: number; status?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.offset) query.set('offset', params.offset.toString())
    if (params?.status) query.set('status', params.status)
    return api<{
      subscribers: any[];
      pagination: { total: number; limit: number; offset: number };
    }>(`/creator/subscribers?${query}`, { token })
  },
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

// Promocodes API
export const promocodesApi = {
  // Create a new promocode (creator)
  create: (data: {
    code?: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL';
    value: number;
    currency?: string;
    maxUses?: number;
    maxUsesPerUser?: number;
    minPurchase?: number;
    applicableTiers?: string[];
    startsAt?: string;
    expiresAt?: string;
  }, token: string) =>
    api<{ success: boolean; promocode: any }>('/promocodes', {
      method: 'POST',
      body: data,
      token
    }),

  // Get creator's promocodes
  list: (token: string, page = 1, limit = 20, status?: 'active' | 'expired' | 'all') => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (status) params.set('status', status)
    return api<{
      promocodes: Array<{
        id: string;
        code: string;
        type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL';
        value: number;
        currency: string;
        maxUses: number | null;
        currentUses: number;
        maxUsesPerUser: number;
        minPurchase: number | null;
        applicableTiers: string[];
        startsAt: string;
        expiresAt: string | null;
        isActive: boolean;
        createdAt: string;
        totalRedemptions: number;
        isExpired: boolean;
        isMaxedOut: boolean;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/promocodes?${params}`, { token })
  },

  // Get promocode detail with stats
  getDetail: (id: string, token: string) =>
    api<any>(`/promocodes/${id}`, { token }),

  // Update promocode
  update: (id: string, data: {
    maxUses?: number | null;
    expiresAt?: string | null;
    isActive?: boolean;
    applicableTiers?: string[];
  }, token: string) =>
    api<{ success: boolean; promocode: any }>(`/promocodes/${id}`, {
      method: 'PUT',
      body: data,
      token
    }),

  // Delete/deactivate promocode
  delete: (id: string, token: string) =>
    api<{ success: boolean; message: string }>(`/promocodes/${id}`, {
      method: 'DELETE',
      token
    }),

  // Validate a code (for fans during checkout)
  validate: (code: string, creatorId: string, tierId?: string, amount?: number, token?: string) =>
    api<{
      valid: boolean;
      error?: string;
      promocode?: {
        id: string;
        code: string;
        type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL';
        value: number;
        description: string;
      };
      discount?: {
        originalAmount: number;
        discountAmount: number;
        finalAmount: number;
      };
    }>('/promocodes/validate', {
      method: 'POST',
      body: { code, creatorId, tierId, amount },
      token
    }),

  // Redeem promocode (internal, called during subscription)
  redeem: (data: {
    promocodeId: string;
    subscriptionId?: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
  }, token: string) =>
    api<{ success: boolean; redemption: any }>('/promocodes/redeem', {
      method: 'POST',
      body: data,
      token
    }),
}

// Broadcasts / Mass DM API
export type BroadcastTarget = 'ALL_SUBSCRIBERS' | 'SPECIFIC_TIERS' | 'NEW_SUBSCRIBERS' | 'EXPIRING_SOON'
export type BroadcastStatus = 'PENDING' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface Broadcast {
  id: string
  creatorId: string
  content: string
  mediaUrl?: string
  mediaType?: string
  targetType: BroadcastTarget
  targetTierIds: string[]
  status: BroadcastStatus
  totalRecipients: number
  sentCount: number
  failedCount: number
  scheduledFor?: string
  sentAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export const broadcastsApi = {
  // Create and send a broadcast
  create: (data: {
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    targetType?: BroadcastTarget;
    targetTierIds?: string[];
    scheduledFor?: string;
  }, token: string) =>
    api<{ success: boolean; broadcast: Broadcast }>('/broadcasts', {
      method: 'POST',
      body: data,
      token
    }),

  // List broadcasts
  list: (token: string, page = 1, limit = 20) =>
    api<{
      broadcasts: Broadcast[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/broadcasts?page=${page}&limit=${limit}`, { token }),

  // Get broadcast detail
  getDetail: (id: string, token: string) =>
    api<Broadcast & { recipients: any[]; _count: { recipients: number } }>(`/broadcasts/${id}`, { token }),

  // Cancel scheduled broadcast
  cancel: (id: string, token: string) =>
    api<{ success: boolean; message: string }>(`/broadcasts/${id}`, {
      method: 'DELETE',
      token
    }),

  // Get stats
  getStats: (token: string) =>
    api<{
      totalBroadcasts: number;
      totalMessagesSent: number;
      scheduledBroadcasts: number;
      recentBroadcasts: Array<{
        id: string;
        content: string;
        status: BroadcastStatus;
        sentCount: number;
        totalRecipients: number;
        createdAt: string;
      }>;
    }>('/broadcasts/stats/summary', { token }),

  // Get subscriber count for targeting
  getSubscriberCount: (targetType: BroadcastTarget, tierIds: string[] | undefined, token: string) => {
    const params = new URLSearchParams({ targetType })
    if (tierIds?.length) params.set('tierIds', tierIds.join(','))
    return api<{ count: number }>(`/broadcasts/subscribers/count?${params}`, { token })
  },
}

// Watermark API
export interface WatermarkSettings {
  enabled: boolean
  text: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  opacity: number
  size: 'small' | 'medium' | 'large'
}

export const watermarkApi = {
  // Get watermark settings
  getSettings: (token: string) =>
    api<{ settings: WatermarkSettings }>('/watermark/settings', { token }),

  // Update watermark settings
  updateSettings: (settings: Partial<WatermarkSettings>, token: string) =>
    api<{ success: boolean; settings: WatermarkSettings }>('/watermark/settings', {
      method: 'PUT',
      body: settings,
      token
    }),

  // Apply watermark to URL
  applyWatermark: (url: string, creatorId: string, contentType?: 'image' | 'video') =>
    api<{ url: string; hasWatermark: boolean }>('/watermark/apply', {
      method: 'POST',
      body: { url, creatorId, contentType }
    }),

  // Preview watermark
  preview: (settings: Partial<WatermarkSettings>, sampleUrl: string | undefined, token: string) =>
    api<{ originalUrl: string; watermarkedUrl: string; settings: WatermarkSettings }>('/watermark/preview', {
      method: 'POST',
      body: { settings, sampleUrl },
      token
    }),
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

// ====================
// REFERRALS API
// ====================

export interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  pendingReferrals: number
  totalEarned: number
  thisMonthEarned: number
}

export interface ReferralInfo {
  id: string
  referredUser: {
    username: string
    displayName: string
    avatar: string | null
    createdAt: string
  }
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  commissionRate: number
  commissionEndDate: string
  totalEarned: number
  convertedAt: string | null
  createdAt: string
}

export interface ReferralData {
  referralCode: string
  referralLink: string
  stats: ReferralStats
  referrals: ReferralInfo[]
}

export interface ReferralCommission {
  id: string
  amount: number
  sourceType: string
  referredUser: {
    username: string
    displayName: string
  }
  createdAt: string
}

export const referralsApi = {
  // Get user's referral info and stats
  getReferrals: (token: string) =>
    api<ReferralData>('/referrals', { token }),

  // Apply a referral code
  applyCode: (code: string, token: string) =>
    api<{ success: boolean; message: string; referral: { id: string; referrerUsername: string; commissionEndDate: string } }>('/referrals/apply', {
      method: 'POST',
      body: { code },
      token
    }),

  // Regenerate referral code
  regenerateCode: (token: string) =>
    api<{ success: boolean; referralCode: string; referralLink: string }>('/referrals/regenerate', {
      method: 'POST',
      token
    }),

  // Get commission history
  getCommissions: (page: number, limit: number, token: string) =>
    api<{ commissions: ReferralCommission[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/referrals/commissions?page=${page}&limit=${limit}`, { token }),

  // Validate referral code (public)
  validateCode: (code: string) =>
    api<{ valid: boolean; referrer?: { username: string; displayName: string; avatar: string | null } }>(`/referrals/validate/${code}`),
}

// ====================
// PLATFORM IMPORT API
// ====================

export interface ImportPlatformInfo {
  id: string
  name: string
  icon: string
  description: string
  supported: string[]
}

export interface PlatformImport {
  id: string
  platform: 'ONLYFANS' | 'ARSMATE' | 'FANSLY' | 'OTHER'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'CANCELLED'
  profileImported: boolean
  postsImported: number
  mediaImported: number
  errorsCount: number
  errorLog: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export const importApi = {
  // Get supported platforms
  getPlatforms: () =>
    api<{ platforms: ImportPlatformInfo[] }>('/import/platforms'),

  // Get import history
  getImports: (token: string) =>
    api<{ imports: PlatformImport[] }>('/import', { token }),

  // Start a new import
  startImport: (platform: string, data: Record<string, unknown>, token: string) =>
    api<{ success: boolean; importId: string; message: string }>('/import/start', {
      method: 'POST',
      body: { platform, data },
      token
    }),

  // Import profile data directly
  importProfile: (platform: string, profileData: Record<string, unknown>, token: string) =>
    api<{ success: boolean; message: string; imported: Record<string, unknown> }>('/import/profile', {
      method: 'POST',
      body: { platform, profileData },
      token
    }),

  // Get import status
  getImportStatus: (importId: string, token: string) =>
    api<{ import: PlatformImport }>(`/import/${importId}`, { token }),

  // Cancel import
  cancelImport: (importId: string, token: string) =>
    api<{ success: boolean; message: string }>(`/import/${importId}`, {
      method: 'DELETE',
      token
    }),
}

// ==================== GAMIFICATION API ====================

export interface StreakInfo {
  currentStreak: number
  lastLoginDate: string
  milestones: {
    days: number
    bonus: number
    badge?: string
    achieved: boolean
    isCurrent: boolean
  }[]
  nextMilestone: {
    days: number
    bonus: number
    daysRemaining: number
    progress: number
  } | null
  achievedCount: number
  totalBonusEarned: number
}

export interface UserPointsInfo {
  points: number
  totalEarned: number
  totalSpent: number
  loginStreak: number
  lastLoginDate: string
  streak: {
    current: number
    nextMilestone: {
      days: number
      bonus: number
      daysRemaining: number
    } | null
  }
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  avatar: string | null
  totalAmount?: number
  donationCount?: number
  totalEarned?: number
  currentPoints?: number
  loginStreak?: number
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  updatedAt: string
  period?: string
  creator?: {
    id: string
    username: string
    displayName: string
  }
}

export interface MyRankResponse {
  tipping: {
    rank: number
    totalAmount: number
    donationCount: number
  }
  points: {
    rank: number
    totalEarned: number
    currentPoints: number
  } | null
  streak: {
    rank: number
    currentStreak: number
  } | null
}

// ==================== BADGES & LEVELS TYPES ====================

export type BadgeCategory = 'TIPPING' | 'STREAK' | 'SOCIAL' | 'LOYALTY' | 'MILESTONE' | 'SPECIAL';
export type BadgeRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  rarity: BadgeRarity
  pointsReward: number
  earned?: boolean
  earnedAt?: string | null
}

export interface UserBadgesResponse {
  badges: Badge[]
  byCategory: Record<BadgeCategory, Badge[]>
  stats: {
    total: number
    earned: number
    percentage: number
  }
  newBadges: string[]
}

export interface FanLevel {
  level: number
  name: string
  minXp: number
  icon: string
  color: string
  perks: string[]
}

export interface UserLevelResponse {
  currentXp: number
  level: number
  levelName: string
  levelIcon: string
  levelColor: string
  perks: string[]
  nextLevel: {
    level: number
    name: string
    xpNeeded: number
  } | null
  progress: {
    current: number
    needed: number
    percentage: number
  } | null
}

export interface PublicUserBadges {
  badges: {
    code: string
    name: string
    icon: string
    rarity: BadgeRarity
    earnedAt: string
  }[]
  level: {
    level: number
    name: string
    icon: string
    color: string
  } | null
  totalBadges: number
}

export const gamificationApi = {
  // Points & Streak
  getPoints: (token: string) =>
    api<UserPointsInfo>('/roulette/points', { token }),

  getStreakInfo: (token: string) =>
    api<StreakInfo>('/roulette/streak', { token }),

  // Leaderboards
  getTopTippers: (params?: { limit?: number; days?: number }) =>
    api<LeaderboardResponse>(`/leaderboard/tippers${params ? `?limit=${params.limit || 10}&days=${params.days || 30}` : ''}`),

  getCreatorTopTippers: (creatorId: string, params?: { limit?: number; days?: number }) =>
    api<LeaderboardResponse>(`/leaderboard/tippers/${creatorId}${params ? `?limit=${params.limit || 10}&days=${params.days || 30}` : ''}`),

  getTopPoints: (limit?: number) =>
    api<LeaderboardResponse>(`/leaderboard/points${limit ? `?limit=${limit}` : ''}`),

  getTopStreaks: (limit?: number) =>
    api<LeaderboardResponse>(`/leaderboard/streaks${limit ? `?limit=${limit}` : ''}`),

  getMyRank: (token: string, days?: number) =>
    api<MyRankResponse>(`/leaderboard/my-rank${days ? `?days=${days}` : ''}`, { token }),

  // Badges
  getAllBadges: () =>
    api<{ badges: Badge[] }>('/gamification/badges'),

  getMyBadges: (token: string) =>
    api<UserBadgesResponse>('/gamification/my-badges', { token }),

  checkBadges: (token: string) =>
    api<{ newBadges: Badge[] }>('/gamification/check-badges', { token, method: 'POST' }),

  getUserBadges: (userId: string) =>
    api<PublicUserBadges>(`/gamification/user/${userId}/badges`),

  // Levels
  getAllLevels: () =>
    api<{ levels: FanLevel[] }>('/gamification/levels'),

  getMyLevel: (token: string) =>
    api<UserLevelResponse>('/gamification/my-level', { token }),
}

export default api
