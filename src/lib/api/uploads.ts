import { API_URL, ApiError, uploadFile } from './client'

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
        credentials: 'include', // Send cookies for fallback auth
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
