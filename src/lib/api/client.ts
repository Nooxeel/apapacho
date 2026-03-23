export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Dynamic import to avoid circular dependency
let authStoreModule: any = null
async function getAuthStore() {
  if (!authStoreModule) {
    authStoreModule = await import('@/stores/authStore')
  }
  return authStoreModule.useAuthStore
}

export interface ApiOptions {
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

// Helper to refresh token and update Zustand store
async function tryRefreshToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const data = await response.json()

      // Update Zustand store with new token
      try {
        const useAuthStore = await getAuthStore()
        const state = useAuthStore.getState()
        if (state.user) {
          state.login(state.user, data.token, data.expiresIn)
        }
      } catch (storeError) {
        console.warn('[API] Failed to update auth store after refresh:', storeError)
      }

      return data.token
    }
  } catch {
    // Refresh failed
  }
  return null
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token, signal, skipRefresh = false } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection for cookie-based auth
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Debug logging for auth endpoints
  const isAuthEndpoint = endpoint.includes('/auth/')
  if (isAuthEndpoint) {
    console.log(`[API] ${method} ${endpoint}`, body ? { ...body, password: '***' } : undefined)
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials: 'include', // Send httpOnly cookies for authentication
    })

    if (isAuthEndpoint) {
      console.log(`[API] Response status: ${response.status}`)
    }

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
        console.log(`[API] Error response content-type: ${contentType}`)

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          console.log(`[API] Error data:`, errorData)
          errorMessage = errorData.error || errorData.message || errorMessage
          errorDetails = errorData.details
        } else {
          const textResponse = await response.text()
          console.log(`[API] Error text response:`, textResponse.substring(0, 200))
          errorMessage = textResponse || errorMessage
        }
      } catch (parseError) {
        console.error(`[API] Failed to parse error response:`, parseError)
      }

      throw new ApiError(errorMessage, response.status, endpoint, method, errorDetails)
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error) {
      console.error(`[API] Network/fetch error:`, error.message)

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
export async function uploadFile(
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
        'X-Requested-With': 'XMLHttpRequest',
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

export default api
