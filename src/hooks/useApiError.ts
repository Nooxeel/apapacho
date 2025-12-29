import { useState, useCallback } from 'react'
import { ApiError } from '@/lib/api'

interface UseApiErrorReturn {
  error: string | null
  setError: (error: string | null) => void
  handleError: (error: unknown) => void
  clearError: () => void
}

export function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      setError(error.message)
    } else if (error instanceof Error) {
      setError(error.message)
    } else {
      setError('An unexpected error occurred')
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    setError,
    handleError,
    clearError,
  }
}
