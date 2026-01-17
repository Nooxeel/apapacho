/**
 * Font utilities for mapping font names to CSS variables and classes
 * 
 * Core fonts (Inter, Poppins): Loaded via next/font for optimal performance
 * Profile fonts (Roboto, Open Sans, Montserrat, Playfair Display): Loaded via Google Fonts CSS
 */

// Map font names to Tailwind v4 utility classes
export const FONT_CLASS_MAP: Record<string, string> = {
  'Inter': 'font-inter',
  'Poppins': 'font-poppins',
  'Playfair Display': 'font-playfair',
  'Roboto': 'font-roboto',
  'Open Sans': 'font-open-sans',
  'Montserrat': 'font-montserrat',
}

// Map font names to CSS font-family values for inline styles
export const FONT_CSS_VAR_MAP: Record<string, string> = {
  'Inter': 'Inter, var(--font-inter), system-ui, sans-serif',
  'Poppins': 'Poppins, var(--font-poppins), system-ui, sans-serif',
  'Playfair Display': '"Playfair Display", Georgia, serif',
  'Roboto': 'Roboto, system-ui, sans-serif',
  'Open Sans': '"Open Sans", system-ui, sans-serif',
  'Montserrat': 'Montserrat, system-ui, sans-serif',
}

/**
 * Get Tailwind font class from font name
 */
export function getFontClass(fontName: string): string {
  return FONT_CLASS_MAP[fontName] || 'font-inter'
}

/**
 * Get CSS font-family value for inline styles (higher specificity)
 */
export function getFontStyle(fontName: string): string {
  return FONT_CSS_VAR_MAP[fontName] || 'Inter, var(--font-inter), system-ui, sans-serif'
}

/**
 * All available font options for creator profile customization
 */
export const AVAILABLE_FONTS = [
  'Playfair Display',
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
] as const

export type FontName = typeof AVAILABLE_FONTS[number]
