import { api } from './client'

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
