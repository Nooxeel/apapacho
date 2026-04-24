import { API_URL, ApiError, api } from './client'

/**
 * KYC status as reported by GET /api/creators/kyc/status.
 */
export type KycStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUIRED'

export interface KycStatusResponse {
  status: KycStatus
  submittedAt: string | null
  reviewedAt: string | null
  rejectionReason: string | null
}

export interface KycSubmitInput {
  idFront: File
  idBack: File
  selfieWithId: File
  fullLegalName: string
  nationalId: string
  birthdate: string // ISO date (YYYY-MM-DD)
  consent: boolean
}

export interface KycSubmitResponse {
  submissionId: string
  status: 'SUBMITTED'
  estimatedReviewTime: string
}

export async function getKycStatus(token?: string): Promise<KycStatusResponse> {
  return api<KycStatusResponse>('/creators/kyc/status', {
    method: 'GET',
    token,
  })
}

/**
 * Submit KYC docs. Uses multipart/form-data — bypasses the JSON `api()` wrapper
 * but keeps the same credential + CSRF header strategy.
 */
export async function submitKyc(
  input: KycSubmitInput,
  token?: string,
  signal?: AbortSignal
): Promise<KycSubmitResponse> {
  const form = new FormData()
  form.append('idFront', input.idFront)
  form.append('idBack', input.idBack)
  form.append('selfieWithId', input.selfieWithId)
  form.append('fullLegalName', input.fullLegalName)
  form.append('nationalId', input.nationalId)
  form.append('birthdate', input.birthdate)
  form.append('consent', input.consent ? 'true' : 'false')

  const headers: HeadersInit = {
    'X-Requested-With': 'XMLHttpRequest',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_URL}/creators/kyc/submit`, {
    method: 'POST',
    headers,
    body: form,
    credentials: 'include',
    signal,
  })

  if (!response.ok) {
    let message = 'No se pudo enviar la verificación'
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        message = data.error || data.message || message
      }
    } catch {
      // swallow
    }
    throw new ApiError(message, response.status, '/creators/kyc/submit', 'POST')
  }

  return response.json()
}
