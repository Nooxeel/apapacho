import { API_URL, ApiError, api } from './client'
import type { KycStatus } from './kyc'

export interface KycChecklistItem {
  code: string
  label: string
  blocking: boolean
  category: 'fraud' | 'quality'
}

export interface KycChecklistSection {
  sectionCode: string
  sectionLabel: string
  items: KycChecklistItem[]
}

export interface KycQueueRow {
  submissionId: string
  submittedAt: string
  hoursSinceSubmit: number
  isOverdue: boolean
  status: KycStatus
  decision: KycStatus | null
  fullLegalName: string
  ageYears: number
  creator: {
    id: string
    username: string
    displayName: string
    email: string
    avatar: string | null
  }
}

export interface KycQueueResponse {
  items: KycQueueRow[]
  count: number
}

export interface KycSubmissionDetail {
  submissionId: string
  status: KycStatus
  decision: KycStatus | null
  submittedAt: string
  hoursSinceSubmit: number
  isOverdue: boolean
  decidedAt: string | null
  rejectionReason: string | null
  notes: string | null
  fullLegalName: string
  nationalId: string
  birthdate: string
  ageYears: number
  consentSignedAt: string
  ipAddress: string | null
  userAgent: string | null
  creator: {
    id: string
    username: string
    displayName: string
    email: string
    avatar: string | null
    accountCreatedAt: string
  }
  evidence: {
    idFront: string
    idBack: string
    selfieWithId: string
  }
  history: Array<{
    id: string
    submittedAt: string
    decision: KycStatus | null
    decidedAt: string | null
    rejectionReason: string | null
  }>
  fraudIncidents: Array<{
    id: string
    triggerType: string
    severity: string
    status: string
    triggeredAt: string
    resolution: string | null
  }>
  checklist: KycChecklistSection[]
}

export async function getKycQueue(
  statusFilter: string[] = ['SUBMITTED', 'IN_REVIEW'],
  token?: string
): Promise<KycQueueResponse> {
  const qs = statusFilter.length > 0 ? `?status=${encodeURIComponent(statusFilter.join(','))}` : ''
  return api<KycQueueResponse>(`/admin/kyc/queue${qs}`, { method: 'GET', token })
}

export async function getKycSubmission(
  submissionId: string,
  token?: string
): Promise<KycSubmissionDetail> {
  return api<KycSubmissionDetail>(`/admin/kyc/${submissionId}`, { method: 'GET', token })
}

export async function refreshKycEvidenceUrl(
  submissionId: string,
  kind: 'idFront' | 'idBack' | 'selfieWithId',
  token?: string
): Promise<{ url: string; expiresInSeconds: number }> {
  return api<{ url: string; expiresInSeconds: number }>(
    `/admin/kyc/${submissionId}/evidence-url?kind=${kind}`,
    { method: 'GET', token }
  )
}

export async function approveKyc(
  submissionId: string,
  notes: string | undefined,
  token?: string
): Promise<{ ok: true; submissionId: string; status: 'APPROVED' }> {
  return api(`/admin/kyc/${submissionId}/approve`, {
    method: 'POST',
    body: { notes },
    token,
  })
}

export async function rejectKyc(
  submissionId: string,
  reason: string,
  canResubmit: boolean,
  notes: string | undefined,
  token?: string
): Promise<{ ok: true; submissionId: string; status: 'REJECTED' | 'RESUBMISSION_REQUIRED' }> {
  return api(`/admin/kyc/${submissionId}/reject`, {
    method: 'POST',
    body: { reason, canResubmit, notes },
    token,
  })
}

export async function freezeKycEvidence(
  submissionId: string,
  notes: string | undefined,
  token?: string
): Promise<{ incidentId: string; hash: string; publicId: string }> {
  return api(`/admin/kyc/${submissionId}/freeze-evidence`, {
    method: 'POST',
    body: { notes },
    token,
  })
}
