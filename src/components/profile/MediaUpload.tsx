'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button, Card } from '@/components/ui'
import { Upload, X, Image as ImageIcon, Video, Loader2, AlertCircle } from 'lucide-react'
import { API_URL } from '@/lib/config'
import { VisibilitySelector } from './VisibilitySelector'
import type { PostVisibility } from '@/types'

interface MediaUploadProps {
  onSuccess?: (url: string) => void
  onCancel?: () => void
}

export function MediaUpload({ onSuccess, onCancel }: MediaUploadProps) {
  const router = useRouter()
  const { token, user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<PostVisibility>('public')
  const [price, setPrice] = useState<number>(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionTiers, setSubscriptionTiers] = useState<any[]>([])
  const [loadingTiers, setLoadingTiers] = useState(true)
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null)

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

    // Determinar tipo de archivo
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      setError('Por favor selecciona una imagen o video válido')
      return
    }

    // Validar tamaño según el tipo
    const maxSize = isVideo ? 500 * 1024 * 1024 : 50 * 1024 * 1024 // 500MB video, 50MB imagen
    if (file.size > maxSize) {
      const maxSizeMB = isVideo ? 500 : 50
      setError(`El archivo no puede superar ${maxSizeMB}MB`)
      return
    }

    setSelectedFile(file)
    setFileType(isVideo ? 'video' : 'image')
    setError(null)

    // Crear preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
  }

  const handleUpload = async () => {
    if (!selectedFile || !token || !fileType) return

    setUploading(true)
    setError(null)

    try {
      // 1. Subir el archivo
      const formData = new FormData()
      const fieldName = fileType === 'video' ? 'video' : 'image'
      formData.append(fieldName, selectedFile)

      const endpoint = fileType === 'video' ? '/posts/upload-video' : '/posts/upload-image'
      const uploadRes = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!uploadRes.ok) {
        throw new Error(`Error al subir el ${fileType === 'video' ? 'video' : 'imagen'}`)
      }

      const { url: mediaUrl } = await uploadRes.json()
      setUploadProgress(50)

      // 2. Crear el post con el archivo
      const postData = {
        title: title || (fileType === 'video' ? 'Video sin título' : null),
        description: description || null,
        content: [
          {
            type: fileType,
            url: mediaUrl,
            thumbnail: null
          }
        ],
        visibility: visibility,
        price: visibility === 'ppv' ? price : null
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
      alert(`¡${fileType === 'video' ? 'Video' : 'Imagen'} subida exitosamente!`)
      
      if (onSuccess) {
        onSuccess(mediaUrl)
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setFileType(null)
    setUploadProgress(0)
    setError(null)
  }

  const getFileIcon = () => {
    if (!fileType) return <Upload className="w-16 h-16 text-white/40" />
    return fileType === 'video' 
      ? <Video className="w-16 h-16 text-purple-400" />
      : <ImageIcon className="w-16 h-16 text-pink-400" />
  }

  return (
    <Card variant="solid" className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Subir Contenido</h2>

      <div className="space-y-6">
        {/* Error Message */}
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
            {getFileIcon()}
            <p className="text-white mb-2 mt-4">Click para seleccionar imagen o video</p>
            <p className="text-sm text-white/40">
              <span className="text-pink-400">Imágenes:</span> JPG, PNG, GIF, WebP (máx. 50MB)<br />
              <span className="text-purple-400">Videos:</span> MP4, WebM, MOV, MKV (máx. 500MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black">
              {fileType === 'video' ? (
                <video
                  src={preview || ''}
                  controls
                  className="w-full max-h-96 object-contain"
                />
              ) : (
                <img
                  src={preview || ''}
                  alt="Preview"
                  className="w-full max-h-96 object-contain"
                />
              )}
              <button
                onClick={handleRemoveFile}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* File Info */}
            <div className="flex items-center gap-3 text-sm text-white/60">
              {fileType === 'video' ? (
                <Video className="w-4 h-4 text-purple-400" />
              ) : (
                <ImageIcon className="w-4 h-4 text-pink-400" />
              )}
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
                Título {fileType === 'video' && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Dale un título a tu ${fileType === 'video' ? 'video' : 'imagen'}...`}
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
                placeholder={`Describe tu ${fileType === 'video' ? 'video' : 'imagen'}...`}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>

            {/* Visibility Selector */}
            <VisibilitySelector
              value={visibility}
              onChange={setVisibility}
              hasSubscriptionTiers={subscriptionTiers.length > 0}
              price={price}
              onPriceChange={setPrice}
            />
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/60">
              <span>Subiendo...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
                Publicar {fileType === 'video' ? 'Video' : fileType === 'image' ? 'Imagen' : 'Contenido'}
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
