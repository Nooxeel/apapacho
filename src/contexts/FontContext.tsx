'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'

/**
 * Map font names to Tailwind utility classes
 * MUST match fonts loaded in layout.tsx (Inter, Poppins only)
 */
const FONT_CLASS_MAP: Record<string, string> = {
  'Inter': 'font-inter',
  'Poppins': 'font-poppins',
}

/** Default font for best performance (preloaded) */
const DEFAULT_FONT = 'Inter'

interface FontContextType {
  /** Currently active font name */
  currentFont: string
  /** Set a preview font (temporary, not persisted) */
  setPreviewFont: (font: string) => void
  /** Clear preview and revert to saved font */
  clearPreviewFont: () => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

export function FontProvider({ children }: { children: ReactNode }) {
  const { user, hasHydrated } = useAuthStore()
  const [previewFont, setPreviewFont] = useState<string | null>(null)

  // Get the saved font from user profile, fallback to default
  const savedFont = (user as any)?.fontFamily || DEFAULT_FONT
  
  // Validate saved font is actually available
  const validatedSavedFont = FONT_CLASS_MAP[savedFont] ? savedFont : DEFAULT_FONT
  
  // Preview takes priority over saved font
  const currentFont = previewFont || validatedSavedFont

  // Apply font class to body element for global effect
  useEffect(() => {
    if (!hasHydrated) return

    const fontClass = FONT_CLASS_MAP[currentFont] || FONT_CLASS_MAP[DEFAULT_FONT]

    // Remove all font classes first
    Object.values(FONT_CLASS_MAP).forEach(className => {
      document.body.classList.remove(className)
    })

    // Apply the selected font class
    document.body.classList.add(fontClass)
    
    // Also set CSS variable for components using inline styles
    document.documentElement.style.setProperty('--active-font', currentFont)
  }, [currentFont, hasHydrated])

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
