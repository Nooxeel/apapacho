/**
 * Font utilities for mapping font names to CSS variables and classes
 * OPTIMIZED: Only 2 fonts loaded for performance (Inter + Poppins)
 */

// Map font names to Tailwind v4 utility classes
export const FONT_CLASS_MAP: Record<string, string> = {
  'Inter': 'font-inter',
  'Poppins': 'font-poppins',
}

// Map font names to CSS variable values for inline styles
export const FONT_CSS_VAR_MAP: Record<string, string> = {
  'Inter': 'var(--font-inter), system-ui, sans-serif',
  'Poppins': 'var(--font-poppins), system-ui, sans-serif',
}

/** Default font (preloaded for best LCP) */
export const DEFAULT_FONT = 'Inter'

/**
 * Get Tailwind font class from font name
 */
export function getFontClass(fontName: string): string {
  return FONT_CLASS_MAP[fontName] || FONT_CLASS_MAP[DEFAULT_FONT]
}

/**
 * Get CSS font-family value for inline styles
 */
export function getFontStyle(fontName: string): string {
  return FONT_CSS_VAR_MAP[fontName] || FONT_CSS_VAR_MAP[DEFAULT_FONT]
}

/**
 * Available font options (must match fonts loaded in layout.tsx)
 */
export const AVAILABLE_FONTS = ['Inter', 'Poppins'] as const

export type FontName = typeof AVAILABLE_FONTS[number]
