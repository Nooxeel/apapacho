import { api } from './client'

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
