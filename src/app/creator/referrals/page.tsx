'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores'
import { referralsApi, ReferralData, ReferralCommission } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'

// Icons
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const DollarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function ReferralsPage() {
  const router = useRouter()
  const { token, hasHydrated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [commissions, setCommissions] = useState<ReferralCommission[]>([])
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'commissions'>('overview')
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const [refData, commData] = await Promise.all([
        referralsApi.getReferrals(token),
        referralsApi.getCommissions(1, 20, token)
      ])
      setReferralData(refData)
      setCommissions(commData.commissions)
    } catch (err) {
      console.error('Error fetching referral data:', err)
      setError('Error al cargar datos de referidos')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [hasHydrated, token, router, fetchData])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleRegenerate = async () => {
    if (!token || regenerating) return
    
    setRegenerating(true)
    try {
      const result = await referralsApi.regenerateCode(token)
      if (referralData) {
        setReferralData({
          ...referralData,
          referralCode: result.referralCode,
          referralLink: result.referralLink
        })
      }
    } catch (err) {
      console.error('Error regenerating code:', err)
    } finally {
      setRegenerating(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a]">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-600 to-pink-600 flex items-center justify-center">
            <UsersIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Programa de Referidos</h1>
            <p className="text-zinc-400">Gana comisiones invitando nuevos usuarios</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {referralData && (
          <>
            {/* Referral Code Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Tu Código de Referido</h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                {/* Code */}
                <div className="flex-1">
                  <label className="block text-sm text-zinc-400 mb-2">Código</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-zinc-800 rounded-xl text-white font-mono text-lg">
                      {referralData.referralCode}
                    </div>
                    <button
                      onClick={() => handleCopy(referralData.referralCode)}
                      className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors"
                      title="Copiar código"
                    >
                      <CopyIcon />
                    </button>
                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                      title="Regenerar código"
                    >
                      <RefreshIcon />
                    </button>
                  </div>
                </div>

                {/* Link */}
                <div className="flex-1">
                  <label className="block text-sm text-zinc-400 mb-2">Enlace de Referido</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-zinc-800 rounded-xl text-zinc-300 text-sm truncate">
                      {referralData.referralLink}
                    </div>
                    <button
                      onClick={() => handleCopy(referralData.referralLink)}
                      className="p-3 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl text-white transition-colors"
                      title="Copiar enlace"
                    >
                      {copied ? '✓' : <CopyIcon />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-zinc-500">
                Comparte tu código o enlace. Ganarás el 5% de las ganancias de tus referidos durante 3 meses.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{referralData.stats.totalReferrals}</div>
                <div className="text-sm text-zinc-400">Total Referidos</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">{referralData.stats.activeReferrals}</div>
                <div className="text-sm text-zinc-400">Activos</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-fuchsia-400">{formatCurrency(referralData.stats.totalEarned)}</div>
                <div className="text-sm text-zinc-400">Total Ganado</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-yellow-400">{formatCurrency(referralData.stats.thisMonthEarned)}</div>
                <div className="text-sm text-zinc-400">Este Mes</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(['overview', 'referrals', 'commissions'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-fuchsia-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab === 'overview' ? 'Resumen' : tab === 'referrals' ? 'Referidos' : 'Comisiones'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              {activeTab === 'overview' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">¿Cómo funciona?</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-fuchsia-600/20 flex items-center justify-center text-fuchsia-400 font-bold shrink-0">1</div>
                      <div>
                        <h4 className="text-white font-medium">Comparte tu código</h4>
                        <p className="text-zinc-400 text-sm">Envía tu código o enlace a personas que crees que les gustaría la plataforma.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-fuchsia-600/20 flex items-center justify-center text-fuchsia-400 font-bold shrink-0">2</div>
                      <div>
                        <h4 className="text-white font-medium">Se registran con tu código</h4>
                        <p className="text-zinc-400 text-sm">Cuando alguien se registra usando tu código, quedan vinculados como tu referido.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-fuchsia-600/20 flex items-center justify-center text-fuchsia-400 font-bold shrink-0">3</div>
                      <div>
                        <h4 className="text-white font-medium">Gana comisiones</h4>
                        <p className="text-zinc-400 text-sm">Recibe el 5% de las ganancias de tus referidos durante los primeros 3 meses.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'referrals' && (
                <div className="divide-y divide-zinc-800">
                  {referralData.referrals.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                      <UsersIcon />
                      <p className="mt-2">Aún no tienes referidos</p>
                    </div>
                  ) : (
                    referralData.referrals.map(referral => (
                      <div key={referral.id} className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                          {referral.referredUser.avatar ? (
                            <img src={referral.referredUser.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              {referral.referredUser.username[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{referral.referredUser.displayName}</div>
                          <div className="text-sm text-zinc-400">@{referral.referredUser.username}</div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            referral.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                            referral.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-zinc-700 text-zinc-400'
                          }`}>
                            {referral.status === 'ACTIVE' ? 'Activo' :
                             referral.status === 'PENDING' ? 'Pendiente' :
                             referral.status === 'EXPIRED' ? 'Expirado' : 'Cancelado'}
                          </span>
                          <div className="text-sm text-zinc-500 mt-1">
                            Ganado: {formatCurrency(referral.totalEarned)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'commissions' && (
                <div className="divide-y divide-zinc-800">
                  {commissions.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                      <DollarIcon />
                      <p className="mt-2">Aún no tienes comisiones</p>
                    </div>
                  ) : (
                    commissions.map(commission => (
                      <div key={commission.id} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">
                            {commission.sourceType === 'subscription' ? 'Suscripción' :
                             commission.sourceType === 'donation' ? 'Donación' : 'Compra'}
                          </div>
                          <div className="text-sm text-zinc-400">
                            de @{commission.referredUser.username}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-medium">+{formatCurrency(commission.amount)}</div>
                          <div className="text-xs text-zinc-500">{formatDate(commission.createdAt)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
