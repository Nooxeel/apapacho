import { BadgeCheck } from 'lucide-react'
import type { KycStatus } from '@/lib/api'

interface VerifiedBadgeProps {
  /**
   * Current KYC status of the creator. Badge only renders when status is
   * `'APPROVED'` — every other value returns `null`. The prop is also nullable
   * to accommodate legacy/public API responses that don't yet expose KYC state.
   */
  kycStatus: KycStatus | null | undefined
  /** Visual size of the badge icon. */
  size?: 'sm' | 'md' | 'lg'
  /** When true, render the literal text "Verificado" next to the icon. */
  showLabel?: boolean
  /**
   * Optional accent color override for the icon. Defaults to the platform
   * fuchsia accent if not provided, matching existing badge usage across
   * dashboard / discover / creators surfaces.
   */
  accentColor?: string
  /** Extra classes appended to the wrapper. */
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<VerifiedBadgeProps['size']>, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const LABEL_TEXT_CLASSES: Record<NonNullable<VerifiedBadgeProps['size']>, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

const TOOLTIP_TEXT =
  'Esta cuenta verificó su identidad con Apapacho según Ley 21.515'

/**
 * Discrete-but-clear "Verified" badge shown on creator surfaces where the
 * creator has completed manual KYC review (`kycStatus === 'APPROVED'`).
 *
 * Privacy: never renders any RUT, document number or personal data — only the
 * fact that identity was verified. Tooltip cites Ley 21.515 (sexting / sextortion)
 * as the regulatory anchor for our identity-verification policy.
 *
 * Renders nothing when KYC is not approved, so callers can mount it
 * unconditionally next to a display name.
 */
export function VerifiedBadge({
  kycStatus,
  size = 'md',
  showLabel = false,
  accentColor,
  className = '',
}: VerifiedBadgeProps) {
  if (kycStatus !== 'APPROVED') return null

  const iconColor = accentColor ?? '#d946ef' // fuchsia-500 — platform default

  return (
    <span
      className={`inline-flex items-center gap-1 align-middle ${className}`}
      title={TOOLTIP_TEXT}
      aria-label={TOOLTIP_TEXT}
      role="img"
    >
      <BadgeCheck
        className={`${SIZE_CLASSES[size]} flex-shrink-0`}
        style={{ color: iconColor }}
        fill={iconColor}
        aria-hidden="true"
      />
      {showLabel && (
        <span
          className={`font-medium ${LABEL_TEXT_CLASSES[size]}`}
          style={{ color: iconColor }}
        >
          Verificado
        </span>
      )}
    </span>
  )
}
