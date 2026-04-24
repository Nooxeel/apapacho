/**
 * Chilean RUT (Rol Único Tributario) validation utilities — browser copy.
 *
 * Mirrors the backend implementation at backend/src/lib/rut.ts so the form
 * can give instant feedback before the request. Server remains the source of
 * truth.
 */

export function cleanRut(rut: string): string {
  if (!rut) return ''
  return rut.replace(/[.\-\s]/g, '').toUpperCase()
}

function computeCheckDigit(body: string): string | null {
  if (!/^\d+$/.test(body)) return null
  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const mod = 11 - (sum % 11)
  if (mod === 11) return '0'
  if (mod === 10) return 'K'
  return String(mod)
}

export function validateRut(rut: string): boolean {
  const cleaned = cleanRut(rut)
  if (cleaned.length < 8 || cleaned.length > 9) return false
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  if (!/^\d+$/.test(body)) return false
  if (!/^[0-9K]$/.test(dv)) return false
  if (parseInt(body, 10) === 0) return false
  const expected = computeCheckDigit(body)
  return expected !== null && expected === dv
}

export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut)
  if (cleaned.length < 2) return ''
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  if (!/^\d+$/.test(body)) return ''
  let formattedBody = ''
  for (let i = 0; i < body.length; i++) {
    if (i > 0 && (body.length - i) % 3 === 0) {
      formattedBody += '.'
    }
    formattedBody += body[i]
  }
  return `${formattedBody}-${dv}`
}
