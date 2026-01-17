'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User as UserIcon, Check, Users } from 'lucide-react'
import { Card } from '@/components/ui'
import type { Interest } from '@/types'

export interface CreatorCardData {
  id: string
  user: {
    username: string
    displayName: string
    avatar?: string
  }
  bannerImage?: string
  bio?: string
  isVerified: boolean
  interests: Array<{
    interest: Interest
  }>
  _count?: {
    subscribers: number
  }
  relevanceScore?: number
  sharedInterestsCount?: number
}

interface CreatorCardProps {
  creator: CreatorCardData
  userInterests?: string[] // IDs de intereses del usuario autenticado
}

export function CreatorCard({ creator, userInterests = [] }: CreatorCardProps) {
  const subscriberCount = creator._count?.subscribers || 0
  const displayedInterests = creator.interests.slice(0, 5)
  const remainingCount = creator.interests.length - 5

  // Determinar qué intereses son compartidos
  const sharedInterestIds = new Set(userInterests)

  return (
    <Link href={`/${creator.user.username}`}>
      <Card
        variant="glass"
        hover
        className="group h-full cursor-pointer overflow-hidden border-white/10 hover:border-fuchsia-500/50"
      >
        {/* Banner/Cover */}
        <div className="relative -m-6 mb-4 h-32 w-[calc(100%+3rem)] bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20">
          {creator.bannerImage ? (
            <Image
              src={creator.bannerImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-fuchsia-600/30 via-purple-600/30 to-pink-600/30" />
          )}
        </div>

        {/* Avatar */}
        <div className="relative -mt-12 mb-3 flex justify-center">
          <div className="relative h-20 w-20 rounded-full border-4 border-[#0f0f14] bg-[#1a1a24] overflow-hidden ring-2 ring-white/10">
            {creator.user.avatar ? (
              <Image
                src={creator.user.avatar}
                alt={creator.user.displayName}
                fill
                className="object-cover"
                sizes="80px"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fuchsia-500 to-purple-500">
                <UserIcon className="h-10 w-10 text-white" />
              </div>
            )}
          </div>

          {/* Verified Badge */}
          {creator.isVerified && (
            <div className="absolute bottom-0 right-[calc(50%-2.5rem-0.5rem)] rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 p-1">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Name & Username */}
        <div className="mb-3 text-center">
          <h3 className="mb-1 truncate text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors">
            {creator.user.displayName}
          </h3>
          <p className="truncate text-sm text-white/60">@{creator.user.username}</p>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="mb-4 line-clamp-2 text-center text-sm text-white/70">
            {creator.bio}
          </p>
        )}

        {/* Interests */}
        {displayedInterests.length > 0 && (
          <div className="mb-4 flex flex-wrap justify-center gap-1.5">
            {displayedInterests.map(({ interest }) => {
              const isShared = sharedInterestIds.has(interest.id)
              return (
                <span
                  key={interest.id}
                  className={`
                    inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border
                    transition-all
                    ${
                      isShared
                        ? 'bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-500/50 ring-1 ring-fuchsia-500/30'
                        : 'bg-white/10 text-white/70 border-white/20'
                    }
                  `}
                >
                  {interest.icon && <span className="text-xs">{interest.icon}</span>}
                  <span className="truncate max-w-[80px]">{interest.name}</span>
                </span>
              )
            })}
            {remainingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2 py-1 text-xs font-medium text-white/50">
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-1 text-sm text-white/60">
          <Users className="h-4 w-4" />
          <span>
            {subscriberCount > 0
              ? `${subscriberCount.toLocaleString()} ${subscriberCount === 1 ? 'suscriptor' : 'suscriptores'}`
              : 'Sin suscriptores'}
          </span>
        </div>

        {/* Relevance indicator (optional) */}
        {creator.relevanceScore !== undefined && creator.relevanceScore > 0 && (
          <div className="mt-3 flex justify-center">
            <span className="text-xs text-fuchsia-400/80">
              {creator.sharedInterestsCount} {creator.sharedInterestsCount === 1 ? 'interés' : 'intereses'} en común
            </span>
          </div>
        )}
      </Card>
    </Link>
  )
}
