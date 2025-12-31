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
    public method?: string
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

      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } else {
          errorMessage = await response.text() || errorMessage
        }
      } catch {
        // If parsing error response fails, use generic message
      }

      throw new ApiError(errorMessage, response.status, endpoint, method)
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

  profile: (file: File, token: string) => uploadFile('/upload/profile', file, 'profile', token),

  cover: (file: File, token: string) => uploadFile('/upload/cover', file, 'cover', token),

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

export default api
