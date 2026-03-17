import { api } from './client'

// Watermark API
export interface WatermarkSettings {
  enabled: boolean
  text: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  opacity: number
  size: 'small' | 'medium' | 'large'
}

export const watermarkApi = {
  // Get watermark settings
  getSettings: (token: string) =>
    api<{ settings: WatermarkSettings }>('/watermark/settings', { token }),

  // Update watermark settings
  updateSettings: (settings: Partial<WatermarkSettings>, token: string) =>
    api<{ success: boolean; settings: WatermarkSettings }>('/watermark/settings', {
      method: 'PUT',
      body: settings,
      token
    }),

  // Apply watermark to URL
  applyWatermark: (url: string, creatorId: string, contentType?: 'image' | 'video') =>
    api<{ url: string; hasWatermark: boolean }>('/watermark/apply', {
      method: 'POST',
      body: { url, creatorId, contentType }
    }),

  // Preview watermark
  preview: (settings: Partial<WatermarkSettings>, sampleUrl: string | undefined, token: string) =>
    api<{ originalUrl: string; watermarkedUrl: string; settings: WatermarkSettings }>('/watermark/preview', {
      method: 'POST',
      body: { settings, sampleUrl },
      token
    }),
}

// ====================
// PLATFORM IMPORT API
// ====================

export interface ImportPlatformInfo {
  id: string
  name: string
  icon: string
  description: string
  supported: string[]
}

export interface PlatformImport {
  id: string
  platform: 'ONLYFANS' | 'ARSMATE' | 'FANSLY' | 'OTHER'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'CANCELLED'
  profileImported: boolean
  postsImported: number
  mediaImported: number
  errorsCount: number
  errorLog: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export const importApi = {
  // Get supported platforms
  getPlatforms: () =>
    api<{ platforms: ImportPlatformInfo[] }>('/import/platforms'),

  // Get import history
  getImports: (token: string) =>
    api<{ imports: PlatformImport[] }>('/import', { token }),

  // Start a new import
  startImport: (platform: string, data: Record<string, unknown>, token: string) =>
    api<{ success: boolean; importId: string; message: string }>('/import/start', {
      method: 'POST',
      body: { platform, data },
      token
    }),

  // Import profile data directly
  importProfile: (platform: string, profileData: Record<string, unknown>, token: string) =>
    api<{ success: boolean; message: string; imported: Record<string, unknown> }>('/import/profile', {
      method: 'POST',
      body: { platform, profileData },
      token
    }),

  // Get import status
  getImportStatus: (importId: string, token: string) =>
    api<{ import: PlatformImport }>(`/import/${importId}`, { token }),

  // Cancel import
  cancelImport: (importId: string, token: string) =>
    api<{ success: boolean; message: string }>(`/import/${importId}`, {
      method: 'DELETE',
      token
    }),
}
