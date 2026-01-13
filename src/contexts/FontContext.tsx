'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'

// Map font names to Tailwind v4 utility classes defined in globals.css
const FONT_CLASS_MAP: Record<string, string> = {
  'Inter': 'font-inter',
  'Poppins': 'font-poppins',
  'Roboto': 'font-roboto',
  'Open Sans': 'font-open-sans',
  'Montserrat': 'font-montserrat',
  'Tiller': 'font-tiller',
}

interface FontContextType {
  currentFont: string
  setPreviewFont: (font: string) => void
  clearPreviewFont: () => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

export function FontProvider({ children }: { children: ReactNode }) {
  const { user, hasHydrated } = useAuthStore()
  const [previewFont, setPreviewFont] = useState<string | null>(null)

  // Get the saved font from user or use preview font
  const savedFont = (user as any)?.fontFamily || 'Tiller'
  const currentFont = previewFont || savedFont

  // Apply font to body whenever it changes
  useEffect(() => {
    if (!hasHydrated) return

    const fontClass = FONT_CLASS_MAP[currentFont] || 'font-tiller'

    // Remove all font classes from body
    Object.values(FONT_CLASS_MAP).forEach(className => {
      document.body.classList.remove(className)
    })

    // Add the selected font class
    document.body.classList.add(fontClass)
  }, [currentFont, hasHydrated, user])

  const clearPreviewFont = () => {
    setPreviewFont(null)
  }

  return (
    <FontContext.Provider value={{ currentFont, setPreviewFont, clearPreviewFont }}>
      {children}
    </FontContext.Provider>
  )
}

export function useFontContext() {
  const context = useContext(FontContext)
  if (!context) {
    throw new Error('useFontContext must be used within FontProvider')
  }
  return context
}
