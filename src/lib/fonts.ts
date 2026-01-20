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

// Emoji font stack to append to all font families
const EMOJI_FONTS = "'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"

// Map font names to CSS font-family values for inline styles
export const FONT_CSS_VAR_MAP: Record<string, string> = {
  'Inter': `Inter, var(--font-inter), system-ui, sans-serif, ${EMOJI_FONTS}`,
  'Poppins': `Poppins, var(--font-poppins), system-ui, sans-serif, ${EMOJI_FONTS}`,
  'Playfair Display': `"Playfair Display", Georgia, serif, ${EMOJI_FONTS}`,
  'Roboto': `Roboto, system-ui, sans-serif, ${EMOJI_FONTS}`,
  'Open Sans': `"Open Sans", system-ui, sans-serif, ${EMOJI_FONTS}`,
  'Montserrat': `Montserrat, system-ui, sans-serif, ${EMOJI_FONTS}`,
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
