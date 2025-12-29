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
    coverGradient: 'from-purple-600 via-pink-500 to-red-500',
    category: 'Contenido',
    subscribers: 0,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Zippy',
    username: 'zippy',
    avatar: '',
    coverGradient: 'from-blue-600 via-cyan-500 to-teal-500',
    category: 'Tech',
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
            coverGradient: 'from-purple-600 via-pink-500 to-red-500',
            category: 'Contenido',
            subscribers: 0,
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
    <section className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Creadores <span className="gradient-text">destacados</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Descubre creadores únicos con perfiles personalizables
          </p>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.slice(0, 4).map((creator) => (
            <Link key={creator.id} href={`/${creator.username}`}>
              <Card
                variant="solid"
                hover
                className="overflow-hidden cursor-pointer group"
              >
              {/* Cover Gradient */}
              <div
                className={`h-24 bg-gradient-to-r ${creator.coverGradient} -m-6 mb-0`}
              />

              {/* Avatar */}
              <div className="relative -mt-10 mb-4 flex justify-center">
                <div className="ring-4 ring-[#1a1a24] rounded-full">
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
                <h3 className="text-lg font-semibold text-white group-hover:gradient-text transition-all">
                  {creator.name}
                </h3>
                <p className="text-white/50 text-sm mb-3">@{creator.username}</p>
                
                <div className="flex items-center justify-center gap-3">
                  <Badge variant="primary" size="sm">
                    {creator.category}
                  </Badge>
                  <span className="text-white/40 text-sm">
                    {formatSubscribers(creator.subscribers)} subs
                  </span>
                </div>
              </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/creators">
            <button className="text-primary-400 hover:text-primary-300 font-medium transition-colors inline-flex items-center gap-2">
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
