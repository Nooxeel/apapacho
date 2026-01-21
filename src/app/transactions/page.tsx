'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar,
  ChevronDown,
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Gift,
  Loader2,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'

interface Counterparty {
  id: string
  username: string
  displayName: string
  avatar?: string | null
}

interface Transaction {
  id: string
  type: 
    | 'subscription_payment'
    | 'subscription_income'
    | 'donation_sent'
    | 'donation_received'
    | 'ppv_purchase'
    | 'ppv_income'
    | 'tip_sent'
    | 'tip_received'
    | 'payout'
    | 'refund'
  amount: number
  currency: string
  description: string
  status: string
  createdAt: string
  counterparty?: Counterparty
  post?: { id: string; title: string | null }
  tier?: { id: string; name: string }
  platformFee?: number
  netAmount?: number
}

interface TransactionSummary {
  period: number
  outgoing: { total: number; count: number }
  incoming?: {
    gross: number
    subscriptions: number
    donations: number
    ppv: number
    tips: number
  }
}

const transactionTypeConfig: Record<string, {
  icon: React.ElementType
  label: string
  colorClass: string
  isIncoming: boolean
}> = {
  subscription_payment: {
    icon: CreditCard,
    label: 'Suscripción',
    colorClass: 'text-orange-400 bg-orange-400/10',
    isIncoming: false
  },
  subscription_income: {
    icon: Star,
    label: 'Suscripción recibida',
    colorClass: 'text-green-400 bg-green-400/10',
    isIncoming: true
  },
  donation_sent: {
    icon: Gift,
    label: 'Donación enviada',
    colorClass: 'text-pink-400 bg-pink-400/10',
    isIncoming: false
  },
  donation_received: {
    icon: Gift,
    label: 'Donación recibida',
    colorClass: 'text-green-400 bg-green-400/10',
    isIncoming: true
  },
  ppv_purchase: {
    icon: ShoppingCart,
    label: 'Compra de contenido',
    colorClass: 'text-purple-400 bg-purple-400/10',
    isIncoming: false
  },
  ppv_income: {
    icon: ShoppingCart,
    label: 'Venta de contenido',
    colorClass: 'text-green-400 bg-green-400/10',
    isIncoming: true
  },
  tip_sent: {
    icon: DollarSign,
    label: 'Propina enviada',
    colorClass: 'text-yellow-400 bg-yellow-400/10',
    isIncoming: false
  },
  tip_received: {
    icon: DollarSign,
    label: 'Propina recibida',
    colorClass: 'text-green-400 bg-green-400/10',
    isIncoming: true
  },
  payout: {
    icon: Wallet,
    label: 'Retiro',
    colorClass: 'text-blue-400 bg-blue-400/10',
    isIncoming: false
  },
  refund: {
    icon: RefreshCw,
    label: 'Reembolso',
    colorClass: 'text-gray-400 bg-gray-400/10',
    isIncoming: true
  }
}

function formatCurrency(amount: number, currency: string = 'CLP'): string {
  if (currency === 'CLP') {
    return `$${amount.toLocaleString('es-CL')}`
  }
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(amount)
}

