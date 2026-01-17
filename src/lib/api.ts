const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  token?: string
  signal?: AbortSignal
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

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token, signal } = options

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
    })

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

export default api
