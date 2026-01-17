'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  containerClassName?: string
  priority?: boolean
  sizes?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  showSkeleton?: boolean
}

/**
 * Componente de imagen optimizado con:
 * - Lazy loading automático (o priority para above-the-fold)
 * - Skeleton placeholder durante la carga
 * - Fade-in animation al cargar
 * - Manejo de errores con fallback
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  objectFit = 'cover',
  showSkeleton = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center',
          fill ? 'absolute inset-0' : '',
          containerClassName
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-white/30 text-sm">Error</span>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        fill ? 'absolute inset-0' : '',
        containerClassName
      )}
      style={!fill ? { width, height } : undefined}
    >
      {/* Skeleton placeholder */}
      {showSkeleton && isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse"
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={cn(
          `object-${objectFit}`,
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </div>
  )
}
