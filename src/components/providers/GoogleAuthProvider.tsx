'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

interface GoogleAuthProviderProps {
  children: React.ReactNode
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  // If no Google Client ID is configured, just render children without Google OAuth
  if (!GOOGLE_CLIENT_ID) {
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  )
}
