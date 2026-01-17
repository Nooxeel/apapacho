'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuthStore } from '@/stores'
import { ageVerificationApi } from '@/lib/api'
import AgeVerificationModal from '@/components/ui/AgeVerificationModal'

interface AgeVerificationContextType {
  isVerified: boolean
  isLoading: boolean
  showModal: () => void
  hideModal: () => void
}

const AgeVerificationContext = createContext<AgeVerificationContextType>({
  isVerified: false,
  isLoading: true,
  showModal: () => {},
  hideModal: () => {},
})

export function useAgeVerification() {
  return useContext(AgeVerificationContext)
}

interface AgeVerificationProviderProps {
  children: ReactNode
}

export function AgeVerificationProvider({ children }: AgeVerificationProviderProps) {
  const { token, hasHydrated } = useAuthStore()
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showModalState, setShowModalState] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return

    const checkVerification = async () => {
      setIsLoading(true)

      // Check localStorage first for anonymous users
      const localVerification = localStorage.getItem('ageVerified')
      
      if (token) {
        // For logged in users, check server
        try {
          const status = await ageVerificationApi.getStatus(token)
          if (status.verified) {
            setIsVerified(true)
            setShowModalState(false)
          } else {
            setIsVerified(false)
            setShowModalState(true)
          }
        } catch {
          // If API fails, fall back to localStorage
          if (localVerification === 'true') {
            setIsVerified(true)
            setShowModalState(false)
          } else {
            setIsVerified(false)
            setShowModalState(true)
          }
        }
      } else {
        // Anonymous user - check localStorage
        if (localVerification === 'true') {
          setIsVerified(true)
          setShowModalState(false)
        } else {
          setIsVerified(false)
          setShowModalState(true)
        }
      }

      setIsLoading(false)
    }

    checkVerification()
  }, [token, hasHydrated])

  const handleVerified = () => {
    setIsVerified(true)
    setShowModalState(false)
  }

  const showModal = () => setShowModalState(true)
  const hideModal = () => setShowModalState(false)

  return (
    <AgeVerificationContext.Provider value={{ isVerified, isLoading, showModal, hideModal }}>
      {showModalState && (
        <AgeVerificationModal onVerified={handleVerified} />
      )}
      {children}
    </AgeVerificationContext.Provider>
  )
}

export default AgeVerificationProvider
