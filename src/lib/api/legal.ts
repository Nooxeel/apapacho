/**
 * Legal & privacy API client (Ley 21.719 + Ley 17.336).
 *
 * Wraps the backend endpoints defined in `backend/src/routes/legal.ts`:
 *   - Public read: legal document versions (Group 3.3).
 *   - User: ARCO-P submission + history, DMCA submission, async data export.
 *   - Admin: ARCO-P queue/process, DMCA queue/process (Group 3.4).
 *
 * Group 3.2 already shipped /derechos and /dmca pages that consume the
 * `submitArcopRequest`, `listMyArcopRequests`, `submitDmcaNotice`,
 * `ARCOP_TYPE_LABELS`, `ARCOP_STATUS_LABELS`, `ArcopRightType`,
 * `ArcopRequestStatus`, `ArcopRequestRecord`, `DmcaNoticeInput`, `legalApi`,
 * `LegalDocType`, `LegalVersion`, and `LegalVersionsResponse` exports — all
 * are preserved here. The DMCA submitter adapts the page-side shape (which
 * has `notifierIdType`, `workDescription`, `ownershipEvidence`, `sworn`,
 * `acceptedTerms`) to the backend-side shape (which has `notifierIdNumber`
 * combining type+number, `worksClaimed`, `ownershipProof`, `swornStatement`).
 */

import { api } from './client'

// ---------------------------------------------------------------------------
// Legal document versions (Group 3.3 — public read endpoint)
// ---------------------------------------------------------------------------

export type LegalDocType = 'TERMS' | 'PRIVACY' | 'COOKIES'

export interface LegalVersion {
  id: string
  version: string
  effectiveAt: string
  url: string | null
  summary: string | null
}

export type LegalVersionsResponse = Record<LegalDocType, LegalVersion | null>

export const legalApi = {
  /** Public — current version of each legal document. Cached 5 min on edge. */
  getVersions: () => api<LegalVersionsResponse>('/legal/versions'),
}

// ---------------------------------------------------------------------------
// ARCO-P (Acceso, Rectificación, Cancelación, Oposición + Portabilidad)
// ---------------------------------------------------------------------------

export type ArcopRightType =
  | 'ACCESS'
  | 'RECTIFICATION'
  | 'CANCELLATION'
  | 'OPPOSITION'
  | 'PORTABILITY'

/**
 * UI-side status union. The backend returns PENDING/IN_PROGRESS/COMPLETED/REJECTED;
 * the legacy 'RECEIVED' label is kept for backward compatibility with any UI
 * that still uses it. New code should prefer 'PENDING'.
 */
export type ArcopRequestStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'

export interface ArcopRequestInput {
  type: ArcopRightType
  motive?: string
  /** Key-value pairs of fields to rectify (only relevant when type=RECTIFICATION). */
  dataToRectify?: Record<string, string>
}

/**
 * UI-facing record shape used by /derechos. We adapt the backend response
 * (which uses different field names) to this stable shape.
 */
export interface ArcopRequestRecord {
  id: string
  type: ArcopRightType
  status: ArcopRequestStatus
  motive: string | null
  dataToRectify: Record<string, string> | null
  /** Mapped from backend `requestedAt`. */
  createdAt: string
  dueBy: string
  /** Mapped from backend `completedAt` || `rejectedAt`. */
  resolvedAt: string | null
  /** Mapped from backend `rejectionReason`. */
  resolutionNotes: string | null
  /** Optional attachment URL (when status = COMPLETED and includes a deliverable). */
  attachmentUrl?: string | null
  attachmentExpiresAt?: string | null
}

export interface ArcopSubmitResponse {
  request: ArcopRequestRecord
}

export interface ArcopListResponse {
  requests: ArcopRequestRecord[]
}

interface ArcopBackendRow {
  id: string
  userId: string
  type: ArcopRightType
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  motive: string | null
  dataToRectify: Record<string, unknown> | null
  requestedAt: string
  dueBy: string
  inProgressAt: string | null
  completedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  attachmentUrl: string | null
  attachmentExpiresAt: string | null
}

function adaptArcopRow(row: ArcopBackendRow): ArcopRequestRecord {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    motive: row.motive,
    dataToRectify: row.dataToRectify as Record<string, string> | null,
    createdAt: row.requestedAt,
    dueBy: row.dueBy,
    resolvedAt: row.completedAt ?? row.rejectedAt ?? null,
    resolutionNotes: row.rejectionReason,
    attachmentUrl: row.attachmentUrl,
    attachmentExpiresAt: row.attachmentExpiresAt,
  }
}