export default function TransactionsPage() {
  const router = useRouter()
  const { token, user, hasHydrated } = useAuthStore()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all')
  const [period, setPeriod] = useState(30)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [isCreator, setIsCreator] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const fetchTransactions = useCallback(async (reset = false) => {
    if (!token) return
    
    if (reset) {
      setLoading(true)
      setOffset(0)
    } else {
      setLoadingMore(true)
    }

    try {
      const currentOffset = reset ? 0 : offset
      const data = await api<{
        transactions: Transaction[]
        total: number
        hasMore: boolean
        isCreator: boolean
      }>(`/transactions/history?type=${filter}&limit=20&offset=${currentOffset}`, { token })

      if (reset) {
        setTransactions(data.transactions)
      } else {
        setTransactions(prev => [...prev, ...data.transactions])
      }
      
      setHasMore(data.hasMore)
      setIsCreator(data.isCreator)
      setOffset(currentOffset + data.transactions.length)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [token, filter, offset])

  const fetchSummary = useCallback(async () => {
    if (!token) return
    
    try {
      const data = await api<TransactionSummary>(`/transactions/summary?period=${period}`, { token })
      setSummary(data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }, [token, period])

  // Auth check
  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login')
    }
  }, [token, hasHydrated, router])

  // Fetch data
  useEffect(() => {
    if (token) {
      fetchTransactions(true)
      fetchSummary()
    }
  }, [token, filter, period])

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Historial de Transacciones</h1>
              <p className="text-sm text-white/60">
                {isCreator ? 'Ingresos y gastos' : 'Tus pagos realizados'}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-3">
              {/* Type filter - only for creators */}
              {isCreator && (
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                  {(['all', 'incoming', 'outgoing'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-3 py-1.5 text-sm transition-colors ${
                        filter === type 
                          ? 'bg-fuchsia-500 text-white' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {type === 'all' ? 'Todos' : type === 'incoming' ? 'Ingresos' : 'Gastos'}
                    </button>
                  ))}
                </div>
              )}

              {/* Period filter */}
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={90}>Últimos 3 meses</option>
                <option value={365}>Último año</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Outgoing total */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm">Gastos</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.outgoing.total)}
              </div>
              <div className="text-sm text-white/50">
                {summary.outgoing.count} transacciones
              </div>
            </div>

            {/* Incoming total (creators only) */}
            {isCreator && summary.incoming && (
              <>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Ingresos Netos</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary.incoming.gross)}
                  </div>
                  <div className="text-sm text-white/50">
                    Después de comisiones
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white/60 mb-2">
                    <Receipt className="w-4 h-4" />
                    <span className="text-sm">Desglose</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Suscripciones</span>
                      <span>{formatCurrency(summary.incoming.subscriptions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Donaciones</span>
                      <span>{formatCurrency(summary.incoming.donations)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">PPV</span>
                      <span>{formatCurrency(summary.incoming.ppv)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Propinas</span>
                      <span>{formatCurrency(summary.incoming.tips)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Transactions List */}
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <h3 className="text-lg font-medium text-white/60">No hay transacciones</h3>
              <p className="text-sm text-white/40 mt-1">
                {isCreator 
                  ? 'Aún no tienes transacciones registradas'
                  : 'Aún no has realizado ningún pago'}
              </p>
            </div>
          ) : (
            transactions.map((tx) => {
              const config = transactionTypeConfig[tx.type] || {
                icon: Receipt,
                label: 'Transacción',
                colorClass: 'text-gray-400 bg-gray-400/10',
                isIncoming: false
              }
              const Icon = config.icon

              return (
                <div 
                  key={tx.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{tx.description}</span>
                        {tx.tier && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                            {tx.tier.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/50 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {format(new Date(tx.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                        </span>
                      </div>
                      {tx.counterparty && (
                        <Link 
                          href={`/${tx.counterparty.username}`}
                          className="flex items-center gap-2 mt-2 hover:opacity-80"
                        >
                          {tx.counterparty.avatar ? (
                            <Image
                              src={tx.counterparty.avatar}
                              alt={tx.counterparty.displayName}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-white/10" />
                          )}
                          <span className="text-sm text-white/60">
                            @{tx.counterparty.username}
                          </span>
                        </Link>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        config.isIncoming ? 'text-green-400' : 'text-white'
                      }`}>
                        {config.isIncoming ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                      </div>
                      {tx.netAmount !== undefined && tx.netAmount !== tx.amount && (
                        <div className="text-xs text-white/40">
                          Neto: {formatCurrency(tx.netAmount, tx.currency)}
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${
                        tx.status === 'completed' || tx.status === 'AUTHORIZED' 
                          ? 'text-green-400' 
                          : tx.status === 'pending' || tx.status === 'PENDING'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }`}>
                        {tx.status === 'completed' || tx.status === 'AUTHORIZED' ? '✓ Completado' :
                         tx.status === 'pending' || tx.status === 'PENDING' ? '⏳ Pendiente' :
                         '✗ ' + tx.status}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchTransactions(false)}
                disabled={loadingMore}
                className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Cargar más'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
