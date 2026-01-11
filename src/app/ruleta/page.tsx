'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RouletteWheel } from '@/components/roulette'
import { useAuthStore } from '@/stores'
import api from '@/lib/api'
import { Sparkles, Gift, Zap } from 'lucide-react'

export default function RouletaPage() {
  const router = useRouter()
  const { token, hasHydrated } = useAuthStore()
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.push('/login')
      return
    }

    loadPoints()
  }, [token, hasHydrated, router])

  const loadPoints = async () => {
    if (!token) return
    
    try {
      const response = await api<{ points: number }>('/roulette/points', {
        token,
      })
      setPoints(response.points || 0)
    } catch (error) {
      console.error('Error loading points:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSpin = async (): Promise<number> => {
    if (!token) throw new Error('No token')
    
    try {
      const response = await api<{ prizeId: number; newPoints: number }>('/roulette/spin', {
        method: 'POST',
        token,
      })
      
      // Update points after spin
      setPoints(response.newPoints)
      
      return response.prizeId
    } catch (error: any) {
      console.error('Error spinning roulette:', error)
      throw error
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-fuchsia-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] py-20">
      {/* Header */}
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-400"></span>
            </span>
            <span className="text-sm text-white/80 font-medium">¡Gira y Gana!</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Ruleta de </span>
            <span className="gradient-text">Premios</span>
          </h1>

          <p className="text-xl text-white/70 mb-8">
            Gira la ruleta y gana puntos adicionales. ¡Cada día recibes 1 punto gratis al iniciar sesión!
          </p>
        </div>
      </div>

      {/* Roulette */}
      <div className="container mx-auto px-4">
        <RouletteWheel
          onSpin={handleSpin}
          canSpin={points >= 10}
          points={points}
        />
      </div>

      {/* How it Works */}
      <div className="container mx-auto px-4 mt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            ¿Cómo Funciona?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 flex items-center justify-center">
                <Gift className="h-8 w-8 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Gana Puntos</h3>
              <p className="text-white/60">
                Recibe 1 punto cada día que inicies sesión en Apapacho
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. Junta 10 Puntos</h3>
              <p className="text-white/60">
                Acumula puntos para poder girar la ruleta de premios
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 flex items-center justify-center">
                <Zap className="h-8 w-8 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. ¡Gira y Gana!</h3>
              <p className="text-white/60">
                Cada giro cuesta 10 puntos. Puedes ganar hasta 50 puntos de regreso
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prizes List */}
      <div className="container mx-auto px-4 mt-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Premios Disponibles
          </h2>

          <div className="space-y-3">
            {[
              { icon: '🏆', name: '¡Jackpot! 50 Puntos', chance: 'Ultra Raro' },
              { icon: '💎', name: '10 Puntos', chance: 'Raro' },
              { icon: '⭐', name: '5 Puntos', chance: 'Poco Común' },
              { icon: '🎁', name: '3 Puntos', chance: 'Común' },
              { icon: '🎉', name: '2 Puntos', chance: 'Común' },
              { icon: '✨', name: '1 Punto', chance: 'Muy Común' },
              { icon: '🔄', name: 'Intenta de nuevo', chance: 'Consolación' },
            ].map((prize, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-fuchsia-500/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{prize.icon}</span>
                  <span className="font-medium text-white">{prize.name}</span>
                </div>
                <span className="text-sm text-white/60 px-3 py-1 rounded-full bg-white/5">
                  {prize.chance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
