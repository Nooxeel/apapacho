'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useAuthStore } from '@/stores'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export function ImageUpload() {
  const { token } = useAuthStore()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('La imagen no puede superar los 50MB')
      return
    }

    setSelectedFile(file)
    
    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !token) return

    try {
      setUploading(true)
      setUploadProgress(0)

      // Subir archivo
      const formData = new FormData()
      formData.append('image', selectedFile)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setUploadProgress(Math.round(progress))
        }
      })

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            resolve(response.url)
          } else {
            reject(new Error('Upload failed'))
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
      })

      xhr.open('POST', `${API_URL}/posts/upload-image`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(formData)

      const imageUrl = await uploadPromise
      setUploadedUrl(imageUrl)

      // Crear post con la imagen
      const postResponse = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title || null,
          description: description || null,
          content: [{
            type: 'image',
            url: imageUrl,
            thumbnail: null
          }],
          visibility: 'public'
        })
      })

      if (!postResponse.ok) {
        throw new Error('Failed to create post')
      }

      alert('¡Imagen subida exitosamente!')
      
      // Reset form
      setSelectedFile(null)
      setPreview(null)
      setTitle('')
      setDescription('')
      setUploadedUrl(null)
      setUploadProgress(0)

    } catch (error) {
      console.error('Upload error:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreview(null)
    setUploadProgress(0)
  }

  return (
    <div className="space-y-6">
      <Card variant="solid" className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Subir Imagen</h2>

        {/* File Upload Area */}
        {!selectedFile ? (
          <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-white/40 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white/60" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white mb-1">
                    Haz clic para seleccionar una imagen
                  </p>
                  <p className="text-sm text-white/60">
                    JPG, PNG, GIF o WebP (máx. 50MB)
                  </p>
                </div>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black">
              {preview && (
                <img 
                  src={preview} 
                  alt="Preview"
                  className="w-full max-h-[500px] object-contain"
                />
              )}
              <button
                onClick={handleRemove}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Info */}
            <div className="flex items-center gap-3 text-sm text-white/60">
              <ImageIcon className="w-4 h-4" />
              <span>{selectedFile.name}</span>
              <span>({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la imagen"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu imagen..."
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none"
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Subiendo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-fuchsia-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Subiendo...' : 'Publicar Imagen'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
