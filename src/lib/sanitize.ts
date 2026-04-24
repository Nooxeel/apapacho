/**
 * Utilidades de sanitización XSS para el frontend
 * Solo se ejecuta en el cliente para evitar problemas con SSR
 */

// Lazy load DOMPurify solo en el cliente con promesa para tracking
let DOMPurify: any = null
let domPurifyReady: Promise<void> | null = null

// Inicializar inmediatamente en el cliente
if (typeof window !== 'undefined') {
  domPurifyReady = import('dompurify').then((module) => {
    DOMPurify = module.default
  }).catch((err) => {
    console.error('Failed to load DOMPurify:', err)
  })
}

/**
 * Espera a que DOMPurify esté listo (útil para componentes críticos)
 * Uso: await ensureSanitizerReady() antes de operaciones sensibles
 */
export async function ensureSanitizerReady(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (DOMPurify) return true
  if (domPurifyReady) {
    await domPurifyReady
    return !!DOMPurify
  }
  return false
}

/**
 * Verifica si DOMPurify está disponible (sync check)
 */
export function isSanitizerReady(): boolean {
  return !!DOMPurify
}

/**
 * Fallback básico de sanitización cuando DOMPurify no está disponible (SSR)
 * Escapa entidades HTML básicas.
 */
function basicEscape(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Fallback que strippea tags HTML usando regex (no para renderizar HTML, solo
 * para campos de texto plano cuando DOMPurify no está listo en SSR).
 */
function basicStripTags(text: string): string {
  if (!text) return ''
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
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
  // Si no hay tags permitidos, usamos strip en lugar de escape para no
  // introducir entidades que el consumidor espere como texto plano.
  const hasAllowedTags = Array.isArray(config?.ALLOWED_TAGS) && config.ALLOWED_TAGS.length > 0
  return hasAllowedTags ? basicEscape(text) : basicStripTags(text)
}

// Regex precompilada para caracteres de control y zero-width, sin literales
// no imprimibles en el archivo fuente.
// - C0 controls excepto \n (0x0A), \t (0x09), \r (0x0D): 0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F
// - DEL + C1 controls: 0x7F-0x9F
// - Zero-width / direction marks: U+200B..U+200F, U+FEFF
const CONTROL_CHARS_RE = new RegExp(
  '[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F\\u200B-\\u200F\\uFEFF]',
  'g'
)

/**
 * Remueve caracteres de control y zero-width que pueden usarse para homograph
 * attacks, bypass de filtros visuales o tampering invisible.
 * Preserva \n \t \r como caracteres legítimos de formato.
 */
function stripControlChars(text: string): string {
  return text.replace(CONTROL_CHARS_RE, '')
}

/**
 * Sanitiza texto plano (remueve todos los tags HTML y caracteres de control).
 * Uso: cualquier campo UGC que se renderiza como texto JSX (no HTML).
 * React ya escapa por defecto, pero llamar a sanitizeText() ofrece
 * defensa en profundidad y limpia caracteres invisibles / control.
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return ''
  const stripped = sanitizeWithDOMPurify(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
  return stripControlChars(stripped)
}

/**
 * Sanitiza bio / extendedInfo / descripciones largas que se renderizan como
 * texto JSX y pueden contener saltos de línea legítimos.
 * Remueve HTML y caracteres de control, colapsa CR+LF → LF, y conserva \n
 * (útil combinado con `whitespace-pre-line` o `whitespace-pre-wrap`).
 */
export function sanitizeBio(bio: string | null | undefined): string {
  if (!bio) return ''
  const stripped = sanitizeWithDOMPurify(bio, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
  // Normalizar CRLF → LF y limitar runs largos de newlines consecutivos (4+ → 2)
  const normalized = stripControlChars(stripped)
    .replace(/\r\n?/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
  return normalized
}

/**
 * Sanitiza HTML con links permitidos. SOLO para uso explícito con
 * `dangerouslySetInnerHTML`. No se usa hoy en la app.
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
 * Componente React para renderizar HTML sanitizado (allow-list con links).
 * Uso: <div dangerouslySetInnerHTML={createSanitizedHtml(content, true)} />
 * Actualmente NO se usa en la app — los textos UGC se renderizan como texto
 * JSX con sanitizeText() / sanitizeBio(). Preservado como utilidad para
 * cuando se necesite render HTML explícito.
 */
export function createSanitizedHtml(html: string, allowLinks = false) {
  const clean = allowLinks
    ? sanitizeHtmlWithLinks(html)
    : sanitizeWithDOMPurify(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
        ALLOWED_ATTR: []
      })
  return { __html: clean }
}
