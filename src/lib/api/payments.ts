import { api } from './client'

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
