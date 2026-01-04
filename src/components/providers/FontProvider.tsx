'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

const FONT_CLASS_MAP: Record<string, string> = {
  'Inter': 'font-inter',
  'Roboto': 'font-roboto',
  'Open Sans': 'font-open-sans',
  'Lato': 'font-lato',
  'Poppins': 'font-poppins',
}

export default function FontProvider({ children }: { children: React.ReactNode }) {
  const { user, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return

    // Get the user's font preference or default to Inter
    const fontFamily = (user as any)?.fontFamily || 'Inter'
    const fontClass = FONT_CLASS_MAP[fontFamily] || 'font-inter'

    // Remove all font classes from body
    Object.values(FONT_CLASS_MAP).forEach(className => {
      document.body.classList.remove(className)
    })

    // Add the selected font class
    document.body.classList.add(fontClass)
  }, [user, hasHydrated])

  return <>{children}</>
}
