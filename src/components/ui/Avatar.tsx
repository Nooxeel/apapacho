import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  fallback?: string
  isOnline?: boolean
  hasStory?: boolean
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-32 h-32',
}

export function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  className,
  fallback,
  isOnline,
  hasStory,
}: AvatarProps) {
  const initials = fallback
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn('relative inline-block', className)}>
      {hasStory && (
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-orange-500 p-[2px]',
            sizeClasses[size]
          )}
        />
      )}
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-500/20',
          hasStory && 'p-[3px]',
          sizeClasses[size]
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-accent-600 text-white font-semibold">
            {initials || '?'}
          </div>
        )}
      </div>
      {isOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-[#0f0f14]',
            size === 'xs' && 'w-1.5 h-1.5',
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-2.5 h-2.5',
            size === 'lg' && 'w-3 h-3',
            size === 'xl' && 'w-4 h-4',
            size === '2xl' && 'w-5 h-5'
          )}
        />
      )}
    </div>
  )
}
