/**
 * Utilidades de sanitización XSS para el frontend
 * Solo se ejecuta en el cliente para evitar problemas con SSR
 */

// Lazy load DOMPurify solo en el cliente
let DOMPurify: any = null

if (typeof window !== 'undefined') {
  import('dompurify').then((module) => {
    DOMPurify = module.default
  })
}

/**
 * Fallback básico de sanitización cuando DOMPurify no está disponible (SSR)
 */
function basicSanitize(text: string): string {
  if (!text) return ''
  // Remover tags HTML básicos y caracteres peligrosos
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitiza texto (wrapper que usa DOMPurify si está disponible)
 */
function sanitizeWithDOMPurify(text: string, config: any = {}): string {
  if (!text || typeof text !== 'string') return ''
  
  // Si DOMPurify está disponible, usarlo
  if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(text, config)
  }
  
  // Fallback para SSR
  return basicSanitize(text)
}

/**
 * Sanitiza texto plano (remueve todos los tags HTML)
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return ''
  return sanitizeWithDOMPurify(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitiza texto con formato básico (negritas, cursivas)
 */
export function sanitizeBasicHtml(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeWithDOMPurify(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitiza HTML con links permitidos
 */
export function sanitizeHtmlWithLinks(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeWithDOMPurify(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  })
}

/**
 * Sanitiza descripción de post antes de mostrarla
 */
export function sanitizePostDescription(description: string | null | undefined): string {
  if (!description) return ''
  // Permitir formato básico en descripciones
  return sanitizeBasicHtml(description)
}

/**
 * Sanitiza comentario antes de mostrarlo
 */
export function sanitizeComment(content: string | null | undefined): string {
  if (!content) return ''
  // Permitir formato básico en comentarios
  return sanitizeBasicHtml(content)
}

/**
 * Sanitiza bio de creador antes de mostrarla
 */
export function sanitizeBio(bio: string | null | undefined): string {
  if (!bio) return ''
  // Permitir formato básico en biografías
  return sanitizeBasicHtml(bio)
}

/**
 * Sanitiza URL para prevenir javascript: o data: URIs
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return ''
  
  const sanitized = sanitizeText(url)
  
  // Validar que no sea un esquema peligroso
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:']
  const lowerUrl = sanitized.toLowerCase().trim()
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return ''
    }
  }
  
  return sanitized
}

/**
 * Componente React para renderizar HTML sanitizado
 * Uso: <div dangerouslySetInnerHTML={createSanitizedHtml(content)} />
 */
export function createSanitizedHtml(html: string, allowLinks = false) {
  const clean = allowLinks ? sanitizeHtmlWithLinks(html) : sanitizeBasicHtml(html)
  return { __html: clean }
}
