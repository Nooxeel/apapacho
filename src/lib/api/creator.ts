import { api } from './client'

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
