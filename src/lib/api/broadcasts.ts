import { api } from './client'

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
