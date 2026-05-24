/**
 * Report API client — content/user moderation reports.
 *
 * Wraps the backend endpoints defined in `backend/src/routes/reports.ts`:
 *   - User-facing:  POST /api/reports, GET /api/users/me/reports.
 *   - Admin:        GET /api/admin/reports, GET /api/admin/reports/:id,
 *                   POST /api/admin/reports/:id/process,
 *                   POST /api/admin/reports/:id/take-down.
 *
 * The admin client is in `./admin-reports.ts` — this file only exposes the
 * user-facing surface so that the public report button doesn't pull admin
 * helpers into client bundles.
 */

import { api } from './client'

export type ReportTargetType = 'POST' | 'COMMENT' | 'MESSAGE' | 'USER' | 'CREATOR'

export type ReportType =
  | 'CSAM'
  | 'ILLEGAL_CONTENT'
  | 'NON_CONSENSUAL_CONTENT'
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'SPAM'
  | 'IMPERSONATION'
  | 'COPYRIGHT'
  | 'UNDERAGE_USER'
  | 'OTHER'

export type ReportStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'RESOLVED_ACTION_TAKEN'
  | 'RESOLVED_NO_ACTION'
  | 'ESCALATED_LEGAL'
  | 'DUPLICATE'

export interface CreateReportInput {
  targetType: ReportTargetType
  targetId: string
  reportType: ReportType
  reason: string
  evidence?: string
}

export interface CreateReportResponse {
  reportId: string
  status: ReportStatus
  priority: number
  autoEscalated: boolean
  fraudIncidentId?: string
}

export interface MyReportRow {
  id: string
  targetType: ReportTargetType
  targetId: string
  reportType: ReportType
  reason: string
  status: ReportStatus
  priority: number
  resolution: string | null
  reviewedAt: string | null
  createdAt: string
}

export async function createReport(
  input: CreateReportInput,
  token?: string,
  signal?: AbortSignal
): Promise<CreateReportResponse> {
  return api<CreateReportResponse>('/reports', {
    method: 'POST',
    body: input,
    token,
    signal,
  })
}

export async function listMyReports(
  token: string,
  signal?: AbortSignal
): Promise<{ items: MyReportRow[]; count: number }> {
  return api('/users/me/reports', { method: 'GET', token, signal })
}

// ---------------------------------------------------------------------------
// Human-readable labels (for UI rendering)
// ---------------------------------------------------------------------------

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  CSAM: 'Material de abuso sexual infantil (CSAM)',
  ILLEGAL_CONTENT: 'Contenido ilegal',
  NON_CONSENSUAL_CONTENT: 'Contenido íntimo sin consentimiento',
  HARASSMENT: 'Acoso o amenazas',
  HATE_SPEECH: 'Discurso de odio o discriminación',
  SPAM: 'Spam o estafa',
  IMPERSONATION: 'Suplantación de identidad',
  COPYRIGHT: 'Infracción de derechos de autor',
  UNDERAGE_USER: 'Sospecha de menor de 18 años',
  OTHER: 'Otro',
}

export const REPORT_TARGET_TYPE_LABELS: Record<ReportTargetType, string> = {
  POST: 'Publicación',
  COMMENT: 'Comentario',
  MESSAGE: 'Mensaje',
  USER: 'Usuario',
  CREATOR: 'Creador',
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  RESOLVED_ACTION_TAKEN: 'Acción aplicada',
  RESOLVED_NO_ACTION: 'Sin acción',
  ESCALATED_LEGAL: 'Escalado legal',
  DUPLICATE: 'Duplicado',
}
