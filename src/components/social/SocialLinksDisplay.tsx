'use client'

import { SocialLink } from '@/types'
import { ExternalLink } from 'lucide-react'
import { sanitizeText, sanitizeUrl } from '@/lib/sanitize'

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

  // Helper para generar el href correcto.
  // Para URLs http(s) arbitrarias se pasa por sanitizeUrl() que bloquea
  // esquemas peligrosos (javascript:, data:, vbscript:).
  const getLinkHref = (link: SocialLink) => {
    const platform = link.platform.toLowerCase()

    if (platform === 'email') {
      // Si ya tiene mailto:, usarlo directamente; si no, agregarlo
      // Sanitizamos el email como texto (no puede haber HTML) para evitar
      // inyecciones en el mailto: header.
      const clean = sanitizeText(link.url)
      return clean.startsWith('mailto:') ? clean : `mailto:${clean}`
    }

    if (platform === 'whatsapp' || platform === 'telefono' || platform === 'teléfono' || platform === 'phone') {
      // Extraer solo números del link.url
      const phoneNumber = link.url.replace(/\D/g, '')

      if (platform === 'whatsapp') {
        // Para WhatsApp, usar el formato wa.me
        return `https://wa.me/${phoneNumber}`
      } else {
        // Para teléfono, usar tel:
        return `tel:+${phoneNumber}`
      }
    }

    return sanitizeUrl(link.url)
  }

  // Helper para mostrar el texto del link
  const getLinkDisplayText = (link: SocialLink) => {
    const platform = link.platform.toLowerCase()
    
    if (platform === 'email') {
      // Mostrar solo el email sin el mailto:
      return link.url.replace('mailto:', '')
    }
    
    if (platform === 'whatsapp' || platform === 'telefono' || platform === 'teléfono' || platform === 'phone') {
      // Para WhatsApp y teléfono, mostrar el número formateado
      return link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    }
    
    return link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }

  // Helper para determinar si debe abrir en nueva pestaña
  const shouldOpenInNewTab = (link: SocialLink) => {
    const platform = link.platform.toLowerCase()
    return platform !== 'email' && platform !== 'telefono' && platform !== 'teléfono' && platform !== 'phone'
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {visibleLinks.map(link => (
          <a
            key={link.id}
            href={getLinkHref(link)}
            target={shouldOpenInNewTab(link) ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
            title={sanitizeText(link.label || link.platform)}
          >
            <span className="text-xl">{link.icon || '🔗'}</span>
            <span className="text-sm text-white/90 group-hover:text-white font-medium">
              {sanitizeText(link.label || link.platform)}
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
            href={getLinkHref(link)}
            target={shouldOpenInNewTab(link) ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
          >
            <div className="text-3xl flex-shrink-0">
              {link.icon || '🔗'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium group-hover:text-fuchsia-300 transition-colors truncate">
                {sanitizeText(link.label || link.platform)}
              </div>
              <div className="text-xs text-white/50 truncate">
                {getLinkDisplayText(link)}
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
          href={getLinkHref(link)}
          target={shouldOpenInNewTab(link) ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 p-4 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 hover:border-fuchsia-500/50 transition-all group w-full"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-2xl flex-shrink-0">
              {link.icon || '🔗'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold group-hover:text-fuchsia-300 transition-colors truncate">
                {sanitizeText(link.label || link.platform)}
              </div>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-fuchsia-400 transition-colors flex-shrink-0" />
        </a>
      ))}
    </div>
  )
}