export async function submitArcopRequest(
  input: ArcopRequestInput,
  token?: string,
  signal?: AbortSignal
): Promise<ArcopSubmitResponse> {
  const result = await api<{
    requestId: string
    type: ArcopRightType
    status: ArcopBackendRow['status']
    dueBy: string
  }>('/legal/arcop', {
    method: 'POST',
    body: input,
    token,
    signal,
  })
  // Backend returns minimal shape; synthesize the full record for the UI.
  return {
    request: {
      id: result.requestId,
      type: result.type,
      status: result.status,
      motive: input.motive ?? null,
      dataToRectify: input.dataToRectify ?? null,
      createdAt: new Date().toISOString(),
      dueBy: result.dueBy,
      resolvedAt: null,
      resolutionNotes: null,
      attachmentUrl: null,
      attachmentExpiresAt: null,
    },
  }
}

export async function listMyArcopRequests(
  token?: string,
  signal?: AbortSignal
): Promise<ArcopListResponse> {
  const result = await api<{ items: ArcopBackendRow[]; count: number }>(
    '/legal/arcop/me',
    { method: 'GET', token, signal }
  )
  return { requests: result.items.map(adaptArcopRow) }
}

// ---------------------------------------------------------------------------
// DMCA (notificación de infracción de propiedad intelectual)
// ---------------------------------------------------------------------------

export interface DmcaNoticeInput {
  /** Notifier identification */
  notifierName: string
  notifierEmail: string
  notifierIdType: 'RUT' | 'PASSPORT' | 'OTHER'
  notifierIdNumber: string
  notifierAddress: string

  /** Claimed work */
  workDescription: string
  ownershipEvidence: string

  /** URLs allegedly infringing — one per line in UI, array in payload */
  infringingUrls: string[]

  /** Sworn declarations (must both be true) */
  sworn: boolean
  acceptedTerms: boolean
}

export interface DmcaSubmitResponse {
  noticeId: string
  receivedAt: string
  estimatedSlaDays: number
}

export async function submitDmcaNotice(
  input: DmcaNoticeInput,
  signal?: AbortSignal
): Promise<DmcaSubmitResponse> {
  if (!input.sworn || !input.acceptedTerms) {
    throw new Error('Debes aceptar la declaración jurada y los términos.')
  }
  // Combine type + number into the single `notifierIdNumber` field expected by
  // the backend, and rename fields to match the backend schema.
  const result = await api<{ noticeId: string; status: string; dueBy: string }>(
    '/legal/dmca',
    {
      method: 'POST',
      body: {
        notifierName: input.notifierName,
        notifierEmail: input.notifierEmail,
        notifierIdNumber: `${input.notifierIdType}: ${input.notifierIdNumber}`,
        notifierAddress: input.notifierAddress,
        worksClaimed: input.workDescription,
        ownershipProof: input.ownershipEvidence,
        infringingUrls: input.infringingUrls,
        swornStatement: true,
        swornStatementText:
          'Declaro bajo juramento que la información proporcionada es verídica.',
      },
      signal,
    }
  )
  return {
    noticeId: result.noticeId,
    receivedAt: new Date().toISOString(),
    estimatedSlaDays: 7,
  }
}

// ---------------------------------------------------------------------------
// Async data export (POST /api/users/me/export-async)
// ---------------------------------------------------------------------------

export interface DataExportResponse {
  requestId: string
  status: 'IN_PROGRESS' | 'PENDING'
  message: string
}

export async function requestDataExport(token?: string): Promise<DataExportResponse> {
  return api('/users/me/export-async', { method: 'POST', token })
}

// ---------------------------------------------------------------------------
// Admin endpoints — ARCO-P queue/processing + DMCA queue/processing
// ---------------------------------------------------------------------------

export type AdminArcopStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'

export interface AdminArcopQueueRow {
  id: string
  userId: string
  type: ArcopRightType
  status: AdminArcopStatus
  motive: string | null
  requestedAt: string
  dueBy: string
  inProgressAt: string | null
  completedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  attachmentUrl: string | null
  attachmentExpiresAt: string | null
  hoursOverdue: number
  isOverdue: boolean
  user: {
    id: string
    username: string
    displayName: string
    email: string
    avatar: string | null
  }
}

export interface AdminArcopQueueResponse {
  items: AdminArcopQueueRow[]
  total: number
  page: number
  pageSize: number
}

export interface AdminArcopDetail extends AdminArcopQueueRow {
  dataToRectify: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  processedBy: string | null
  user: AdminArcopQueueRow['user'] & {
    createdAt: string
    isCreator: boolean
  }
}

export async function getArcopQueue(
  statuses: AdminArcopStatus[] = ['PENDING', 'IN_PROGRESS'],
  page = 1,
  token?: string
): Promise<AdminArcopQueueResponse> {
  const qs = new URLSearchParams()
  if (statuses.length > 0) qs.set('status', statuses.join(','))
  qs.set('page', String(page))
  return api(`/admin/legal/arcop/queue?${qs.toString()}`, { method: 'GET', token })
}

export async function getArcopDetail(id: string, token?: string): Promise<AdminArcopDetail> {
  return api(`/admin/legal/arcop/${encodeURIComponent(id)}`, { method: 'GET', token })
}

