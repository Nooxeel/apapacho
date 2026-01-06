/**
 * Font utilities for mapping font names to CSS variables and classes
 */

// Map font names to Tailwind v4 utility classes
export const FONT_CLASS_MAP: Record<string, string> = {
  'Inter': 'font-inter',
  'Poppins': 'font-poppins',
  'Roboto': 'font-roboto',
  'Open Sans': 'font-open-sans',
  'Montserrat': 'font-montserrat',
}

// Map font names to CSS variable values for inline styles
export const FONT_CSS_VAR_MAP: Record<string, string> = {
  'Inter': 'var(--font-inter), system-ui, sans-serif',
  'Poppins': 'var(--font-poppins), system-ui, sans-serif',
  'Roboto': 'var(--font-roboto), system-ui, sans-serif',
  'Open Sans': 'var(--font-open-sans), system-ui, sans-serif',
  'Montserrat': 'var(--font-montserrat), system-ui, sans-serif',
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
  return FONT_CSS_VAR_MAP[fontName] || 'var(--font-inter), system-ui, sans-serif'
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
