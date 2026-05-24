/**
 * Admin-side moderation reports API client.
 *
 * Wraps `/api/admin/reports/*` endpoints. Used only inside `/admin/reports`
 * pages (gated by the admin layout SUPER_ADMIN check).
 */

import { api } from './client'
import type {
  ReportStatus,
  ReportTargetType,
  ReportType,
} from './reports'

export type {
  ReportStatus,
  ReportTargetType,
  ReportType,
} from './reports'

export interface AdminReportRow {
  id: string
  reporterId: string | null
  targetType: ReportTargetType
  targetId: string
  targetUserId: string | null
  reportType: ReportType
  reason: string
  evidence: string | null
  status: ReportStatus
  priority: number
  ipAddress: string | null
  userAgent: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  resolution: string | null
  fraudIncidentId: string | null
  createdAt: string
  updatedAt: string
  reporter: {
    id: string
    username: string
    displayName: string
    email: string
    avatar: string | null
  } | null
}

export interface AdminReportsListResponse {
  items: AdminReportRow[]
  total: number
  page: number
  pageSize: number
}

export interface AdminReportDetail {
  report: AdminReportRow & {
    fraudIncident: unknown | null
  }
  targetPreview: unknown | null
  relatedReports: Array<{
    id: string
    reportType: ReportType
    status: ReportStatus
    createdAt: string
    reporterId: string | null
  }>
}

export interface AdminReportsFilters {
  status?: ReportStatus[]
  type?: ReportType[]
  targetType?: ReportTargetType[]
  priority?: number[]
  page?: number
  pageSize?: number
}

function buildQuery(filters: AdminReportsFilters): string {
  const qs = new URLSearchParams()
  if (filters.status?.length) qs.set('status', filters.status.join(','))
  if (filters.type?.length) qs.set('type', filters.type.join(','))
  if (filters.targetType?.length) qs.set('targetType', filters.targetType.join(','))
  if (filters.priority?.length) qs.set('priority', filters.priority.join(','))
  if (filters.page) qs.set('page', String(filters.page))
  if (filters.pageSize) qs.set('pageSize', String(filters.pageSize))
  return qs.toString()
}

export async function getAdminReports(
  filters: AdminReportsFilters,
  token: string
): Promise<AdminReportsListResponse> {
  const qs = buildQuery(filters)
  const path = qs ? `/admin/reports?${qs}` : '/admin/reports'
  return api(path, { method: 'GET', token })
}

export async function getAdminReportDetail(
  id: string,
  token: string
): Promise<AdminReportDetail> {
  return api(`/admin/reports/${encodeURIComponent(id)}`, {
    method: 'GET',
    token,
  })
}

export type AdminProcessAction =
  | 'take_action'
  | 'dismiss'
  | 'escalate_legal'
  | 'mark_duplicate'

export async function processAdminReport(
  id: string,
  payload: { action: AdminProcessAction; resolution?: string },
  token: string
) {
  return api<{ ok: true; report: AdminReportRow; transitionApplied: boolean }>(
    `/admin/reports/${encodeURIComponent(id)}/process`,
    { method: 'POST', body: payload, token }
  )
}

export async function takeDownAdminReport(
  id: string,
  payload: { resolution?: string },
  token: string
) {
  return api<{ ok: true; report: AdminReportRow; action: string }>(
    `/admin/reports/${encodeURIComponent(id)}/take-down`,
    { method: 'POST', body: payload, token }
  )
}

export const PRIORITY_LABELS: Record<number, string> = {
  0: 'Normal',
  1: 'Alto',
  2: 'Urgente',
}
