'use client'

import { useState, useEffect } from 'react'
import { socialLinksApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { SocialLink, SocialPlatform } from '@/types'
import { Plus, Trash2, GripVertical, Eye, EyeOff, ExternalLink, Save, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SocialLinksManagerProps {
  token: string
  onLinksChange?: (count: number) => void
}

export default function SocialLinksManager({ token, onLinksChange }: SocialLinksManagerProps) {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newLink, setNewLink] = useState({
    platform: '',
    url: '',
    label: '',
    icon: ''
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [token])

  useEffect(() => {
    if (onLinksChange) {
      onLinksChange(links.length)
    }
  }, [links.length, onLinksChange])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [linksData, platformsData] = await Promise.all([
        socialLinksApi.getMySocialLinks(token),
        socialLinksApi.getPlatforms()
      ])

      setLinks(linksData)
      setPlatforms(platformsData)
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar enlaces'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLink = async () => {
    if (!newLink.platform || !newLink.url) {
      setError('Plataforma y URL son requeridos')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      let finalUrl = newLink.url

      // Validar y procesar según la plataforma
      if (newLink.platform.toLowerCase() === 'email') {
        // Validar que sea un email válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newLink.url)) {
          setError('Correo electrónico inválido')
          setIsSaving(false)
          return
        }
        // Agregar mailto: si no lo tiene
        if (!newLink.url.startsWith('mailto:')) {
          finalUrl = `mailto:${newLink.url}`
        }
      } else {
        // Validar URL normal para otras plataformas
        try {
          new URL(newLink.url)
        } catch {
          setError('URL inválida')
          setIsSaving(false)
          return
        }
      }

      const created = await socialLinksApi.create(
        {
          platform: newLink.platform,
          url: finalUrl,
          label: newLink.label || undefined,
          icon: newLink.icon || undefined
        },
        token
      )

      setLinks([...links, created])
      setNewLink({ platform: '', url: '', label: '', icon: '' })
      setIsAdding(false)
      setSuccess('Enlace agregado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Error al agregar enlace'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateLink = async (id: string, data: Partial<SocialLink>) => {
    setIsSaving(true)
    setError(null)

    try {
      const updated = await socialLinksApi.update(id, data, token)
      setLinks(links.map(link => link.id === id ? updated : link))
      setEditingId(null)
      setSuccess('Enlace actualizado')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Error al actualizar enlace'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm('¿Eliminar este enlace?')) return

    setIsSaving(true)
    setError(null)

    try {
      await socialLinksApi.delete(id, token)
      setLinks(links.filter(link => link.id !== id))
      setSuccess('Enlace eliminado')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Error al eliminar enlace'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    await handleUpdateLink(id, { isVisible: !isVisible })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newLinks = [...links]
    const draggedItem = newLinks[draggedIndex]
    newLinks.splice(draggedIndex, 1)
    newLinks.splice(index, 0, draggedItem)

    setLinks(newLinks)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    setDraggedIndex(null)
    setIsSaving(true)

    try {
      const linkIds = links.map(link => link.id)
      await socialLinksApi.reorder(linkIds, token)
      setSuccess('Orden actualizado')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Error al reordenar'))
      // Reload to restore original order
      await loadData()
    } finally {
      setIsSaving(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    const found = platforms.find(p => p.value === platform.toLowerCase())
    return found?.icon || '🔗'
  }

  if (isLoading) {
    return (
      <Card variant="glass">
        <div className="p-6 text-center text-white/70">
          Cargando enlaces...
        </div>
      </Card>
    )
  }

  return (
    <Card variant="glass">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Enlaces Sociales</h2>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            variant="primary"
            size="sm"
            disabled={links.length >= 10}
          >
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
            {success}
          </div>
        )}

        {/* Add New Link Form */}
        {isAdding && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Plataforma *
                </label>
                <select
                  value={newLink.platform}
                  onChange={(e) => {
                    const platform = platforms.find(p => p.value === e.target.value)
                    setNewLink({
                      ...newLink,
                      platform: e.target.value,
                      icon: platform?.icon || ''
                    })
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="">Seleccionar plataforma</option>
                  {platforms.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.icon} {platform.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  URL *
                </label>
                <input
                  type={newLink.platform.toLowerCase() === 'email' ? 'email' : 'url'}
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder={newLink.platform.toLowerCase() === 'email' ? 'ejemplo@correo.com' : 'https://...'}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Texto personalizado (opcional)
                </label>
                <input
                  type="text"
                  value={newLink.label}
                  onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  placeholder="Ej: Sígueme en Instagram"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddLink}
                  variant="primary"
                  disabled={isSaving || !newLink.platform || !newLink.url}
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false)
                    setNewLink({ platform: '', url: '', label: '', icon: '' })
                  }}
                  variant="secondary"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Links List */}
        {links.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            No has agregado enlaces aún.
            <br />
            <span className="text-sm">Máximo 10 enlaces permitidos</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-white/50 mb-3">
              Arrastra para reordenar • Máximo 10 enlaces ({links.length}/10)
            </p>

            {links.map((link, index) => (
              <div
                key={link.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  p-4 rounded-lg border cursor-move transition-all
                  ${draggedIndex === index ? 'bg-white/20 border-fuchsia-500' : 'bg-white/5 border-white/10'}
                  ${!link.isVisible ? 'opacity-50' : ''}
                  hover:bg-white/10
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <GripVertical className="w-5 h-5 text-white/30 flex-shrink-0" />

                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">
                    {link.icon || getPlatformIcon(link.platform)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {link.label || link.platform}
                      </span>
                      {!link.isVisible && (
                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/50">
                          Oculto
                        </span>
                      )}
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/50 hover:text-fuchsia-400 flex items-center gap-1 truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link.url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleVisibility(link.id, link.isVisible)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                      title={link.isVisible ? 'Ocultar' : 'Mostrar'}
                    >
                      {link.isVisible ? (
                        <Eye className="w-4 h-4 text-white/70" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-white/50" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-200">
            💡 <strong>Tip:</strong> Los enlaces se mostrarán en tu perfil público en el orden que los organices aquí. Los enlaces ocultos no se mostrarán a los visitantes.
          </p>
        </div>
      </div>
    </Card>
  )
}
