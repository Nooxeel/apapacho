'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button, Card } from '@/components/ui'
import { Upload, X, Video, Loader2, AlertCircle } from 'lucide-react'
import { API_URL } from '@/lib/config'
import { VisibilitySelector } from './VisibilitySelector'
import type { PostVisibility } from '@/types'

interface VideoUploadProps {
  onSuccess?: (videoUrl: string) => void
  onCancel?: () => void
}

export function VideoUpload({ onSuccess, onCancel }: VideoUploadProps) {
  const router = useRouter()
  const { token, user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<PostVisibility>('public')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionTiers, setSubscriptionTiers] = useState<any[]>([])
  const [loadingTiers, setLoadingTiers] = useState(true)

  // Cargar subscription tiers del creador
  useEffect(() => {
    const loadTiers = async () => {
      if (!token || !user?.isCreator) {
        setLoadingTiers(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/subscriptions/my-tiers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const tiers = await response.json()
          setSubscriptionTiers(tiers)
        }
      } catch (error) {
        console.error('Error loading tiers:', error)
      } finally {
        setLoadingTiers(false)
      }
    }

    loadTiers()
  }, [token, user])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor selecciona un archivo de video válido')
      return
    }

    // Validar tamaño (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      setError('El video no puede superar 500MB')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Crear preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
  }

  const handleUpload = async () => {
    if (!selectedFile || !token) return

    setUploading(true)
    setError(null)

    try {
      // 1. Subir el video
      const formData = new FormData()
      formData.append('video', selectedFile)

      const uploadRes = await fetch(`${API_URL}/posts/upload-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!uploadRes.ok) {
        throw new Error('Error al subir el video')
      }

      const { url: videoUrl } = await uploadRes.json()
      setUploadProgress(50)

      // 2. Crear el post con el video
      const postData = {
        title: title || 'Video sin título',
        description,
        content: [
          {
            type: 'video',
            url: videoUrl,
            thumbnail: null
          }
        ],
        visibility: visibility
      }

      const postRes = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (!postRes.ok) {
        throw new Error('Error al crear el post')
      }

      setUploadProgress(100)

      // Éxito
      if (onSuccess) {
        onSuccess(videoUrl)
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Error al subir el video')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card variant="solid" className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Subir Video</h2>
          <p className="text-white/60">
            Comparte tu contenido con tus seguidores
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* File Input */}
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center cursor-pointer hover:border-primary-500 transition-colors"
          >
            <Video className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <p className="text-white mb-2">Click para seleccionar video</p>
            <p className="text-sm text-white/40">MP4, WebM, MOV o MKV (máx. 500MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                src={preview || ''}
                controls
                className="w-full max-h-96 object-contain"
              />
              <button
                onClick={handleRemoveFile}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* File Info */}
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Video className="w-4 h-4" />
              <span>{selectedFile.name}</span>
              <span>({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          </div>
        )}

        {/* Form Fields */}
        {selectedFile && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dale un título a tu video..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu video..."
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>

            {/* Visibility Selector */}
            <VisibilitySelector
              value={visibility}
              onChange={setVisibility}
              disabled={uploading || loadingTiers}
              hasSubscriptionTiers={subscriptionTiers.length > 0}
            />
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Subiendo...</span>
              <span className="text-primary-400">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Subir Video
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={uploading}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
