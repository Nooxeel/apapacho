'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { creatorEarningsApi, ApiError } from '@/lib/api'
import { Navbar } from '@/components/layout'
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowDownCircle,
  Receipt,
  CreditCard,
  AlertCircle,
  Loader2,
  ChevronRight,
  Calendar,
  Percent,
  Building2,
  RefreshCw,
  Gift,
  Users,
  MessageSquare
} from 'lucide-react'

interface Balance {
  total: string
  available: string
  pending: string
  paid: string
}

interface BalanceConfig {
  holdDays: number
  minPayout: string
  payoutFrequency: string
}

interface Transaction {
  id: string
  productType: string
  grossAmount: string
  platformFeeAmount: string
  creatorPayableAmount: string
  status: string
  occurredAt: string
  provider: string
}

interface Payout {
  id: string
  status: string
  periodStart: string
  periodEnd: string
  grossTotal: string
  platformFeeTotal: string
  payoutAmount: string
  transactionsIncluded: number
  sentAt: string | null
  failedAt: string | null
  failureReason: string | null
  createdAt: string
}

interface TransactionStats {
  totalTransactions: number
  totalGross: string
  totalFees: string
  totalPayable: string
  byType: { type: string; count: number; total: string }[]
}

interface PayoutEligibility {
  canCreatePayout: boolean
  reason: string
  totals: { grossTotal: string; platformFeeTotal: string; creatorPayableTotal: string }
  eligibleTransactionsCount: number
  pendingHoldCount: number
}

interface Donation {
  id: string
  amount: number
  currency: string
  message: string | null
  isAnonymous: boolean
  creatorEarnings: number
  status: string
  createdAt: string
  fromUser: { id: string; username: string; displayName: string; avatar: string | null } | null
}

interface Subscriber {
  id: string
  startDate: string
  endDate: string | null
  status: string
  autoRenew: boolean
  user: { id: string; username: string; displayName: string; avatar: string | null }
  tier: { id: string; name: string; price: number; currency: string; durationDays: number }
}

type TabType = 'overview' | 'transactions' | 'payouts' | 'donations' | 'subscribers'

