import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'max' = 'medium'): string {
  const qualities = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    max: 'maxresdefault',
  }
  return `https://img.youtube.com/vi/${videoId}/${qualities[quality]}.jpg`
}

export function calculatePlatformFee(amount: number, commissionRate: number = 0.15): {
  fee: number
  creatorEarnings: number
} {
  const fee = amount * commissionRate
  return {
    fee: Math.round(fee * 100) / 100,
    creatorEarnings: Math.round((amount - fee) * 100) / 100,
  }
}

export function generateUsername(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15) + Math.random().toString(36).slice(2, 6)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `hace ${interval} ${unit}${interval > 1 ? 's' : ''}`
    }
  }

  return 'ahora mismo'
}

/**
 * Extrae mensaje de error de forma type-safe
 * Usar en catch blocks en lugar de `catch (err: any)`
 */
export function getErrorMessage(error: unknown, fallback = 'Error desconocido'): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return fallback
}

/**
 * Convierte códigos de país de 2 letras a emojis de banderas
 * Ejemplo: "CL" -> "🇨🇱", "US" -> "🇺🇸"
 */
export function countryCodeToFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

/**
 * Reemplaza códigos de país de 2 letras en un texto por sus emojis de bandera
 * Solo reemplaza códigos que están solos (no como parte de palabras) y en mayúsculas
 * Ejemplo: "Hola desde CL" -> "Hola desde 🇨🇱"
 */
export function replaceCountryCodesWithFlags(text: string): string {
  // Lista de códigos de país comunes en Latinoamérica y otros
  const countryCodes = [
    'CL', 'AR', 'MX', 'CO', 'PE', 'VE', 'EC', 'BR', 'UY', 'PY', 'BO', 'CR', 'PA', 'GT', 'SV', 'HN', 'NI', 'DO', 'PR', 'CU',
    'US', 'CA', 'ES', 'PT', 'FR', 'DE', 'IT', 'GB', 'JP', 'CN', 'KR', 'AU', 'NZ'
  ]
  
  let result = text
  for (const code of countryCodes) {
    // Reemplazar solo cuando el código está al final del texto o seguido por espacios/puntuación
    const regex = new RegExp(`\\b${code}\\b`, 'g')
    result = result.replace(regex, countryCodeToFlag(code))
  }
  return result
}
