'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Ticket, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Edit3,
  Percent,
  DollarSign,
  Gift,
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  X
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { promocodesApi } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'

type PromocodeType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL'

interface Promocode {
  id: string
  code: string
  type: PromocodeType
  value: number
  currency: string
  maxUses: number | null
  currentUses: number
  maxUsesPerUser: number
  minPurchase: number | null
  applicableTiers: string[]
  startsAt: string
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  totalRedemptions: number
  isExpired: boolean
  isMaxedOut: boolean
}

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  token: string
}

function CreatePromocodeModal({ isOpen, onClose, onCreated, token }: CreateModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENTAGE' as PromocodeType,
    value: '',
    maxUses: '',
    maxUsesPerUser: '1',
    minPurchase: '',
    expiresAt: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await promocodesApi.create({
        code: form.code || undefined,
        type: form.type,
        value: parseFloat(form.value),
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        maxUsesPerUser: form.maxUsesPerUser ? parseInt(form.maxUsesPerUser) : 1,
        minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : undefined,
        expiresAt: form.expiresAt || undefined
      }, token)

      onCreated()
      onClose()
      setForm({
        code: '',
        type: 'PERCENTAGE',
        value: '',
        maxUses: '',
        maxUsesPerUser: '1',
        minPurchase: '',
        expiresAt: ''
      })
    } catch (err: any) {
      setError(err.message || 'Error al crear promocode')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Nuevo Promocode</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Código (opcional - se genera automáticamente)
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="VERANO2024"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de descuento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'PERCENTAGE', label: 'Porcentaje', icon: Percent },
                { value: 'FIXED_AMOUNT', label: 'Monto Fijo', icon: DollarSign },
                { value: 'FREE_TRIAL', label: 'Días Gratis', icon: Gift }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: type.value as PromocodeType })}
                  className={`p-3 rounded-lg border transition flex flex-col items-center gap-1 ${
                    form.type === type.value
                      ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <type.icon className="w-5 h-5" />
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {form.type === 'PERCENTAGE' ? 'Porcentaje de descuento' : 
               form.type === 'FIXED_AMOUNT' ? 'Monto de descuento ($)' : 
               'Días gratis'}
            </label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === 'PERCENTAGE' ? '20' : form.type === 'FIXED_AMOUNT' ? '5000' : '7'}
              min="1"
              max={form.type === 'PERCENTAGE' ? '100' : undefined}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Usos máximos
              </label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Sin límite"
                min="1"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Por usuario
              </label>
              <input
                type="number"
                value={form.maxUsesPerUser}
                onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
                placeholder="1"
                min="1"
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Compra mínima ($)
              </label>
              <input
                type="number"
                value={form.minPurchase}
                onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                placeholder="Sin mínimo"
                min="0"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Expira
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !form.value}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Código'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PromocodesPage() {
  const router = useRouter()
  const { token, user, hasHydrated } = useAuthStore()
  const [promocodes, setPromocodes] = useState<Promocode[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })

  // Proteger ruta
  useEffect(() => {
    if (!hasHydrated) return
    if (!token || !user?.isCreator) {
      router.push('/login')
    }
  }, [token, user, hasHydrated, router])

  const fetchPromocodes = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await promocodesApi.list(token, pagination.page, 20, filter === 'all' ? undefined : filter)
      setPromocodes(response.promocodes)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error fetching promocodes:', error)
    } finally {
      setLoading(false)
    }
  }, [token, pagination.page, filter])

  useEffect(() => {
    fetchPromocodes()
  }, [fetchPromocodes])

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleActive = async (promocode: Promocode) => {
    if (!token) return
    try {
      await promocodesApi.update(promocode.id, { isActive: !promocode.isActive }, token)
      fetchPromocodes()
    } catch (error) {
      console.error('Error toggling promocode:', error)
    }
  }

  const handleDelete = async (promocode: Promocode) => {
    if (!token) return
    if (!confirm(`¿Desactivar el código "${promocode.code}"?`)) return
    try {
      await promocodesApi.delete(promocode.id, token)
      fetchPromocodes()
    } catch (error) {
      console.error('Error deleting promocode:', error)
    }
  }

  const getTypeIcon = (type: PromocodeType) => {
    switch (type) {
      case 'PERCENTAGE': return <Percent className="w-4 h-4" />
      case 'FIXED_AMOUNT': return <DollarSign className="w-4 h-4" />
      case 'FREE_TRIAL': return <Gift className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: PromocodeType, value: number) => {
    switch (type) {
      case 'PERCENTAGE': return `${value}% off`
      case 'FIXED_AMOUNT': return `$${value.toLocaleString('es-CL')} off`
      case 'FREE_TRIAL': return `${value} días gratis`
    }
  }

  const getStatusBadge = (promo: Promocode) => {
    if (!promo.isActive || promo.isExpired) {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-600 text-gray-300">Inactivo</span>
    }
    if (promo.isMaxedOut) {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-600 text-yellow-200">Agotado</span>
    }
    return <span className="px-2 py-0.5 rounded-full text-xs bg-green-600 text-green-200">Activo</span>
  }

  const filteredPromocodes = promocodes.filter(p => 
    search ? p.code.toLowerCase().includes(search.toLowerCase()) : true
  )

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-7 h-7 text-pink-500" />
              Códigos Promocionales
            </h1>
            <p className="text-gray-400 mt-1">
              Crea y administra códigos de descuento para tus suscriptores
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Nuevo Código
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar código..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'expired'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPagination(p => ({ ...p, page: 1 })) }}
                className={`px-4 py-2.5 rounded-lg font-medium transition ${
                  filter === f
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Expirados'}
              </button>
            ))}
          </div>
        </div>

        {/* Promocodes List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : filteredPromocodes.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {search ? 'No se encontraron códigos' : 'Aún no tienes códigos promocionales'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
              >
                Crear tu primer código
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPromocodes.map((promo) => (
              <div
                key={promo.id}
                className={`bg-gray-800/50 border rounded-xl p-4 transition ${
                  promo.isActive && !promo.isExpired && !promo.isMaxedOut
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-800 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-pink-500/20 rounded-lg text-pink-400">
                      {getTypeIcon(promo.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-lg">{promo.code}</span>
                        <button
                          onClick={() => handleCopyCode(promo.code)}
                          className="p-1 hover:bg-gray-700 rounded transition"
                          title="Copiar código"
                        >
                          {copiedCode === promo.code ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        {getStatusBadge(promo)}
                      </div>
                      <p className="text-pink-400 font-medium">
                        {getTypeLabel(promo.type, promo.value)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5" title="Usos">
                      <Users className="w-4 h-4" />
                      <span>
                        {promo.currentUses}
                        {promo.maxUses ? `/${promo.maxUses}` : ''}
                      </span>
                    </div>
                    
                    {promo.expiresAt && (
                      <div className="flex items-center gap-1.5" title="Expira">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(promo.expiresAt).toLocaleDateString('es-CL')}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(promo)}
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition"
                        title={promo.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {promo.isActive ? (
                          <ToggleRight className="w-6 h-6 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(promo)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition text-gray-400 hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Extra info row */}
                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-500">
                  <span>Creado: {new Date(promo.createdAt).toLocaleDateString('es-CL')}</span>
                  {promo.minPurchase && <span>Mínimo: ${promo.minPurchase.toLocaleString('es-CL')}</span>}
                  <span>Máx por usuario: {promo.maxUsesPerUser}</span>
                  <span>Total canjeados: {promo.totalRedemptions}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(p => ({ ...p, page }))}
                className={`px-3 py-1.5 rounded-lg transition ${
                  pagination.page === page
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreatePromocodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchPromocodes}
        token={token || ''}
      />
    </div>
  )
}
