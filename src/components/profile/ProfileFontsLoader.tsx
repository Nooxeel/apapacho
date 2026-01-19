'use client'

import { useEffect, useState } from 'react'

const PROFILE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700&family=Open+Sans:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@400;600;700&display=swap'

/**
 * Lazy loads profile customization fonts only when needed
 * This prevents blocking the landing page with fonts used only in creator profiles
 */
export function ProfileFontsLoader() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return

    // Check if fonts are already loaded
    const existingLink = document.querySelector(`link[href="${PROFILE_FONTS_URL}"]`)
    if (existingLink) {
      setLoaded(true)
      return
    }

    // Load fonts async
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = PROFILE_FONTS_URL
    link.onload = () => setLoaded(true)
    document.head.appendChild(link)
  }, [loaded])

  return null
}
