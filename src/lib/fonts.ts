/**
 * Font utilities for mapping font names to Tailwind classes
 */

// Map font names to Tailwind v4 utility classes
export const FONT_CLASS_MAP: Record<string, string> = {
  'Inter': 'font-inter',
  'Poppins': 'font-poppins',
  'Roboto': 'font-roboto',
  'Open Sans': 'font-open-sans',
  'Montserrat': 'font-montserrat',
}

/**
 * Get Tailwind font class from font name
 */
export function getFontClass(fontName: string): string {
  return FONT_CLASS_MAP[fontName] || 'font-inter'
}

/**
 * Get all available font options
 */
export const AVAILABLE_FONTS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
] as const

export type FontName = typeof AVAILABLE_FONTS[number]
