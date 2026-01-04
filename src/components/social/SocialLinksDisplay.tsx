'use client'

import { SocialLink } from '@/types'
import { ExternalLink } from 'lucide-react'

interface SocialLinksDisplayProps {
  links: SocialLink[]
  variant?: 'default' | 'compact' | 'grid'
  className?: string
}

export default function SocialLinksDisplay({
  links,
  variant = 'default',
  className = ''
}: SocialLinksDisplayProps) {
  const visibleLinks = links.filter(link => link.isVisible)

  if (visibleLinks.length === 0) {
    return null
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {visibleLinks.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
            title={link.label || link.platform}
          >
            <span className="text-xl">{link.icon || '🔗'}</span>
            <span className="text-sm text-white/90 group-hover:text-white font-medium">
              {link.label || link.platform}
            </span>
            <ExternalLink className="w-3 h-3 text-white/50 group-hover:text-white/70" />
          </a>
        ))}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
        {visibleLinks.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
          >
            <div className="text-3xl flex-shrink-0">
              {link.icon || '🔗'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium group-hover:text-fuchsia-300 transition-colors truncate">
                {link.label || link.platform}
              </div>
              <div className="text-xs text-white/50 truncate">
                {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 flex-shrink-0" />
          </a>
        ))}
      </div>
    )
  }

  // Default variant - Linktree style
  return (
    <div className={`space-y-3 ${className}`}>
      {visibleLinks.map(link => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 p-4 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 hover:border-fuchsia-500/50 transition-all group w-full"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-2xl flex-shrink-0">
              {link.icon || '🔗'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold group-hover:text-fuchsia-300 transition-colors truncate">
                {link.label || link.platform}
              </div>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-fuchsia-400 transition-colors flex-shrink-0" />
        </a>
      ))}
    </div>
  )
}
