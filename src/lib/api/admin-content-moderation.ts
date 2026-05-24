/**
 * Admin content moderation API client — Ola 6.
 *
 * Wraps `/api/admin/content-moderation/*` endpoints. Used inside the
 * `/admin/content-moderation` page only. The admin layout gates the whole
 * subtree by SUPER_ADMIN role + MFA, so callers can assume the token is
 * authorized.
 */

import { api } from './client'

export type ScanProvider =
  | 'CLOUDFLARE_CSAM'
  | 'SIGHTENGINE_NSFW'
  | 'CLOUDMERSIVE_VIRUS'
  | 'VIRUSTOTAL'
  | 'MANUAL_REVIEW'

export type ScanStatus =
  | 'PENDING'
  | 'PASSED'
  | 'FLAGGED'
  | 'FAILED'
  | 'QUARANTINED'

export type ScanVerdict =
  | 'CLEAN'
  | 'CSAM'
  | 'NSFW_EXTREME'
  | 'NSFW_NORMAL'
  | 'MALWARE'
  | 'SUSPICIOUS_NEEDS_REVIEW'
  | 'ERROR'

export interface ScanResultRow {
  id: string
  targetType: 'POST' | 'MESSAGE' | 'AVATAR' | 'KYC_DOC' | string
  targetId: string
  postId: string | null
  provider: ScanProvider
  status: ScanStatus
  verdict: ScanVerdict | null
  confidence: number | null
  categories: unknown
  rawResponse: unknown
  externalRequestId: string | null
  fraudIncidentId: string | null
  scannedAt: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
  post: {
    id: string
    title: string | null
    description: string | null
    visibility: string
    flaggedForReview: boolean
    creator: {
      id: string
      user: {
        id: string
        username: string
        displayName: string
        email: string
      }
    }
  } | null
  fraudIncident: {
    id: string
    severity: string
    status: string
    triggeredAt: string
  } | null
}

export interface ScanQueueResponse {
  items: ScanResultRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ScanQueueFilters {
  verdict?: ScanVerdict[]
  status?: ScanStatus[]
  page?: number
  pageSize?: number
  sort?: 'createdAt' | 'confidence'
  order?: 'asc' | 'desc'
}

function buildQuery(filters: ScanQueueFilters): string {
  const qs = new URLSearchParams()
  if (filters.verdict?.length) qs.set('verdict', filters.verdict.join(','))
  if (filters.status?.length) qs.set('status', filters.status.join(','))
  if (filters.page) qs.set('page', String(filters.page))
  if (filters.pageSize) qs.set('pageSize', String(filters.pageSize))
  if (filters.sort) qs.set('sort', filters.sort)
  if (filters.order) qs.set('order', filters.order)
  return qs.toString()
}

export async function getContentModerationQueue(
  filters: ScanQueueFilters,
  token: string
): Promise<ScanQueueResponse> {
  const qs = buildQuery(filters)
  const path = qs
    ? `/admin/content-moderation/queue?${qs}`
    : '/admin/content-moderation/queue'
  return api(path, { method: 'GET', token })
}

export async function approveScanResult(
  id: string,
  token: string
): Promise<{ ok: true }> {
  return api(`/admin/content-moderation/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    token,
  })
}

export async function takeDownScanResult(
  id: string,
  token: string
): Promise<{ ok: true }> {
  return api(`/admin/content-moderation/${encodeURIComponent(id)}/take-down`, {
    method: 'POST',
    token,
  })
}

export async function escalateScanResultAsCsam(
  id: string,
  token: string
): Promise<{ ok: true; fraudIncidentId: string; postsHidden: number }> {
  return api(
    `/admin/content-moderation/${encodeURIComponent(id)}/escalate-csam`,
    { method: 'POST', token }
  )
}

// ---------------------------------------------------------------------------
// UI labels
// ---------------------------------------------------------------------------

export const VERDICT_LABELS: Record<ScanVerdict, string> = {
  CLEAN: 'Limpio',
  CSAM: 'CSAM',
  NSFW_EXTREME: 'NSFW extremo',
  NSFW_NORMAL: 'Adulto (ok)',
  MALWARE: 'Malware',
  SUSPICIOUS_NEEDS_REVIEW: 'Sospechoso',
  ERROR: 'Error',
}

export const STATUS_LABELS: Record<ScanStatus, string> = {
  PENDING: 'Pendiente',
  PASSED: 'Aprobado',
  FLAGGED: 'Flaggeado',
  FAILED: 'Falló',
  QUARANTINED: 'Cuarentena',
}

export const PROVIDER_LABELS: Record<ScanProvider, string> = {
  CLOUDFLARE_CSAM: 'Cloudflare CSAM',
  SIGHTENGINE_NSFW: 'Sightengine NSFW',
  CLOUDMERSIVE_VIRUS: 'Cloudmersive',
  VIRUSTOTAL: 'VirusTotal',
  MANUAL_REVIEW: 'Revisión manual',
}

export const VERDICT_COLORS: Record<ScanVerdict, string> = {
  CLEAN: 'bg-green-500/20 text-green-200',
  CSAM: 'bg-red-600/30 text-red-200',
  NSFW_EXTREME: 'bg-red-500/20 text-red-300',
  NSFW_NORMAL: 'bg-blue-500/20 text-blue-200',
  MALWARE: 'bg-red-600/30 text-red-200',
  SUSPICIOUS_NEEDS_REVIEW: 'bg-amber-500/20 text-amber-200',
  ERROR: 'bg-white/10 text-white/60',
}
