'use client'

import { useState, useEffect } from 'react'
import { subscriptionsApi } from '@/lib/api'
import { Plus, Trash2, Edit2, Save, X, DollarSign, Users, Crown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SubscriptionTier {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  benefits: string
  isActive: boolean
  order: number
}

interface SubscriptionTiersManagerProps {
  token: string
}

export default function SubscriptionTiersManager({ token }: SubscriptionTiersManagerProps) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newTier, setNewTier] = useState({
    name: '',
    description: '',
    price: '',
    benefits: ''
  })
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    price: '',
    benefits: ''
  })

  useEffect(() => {
    loadTiers()
  }, [token])

  const loadTiers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await subscriptionsApi.getMyTiers(token)
      setTiers(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar planes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTier = async () => {
    if (!newTier.name || !newTier.price) {
      setError('Nombre y precio son requeridos')
      return
    }

    const price = parseFloat(newTier.price)
    if (isNaN(price) || price < 0) {
      setError('Precio inválido')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const created = await subscriptionsApi.createTier({
        name: newTier.name,
        description: newTier.description || undefined,
        price,
        currency: 'CLP',
        benefits: newTier.benefits || ''
      }, token)

      setTiers([...tiers, created])
      setNewTier({ name: '', description: '', price: '', benefits: '' })
      setIsAdding(false)
      setSuccess('Plan creado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al crear plan')
    } finally {
      setIsSaving(false)
    }
  }

  const startEditing = (tier: SubscriptionTier) => {
    setEditingId(tier.id)
    setEditData({
      name: tier.name,
      description: tier.description || '',
      price: tier.price.toString(),
      benefits: tier.benefits
    })
  }

  const handleUpdateTier = async (tierId: string) => {
    if (!editData.name || !editData.price) {
      setError('Nombre y precio son requeridos')
      return
    }

    const price = parseFloat(editData.price)
    if (isNaN(price) || price < 0) {
      setError('Precio inválido')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const updated = await subscriptionsApi.updateTier(tierId, {
        name: editData.name,
        description: editData.description || undefined,
        price,
        benefits: editData.benefits
      }, token)

      setTiers(tiers.map(t => t.id === tierId ? updated : t))
      setEditingId(null)
      setSuccess('Plan actualizado')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('¿Eliminar este plan de suscripción?')) return

    setIsSaving(true)
    setError(null)

    try {
      await subscriptionsApi.deleteTier(tierId, token)
      setTiers(tiers.filter(t => t.id !== tierId))
      setSuccess('Plan eliminado')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al eliminar plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (tier: SubscriptionTier) => {
    setIsSaving(true)
    try {
      const updated = await subscriptionsApi.updateTier(tier.id, {
        isActive: !tier.isActive
      }, token)
      setTiers(tiers.map(t => t.id === tier.id ? updated : t))
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado')
    } finally {
      setIsSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (isLoading) {
    return (
      <Card variant="glass">
        <div className="p-6 text-center text-white/70">
          Cargando planes...
        </div>
      </Card>
    )
  }

  return (
    <Card variant="glass">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Planes de Suscripción</h2>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            variant="primary"
            size="sm"
            disabled={tiers.length >= 3}
          >
            <Plus className="w-4 h-4" />
            Agregar Plan
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

        {/* Add New Tier Form */}
        {isAdding && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-semibold text-white mb-4">Nuevo Plan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nombre del plan *
                </label>
                <input
                  type="text"
                  value={newTier.name}
                  onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                  placeholder="Ej: Premium, VIP, Exclusivo"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Precio mensual (CLP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
                  <input
                    type="number"
                    value={newTier.price}
                    onChange={(e) => setNewTier({ ...newTier, price: e.target.value })}
                    placeholder="4990"
                    min="0"
                    className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
                <p className="text-xs text-white/40 mt-1">El precio debe ser en pesos chilenos</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={newTier.description}
                  onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                  placeholder="Acceso a contenido exclusivo..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Beneficios (uno por línea)
                </label>
                <textarea
                  value={newTier.benefits}
                  onChange={(e) => setNewTier({ ...newTier, benefits: e.target.value })}
                  placeholder="Fotos exclusivas&#10;Videos detrás de cámaras&#10;Mensajes directos&#10;Contenido anticipado"
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddTier} variant="primary" disabled={isSaving}>
                  <Save className="w-4 h-4" />
                  Guardar
                </Button>
                <Button onClick={() => setIsAdding(false)} variant="ghost">
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Tiers */}
        {tiers.length === 0 && !isAdding ? (
          <div className="text-center py-8">
            <Crown className="w-12 h-12 mx-auto mb-3 text-white/30" />
            <p className="text-white/50 mb-2">No tienes planes de suscripción</p>
            <p className="text-sm text-white/30">Crea un plan para que tus fans puedan suscribirse</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`p-4 rounded-lg border transition-all ${
                  tier.isActive 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white/2 border-white/5 opacity-60'
                }`}
              >
                {editingId === tier.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-fuchsia-500"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                    <input
                      type="text"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      placeholder="Descripción"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-500"
                    />
                    <textarea
                      value={editData.benefits}
                      onChange={(e) => setEditData({ ...editData, benefits: e.target.value })}
                      placeholder="Beneficios (uno por línea)"
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdateTier(tier.id)} variant="primary" size="sm" disabled={isSaving}>
                        <Save className="w-4 h-4" />
                        Guardar
                      </Button>
                      <Button onClick={() => setEditingId(null)} variant="ghost" size="sm">
                        <X className="w-4 h-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{tier.name}</h3>
                        {!tier.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/50">Inactivo</span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-fuchsia-400 mt-1">
                        {formatPrice(tier.price)}
                        <span className="text-sm font-normal text-white/50">/mes</span>
                      </p>
                      {tier.description && (
                        <p className="text-sm text-white/60 mt-1">{tier.description}</p>
                      )}
                      {tier.benefits && (
                        <div className="mt-2 text-sm text-white/50">
                          {tier.benefits.split('\n').map((benefit, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-green-400">✓</span> {benefit}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(tier)}
                        className={`p-2 rounded-lg transition-colors ${
                          tier.isActive 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                        title={tier.isActive ? 'Desactivar' : 'Activar'}
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditing(tier)}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-white/70" />
                      </button>
                      <button
                        onClick={() => handleDeleteTier(tier.id)}
                        className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-white/40 mt-4">
          💡 Puedes crear hasta 3 planes de suscripción. Los pagos se procesan en CLP (pesos chilenos).
        </p>
      </div>
    </Card>
  )
}