export default function CreatorEarningsPage() {
  const router = useRouter()
  const { token, user, hasHydrated } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data states
  const [balance, setBalance] = useState<Balance | null>(null)
  const [balanceConfig, setBalanceConfig] = useState<BalanceConfig | null>(null)
  const [tier, setTier] = useState<string>('STANDARD')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [eligibility, setEligibility] = useState<PayoutEligibility | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isRequestingPayout, setIsRequestingPayout] = useState(false)
  const [payoutMessage, setPayoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    
    if (!token) {
      router.push('/login')
      return
    }

    if (!(user as any)?.isCreator) {
      router.push('/dashboard')
      return
    }

    loadData()
  }, [token, hasHydrated, router, user])

  const loadData = async () => {
    if (!token) return
    
    setIsLoading(true)
    setError(null)

    try {
      const [balanceData, statsData, transactionsData, payoutsData, eligibilityData, donationsData, subscribersData] = await Promise.all([
        creatorEarningsApi.getBalance(token),
        creatorEarningsApi.getTransactionStats(token),
        creatorEarningsApi.getTransactions(token, { limit: 50 }),
        creatorEarningsApi.getPayouts(token),
        creatorEarningsApi.getPayoutEligibility(token),
        creatorEarningsApi.getDonations(token, { limit: 50 }),
        creatorEarningsApi.getSubscribers(token, { limit: 50 })
      ])

      setBalance(balanceData.balance)
      setBalanceConfig(balanceData.config)
      setTier(balanceData.tier)
      setTransactionStats(statsData)
      setTransactions(transactionsData)
      setPayouts(payoutsData)
      setEligibility(eligibilityData)
      setDonations(donationsData.donations)
      setSubscribers(subscribersData.subscribers)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Error al cargar los datos')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    if (!token || !eligibility?.canCreatePayout) return

    setIsRequestingPayout(true)
    setPayoutMessage(null)

    try {
      const result = await creatorEarningsApi.requestPayout(token)
      setPayoutMessage({ type: 'success', text: result.message })
      // Reload data to reflect changes
      loadData()
    } catch (err) {
      if (err instanceof ApiError) {
        setPayoutMessage({ type: 'error', text: err.message })
      } else {
        setPayoutMessage({ type: 'error', text: 'Error al solicitar retiro' })
      }
    } finally {
      setIsRequestingPayout(false)
    }
  }

  const formatCurrency = (amount: string | number, currency = 'CLP') => {
    const num = typeof amount === 'string' ? parseInt(amount) : amount
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'SUBSCRIPTION': 'Suscripción',
      'DONATION': 'Donación',
      'CONTENT': 'Contenido',
      'TIP': 'Propina',
      'MESSAGE': 'Mensaje'
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'SUCCEEDED': 'bg-green-500/20 text-green-400',
      'PENDING': 'bg-yellow-500/20 text-yellow-400',
      'CALCULATED': 'bg-blue-500/20 text-blue-400',
      'SENT': 'bg-green-500/20 text-green-400',
      'FAILED': 'bg-red-500/20 text-red-400'
    }
    const labels: Record<string, string> = {
      'SUCCEEDED': 'Completado',
      'PENDING': 'Pendiente',
      'CALCULATED': 'Calculado',
      'SENT': 'Enviado',
      'FAILED': 'Fallido'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (!hasHydrated || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#0d0d1a] to-[#1a0a2e] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#0d0d1a] to-[#1a0a2e] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white/70">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 rounded-lg text-white transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#0d0d1a] to-[#1a0a2e] pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-fuchsia-400" />
                Mis Ganancias
              </h1>
              <p className="text-white/60 mt-1">
                Gestiona tus ingresos, transacciones y retiros
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Actualizar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                Total Ganado
              </div>
              <p className="text-xl md:text-2xl font-bold text-white">
                {balance ? formatCurrency(balance.total) : '-'}
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Disponible
              </div>
              <p className="text-xl md:text-2xl font-bold text-green-400">
                {balance ? formatCurrency(balance.available) : '-'}
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                En Hold
              </div>
              <p className="text-xl md:text-2xl font-bold text-yellow-400">
                {balance ? formatCurrency(balance.pending) : '-'}
              </p>
              {balanceConfig && (
                <p className="text-xs text-white/40 mt-1">
                  {balanceConfig.holdDays} días de espera
                </p>
              )}
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <ArrowDownCircle className="w-4 h-4 text-blue-400" />
                Ya Retirado
              </div>
              <p className="text-xl md:text-2xl font-bold text-blue-400">
                {balance ? formatCurrency(balance.paid) : '-'}
              </p>
            </div>
          </div>

          {/* Request Payout Section */}
          {eligibility && (
            <div className="bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 rounded-xl p-6 border border-fuchsia-500/20 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Solicitar Retiro</h3>
                  {eligibility.canCreatePayout ? (
                    <p className="text-white/70 text-sm">
                      Tienes {eligibility.eligibleTransactionsCount} transacciones elegibles por{' '}
                      <span className="text-green-400 font-medium">
                        {formatCurrency(eligibility.totals.creatorPayableTotal)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-white/70 text-sm">{eligibility.reason}</p>
                  )}
                  {eligibility.pendingHoldCount > 0 && (
                    <p className="text-yellow-400/80 text-xs mt-1">
                      {eligibility.pendingHoldCount} transacciones aún en período de hold
                    </p>
                  )}
                </div>
                <button
                  onClick={handleRequestPayout}
                  disabled={!eligibility.canCreatePayout || isRequestingPayout}
                  className={`
                    px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition
                    ${eligibility.canCreatePayout
                      ? 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }
                  `}
                >
                  {isRequestingPayout ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5" />
                  )}
                  Solicitar Retiro
                </button>
              </div>
              {payoutMessage && (
                <div className={`mt-4 p-3 rounded-lg ${
                  payoutMessage.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {payoutMessage.text}
                </div>
              )}
            </div>
          )}

          {/* Tier Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${tier === 'VIP' ? 'bg-amber-500/20' : 'bg-white/10'}`}>
                <Percent className={`w-5 h-5 ${tier === 'VIP' ? 'text-amber-400' : 'text-white/60'}`} />
              </div>
              <div>
                <p className="text-white font-medium">
                  Tier {tier}
                </p>
                <p className="text-white/50 text-sm">
                  Comisión: {tier === 'VIP' ? '7%' : '10%'}
                </p>
              </div>
            </div>
            {balanceConfig && (
              <div className="text-right text-sm text-white/50">
                <p>Mínimo retiro: {formatCurrency(balanceConfig.minPayout)}</p>
                <p>Frecuencia: {balanceConfig.payoutFrequency}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto">
            {[
              { id: 'overview' as TabType, label: 'Resumen', icon: TrendingUp },
              { id: 'transactions' as TabType, label: 'Transacciones', icon: Receipt },
              { id: 'donations' as TabType, label: 'Donaciones', icon: Gift },
              { id: 'subscribers' as TabType, label: 'Suscriptores', icon: Users },
              { id: 'payouts' as TabType, label: 'Retiros', icon: CreditCard },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium
                  ${activeTab === tab.id
                    ? 'bg-fuchsia-500/20 text-fuchsia-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && transactionStats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm">Total Transacciones</p>
                  <p className="text-2xl font-bold text-white">{transactionStats.totalTransactions}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm">Ingresos Brutos</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(transactionStats.totalGross)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm">Comisiones</p>
                  <p className="text-2xl font-bold text-red-400">-{formatCurrency(transactionStats.totalFees)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm">Neto a Recibir</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(transactionStats.totalPayable)}</p>
                </div>
              </div>

              {/* By Type */}
              {transactionStats.byType.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Ingresos por Tipo</h3>
                  <div className="space-y-3">
                    {transactionStats.byType.map(item => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
                          <span className="text-white">{getProductTypeLabel(item.type)}</span>
                          <span className="text-white/40 text-sm">({item.count})</span>
                        </div>
                        <span className="text-white font-medium">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <Receipt className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No hay transacciones aún</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Bruto</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Comisión</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Neto</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-white/5 transition">
                          <td className="px-4 py-3 text-sm text-white/70">
                            {formatDateTime(tx.occurredAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            {getProductTypeLabel(tx.productType)}
                          </td>
                          <td className="px-4 py-3 text-sm text-white text-right">
                            {formatCurrency(tx.grossAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-400 text-right">
                            -{formatCurrency(tx.platformFeeAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-400 text-right font-medium">
                            {formatCurrency(tx.creatorPayableAmount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(tx.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {payouts.length === 0 ? (
                <div className="p-12 text-center">
                  <CreditCard className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No hay retiros aún</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {payouts.map(payout => (
                    <div key={payout.id} className="p-4 hover:bg-white/5 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <Building2 className="w-5 h-5 text-white/60" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {formatCurrency(payout.payoutAmount)}
                            </p>
                            <p className="text-white/50 text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(payout.status)}
                          <p className="text-white/40 text-xs mt-1">
                            {payout.transactionsIncluded} transacciones
                          </p>
                        </div>
                      </div>
                      {payout.failureReason && (
                        <div className="mt-3 p-2 bg-red-500/10 rounded text-red-400 text-sm">
                          {payout.failureReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {donations.length === 0 ? (
                <div className="p-12 text-center">
                  <Gift className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No has recibido donaciones aún</p>
                  <p className="text-white/40 text-sm mt-2">Las donaciones de tus fans aparecerán aquí</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {donations.map(donation => (
                    <div key={donation.id} className="p-4 hover:bg-white/5 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {donation.isAnonymous || !donation.fromUser ? (
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                              <Gift className="w-5 h-5 text-white/40" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center overflow-hidden">
                              {donation.fromUser.avatar ? (
                                <img 
                                  src={donation.fromUser.avatar} 
                                  alt={donation.fromUser.displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-fuchsia-400 font-medium">
                                  {donation.fromUser.displayName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {donation.isAnonymous ? 'Anónimo' : donation.fromUser?.displayName || 'Usuario'}
                            </p>
                            <p className="text-white/50 text-sm">
                              {formatDateTime(donation.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">
                            +{formatCurrency(donation.creatorEarnings, donation.currency)}
                          </p>
                          <p className="text-white/40 text-xs">
                            {formatCurrency(donation.amount, donation.currency)} bruto
                          </p>
                        </div>
                      </div>
                      {donation.message && (
                        <div className="mt-3 p-3 bg-white/5 rounded-lg flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                          <p className="text-white/70 text-sm">{donation.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'subscribers' && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {subscribers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No tienes suscriptores activos</p>
                  <p className="text-white/40 text-sm mt-2">Tus suscriptores aparecerán aquí</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {subscribers.map(sub => (
                    <div key={sub.id} className="p-4 hover:bg-white/5 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center overflow-hidden">
                            {sub.user.avatar ? (
                              <img 
                                src={sub.user.avatar} 
                                alt={sub.user.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-fuchsia-400 font-medium">
                                {sub.user.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{sub.user.displayName}</p>
                            <p className="text-white/50 text-sm">@{sub.user.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{sub.tier.name}</p>
                          <p className="text-fuchsia-400 text-sm">
                            {formatCurrency(sub.tier.price, sub.tier.currency)}/{sub.tier.durationDays} días
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Desde {formatDate(sub.startDate)}
                        </span>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(sub.status.toUpperCase())}
                          {sub.autoRenew && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                              Auto-renovación
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
