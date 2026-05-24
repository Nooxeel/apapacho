'use client'

/**
 * Cloudflare Turnstile widget wrapper.
 *
 * Reads `NEXT_PUBLIC_TURNSTILE_SITEKEY` from env. When absent (typical local
 * dev before Cloudflare is provisioned) the component renders nothing and
 * calls `onVerify(null)` once on mount so the form can submit without a token
 * — the backend graceful-passes in dev (see backend/src/lib/turnstile.ts).
 *
 * Ola 6 P2 — auth hardening (CAPTCHA on signup, forgot-password, DMCA, and
 * progressive on login after 3 failed attempts).
 */

import { useEffect, useRef } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

interface Props {
  /** Called whenever the widget produces (or invalidates) a token. */
  onVerify: (token: string | null) => void
  /** Optional action label, surfaced in the Turnstile dashboard. */
  action?: string
  /** Dark/light variant. The app theme is dark by default. */
  theme?: 'light' | 'dark' | 'auto'
}

export default function TurnstileWidget({ onVerify, action, theme = 'dark' }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY
  const ref = useRef<TurnstileInstance | null>(null)
  const hasNotifiedNoKeyRef = useRef(false)

  useEffect(() => {
    // Dev escape-hatch: no key → notify parent once so it doesn't gate submit.
    if (!siteKey && !hasNotifiedNoKeyRef.current) {
      hasNotifiedNoKeyRef.current = true
      onVerify(null)
    }
  }, [siteKey, onVerify])

  if (!siteKey) {
    // Render nothing in dev. The backend will graceful-pass.
    return null
  }

  return (
    <div className="flex justify-center" data-testid="turnstile-widget">
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={(token) => onVerify(token)}
        onExpire={() => onVerify(null)}
        onError={() => onVerify(null)}
        options={{
          theme,
          action,
          size: 'normal',
        }}
      />
    </div>
  )
}
