'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Avatar, Badge, Card } from '@/components/ui'

interface Creator {
  id: string
  username: string
  displayName: string
  avatar: string | null
  profileImage: string | null
  bio: string | null
  isVerified: boolean
  accentColor: string
}

const mockCreators = [
  {
    id: '1',
    name: 'Gatita Veve',
    username: 'gatitaveve',
    avatar: '',
    backgroundColor: '#7c3aed',
    coverGradient: 'from-purple-600 via-violet-500 to-indigo-500',
    postsCount: 0,
    subscribers: 0,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Imperfecto',
    username: 'imperfecto',
    avatar: '',
    backgroundColor: '#6366f1',
    coverGradient: 'from-indigo-600 via-blue-500 to-cyan-500',
    postsCount: 0,
    subscribers: 0,
    isOnline: false,
  },
]

function formatSubscribers(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function CreatorsShowcase() {
  const [creators, setCreators] = useState<any[]>(mockCreators)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCreators = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/creators?limit=4`)
        if (response.ok) {
          const data = await response.json()
          // Formatear para el componente
          const formatted = data.map((c: any) => ({
            id: c.id,
            name: c.user?.displayName || c.displayName || 'Usuario',
            username: c.user?.username || c.username || 'usuario',
            avatar: c.user?.avatar || c.profileImage || '',
            backgroundColor: c.backgroundColor || '#7c3aed',
            coverGradient: 'from-purple-600 via-violet-500 to-indigo-500',
            postsCount: c.stats?.postsCount || c._count?.posts || 0,
            subscribers: c.stats?.subscribersCount || c._count?.subscribers || 0,
            isOnline: Math.random() > 0.5,
          }))
          setCreators(formatted.length > 0 ? formatted : mockCreators)
        }
      } catch (error) {
        console.error('Error loading creators:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCreators()
  }, [])

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#0d0d1a] to-[#12101f]">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-poppins text-3xl md:text-5xl font-semibold text-white/95 mb-4 tracking-wide">
            Creadores <span className="gradient-text">destacados</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Descubre creadores únicos con perfiles personalizables
          </p>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton loaders to prevent CLS
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card
                  variant="solid"
                  className="overflow-hidden border-white/[0.05] bg-white/[0.02]"
                >
                  <div className="h-24 -m-6 mb-0 bg-white/5" />
                  <div className="relative -mt-10 mb-4 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 ring-4 ring-[#12101f]" />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="h-6 w-24 mx-auto bg-white/10 rounded" />
                    <div className="h-4 w-16 mx-auto bg-white/5 rounded" />
                    <div className="h-6 w-20 mx-auto bg-white/10 rounded-full" />
                  </div>
                </Card>
              </div>
            ))
          ) : (
          creators.slice(0, 4).map((creator) => (
            <Link key={creator.id} href={`/${creator.username}`}>
              <Card
                variant="solid"
                hover
                className="overflow-hidden cursor-pointer group border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/20"
              >
              {/* Cover with Creator's Background Color */}
              <div
                className="h-24 -m-6 mb-0"
                style={{ backgroundColor: creator.backgroundColor || '#7c3aed' }}
              />

              {/* Avatar */}
              <div className="relative -mt-10 mb-4 flex justify-center">
                <div className="ring-4 ring-[#12101f] rounded-full">
                  <Avatar
                    src={creator.avatar}
                    fallback={creator.name}
                    size="xl"
                    isOnline={creator.isOnline}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white/90 group-hover:text-purple-300 transition-all">
                  {creator.name}
                </h3>
                <p className="text-white/50 text-base mb-3">@{creator.username}</p>

                <div className="flex items-center justify-center gap-3">
                  <span className="text-white/50 text-base">
                    {creator.postsCount || 0} posts
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50 text-base">
                    {formatSubscribers(creator.subscribers)} subs
                  </span>
                </div>
              </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </Link>
          ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/explore">
            <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors inline-flex items-center gap-2">
              Ver todos los creadores
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
