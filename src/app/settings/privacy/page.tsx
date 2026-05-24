import { redirect } from 'next/navigation'

/**
 * /settings/privacy → /settings/privacy/overview
 *
 * The original toggle-based panel was split into a privacy landing dashboard
 * (`/overview`) and the granular consent preferences (`/preferences`). The
 * landing serves as the canonical entry point — anyone navigating to the bare
 * `/settings/privacy` URL ends up there.
 */
export default function PrivacySettingsRedirect() {
  redirect('/settings/privacy/overview')
}