export async function startArcopRequest(id: string, token?: string) {
  return api<{ ok: true; request: AdminArcopQueueRow; transitionApplied: boolean }>(
    `/admin/legal/arcop/${encodeURIComponent(id)}/start`,
    { method: 'POST', token }
  )
}

export async function completeArcopRequest(
  id: string,
  payload: { attachmentUrl?: string; notes?: string },
  token?: string
) {
  return api<{ ok: true; request: AdminArcopQueueRow; transitionApplied: boolean }>(
    `/admin/legal/arcop/${encodeURIComponent(id)}/complete`,
    { method: 'POST', body: payload, token }
  )
}

export async function rejectArcopRequest(id: string, rejectionReason: string, token?: string) {
  return api<{ ok: true; request: AdminArcopQueueRow; transitionApplied: boolean }>(
    `/admin/legal/arcop/${encodeURIComponent(id)}/reject`,
    { method: 'POST', body: { rejectionReason }, token }
  )
}

export type AdminDmcaStatus =
  | 'PENDING'
  | 'VALIDATED'
  | 'TAKEN_DOWN'
  | 'COUNTER_NOTICE'
  | 'REJECTED'

export interface AdminDmcaQueueRow {
  id: string
  status: AdminDmcaStatus
  notifierName: string
  notifierEmail: string
  notifierIdNumber: string | null
  notifierAddress: string | null
  worksClaimed: string
  ownershipProof: string
  infringingUrls: string[]
  infringingPostIds: string[]
  swornStatement: boolean
  receivedAt: string
  dueBy: string
  validatedAt: string | null
  takenDownAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  hoursOverdue: number
  isOverdue: boolean
}

export interface AdminDmcaQueueResponse {
  items: AdminDmcaQueueRow[]
  total: number
  page: number
  pageSize: number
}

export interface AdminDmcaDetail {
  notice: AdminDmcaQueueRow
  posts: Array<{
    id: string
    title: string | null
    visibility: string
    createdAt: string
    creator: {
      id: string
      user: { id: string; username: string; displayName: string; email: string }
    }
  }>
  hoursOverdue: number
  isOverdue: boolean
}

export async function getDmcaQueue(
  statuses: AdminDmcaStatus[] = ['PENDING', 'VALIDATED'],
  page = 1,
  token?: string
): Promise<AdminDmcaQueueResponse> {
  const qs = new URLSearchParams()
  if (statuses.length > 0) qs.set('status', statuses.join(','))
  qs.set('page', String(page))
  return api(`/admin/legal/dmca/queue?${qs.toString()}`, { method: 'GET', token })
}

export async function getDmcaDetail(id: string, token?: string): Promise<AdminDmcaDetail> {
  return api(`/admin/legal/dmca/${encodeURIComponent(id)}`, { method: 'GET', token })
}

export async function validateDmcaNotice(id: string, token?: string) {
  return api<{ ok: true; notice: AdminDmcaQueueRow; transitionApplied: boolean }>(
    `/admin/legal/dmca/${encodeURIComponent(id)}/validate`,
    { method: 'POST', token }
  )
}

export async function applyDmcaTakedown(id: string, postIds: string[], token?: string) {
  return api<{
    ok: true
    notice: AdminDmcaQueueRow
    transitionApplied: boolean
    takenDownPostIds: string[]
  }>(`/admin/legal/dmca/${encodeURIComponent(id)}/takedown`, {
    method: 'POST',
    body: { postIds },
    token,
  })
}

export async function rejectDmcaNotice(id: string, rejectionReason: string, token?: string) {
  return api<{ ok: true; notice: AdminDmcaQueueRow; transitionApplied: boolean }>(
    `/admin/legal/dmca/${encodeURIComponent(id)}/reject`,
    { method: 'POST', body: { rejectionReason }, token }
  )
}

// ---------------------------------------------------------------------------
// Human-readable labels (for UI rendering)
// ---------------------------------------------------------------------------

export const ARCOP_TYPE_LABELS: Record<ArcopRightType, string> = {
  ACCESS: 'Acceso',
  RECTIFICATION: 'Rectificación',
  CANCELLATION: 'Cancelación (olvido)',
  OPPOSITION: 'Oposición',
  PORTABILITY: 'Portabilidad',
}

export const ARCOP_STATUS_LABELS: Record<ArcopRequestStatus, string> = {
  PENDING: 'Recibida',
  RECEIVED: 'Recibida',
  IN_PROGRESS: 'En proceso',
  COMPLETED: 'Completada',
  REJECTED: 'Rechazada',
}

export const DMCA_STATUS_LABELS: Record<AdminDmcaStatus, string> = {
  PENDING: 'Pendiente',
  VALIDATED: 'Validada',
  TAKEN_DOWN: 'Retirado',
  COUNTER_NOTICE: 'Contra-notificación',
  REJECTED: 'Rechazada',
}
