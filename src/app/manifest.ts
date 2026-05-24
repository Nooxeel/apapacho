import type { MetadataRoute } from 'next'

/**
 * PWA manifest — generates /manifest.webmanifest at build time via Next's
 * file-based metadata convention.
 *
 * What this gets us today:
 *   - "Install app" / "Add to Home Screen" prompt on Chrome (Android/desktop)
 *     and Safari iOS, with the brand colour as splash + theme.
 *   - Standalone display mode when launched from the home screen — hides
 *     the browser chrome.
 *
 * What is NOT included on purpose:
 *   - No Service Worker. Offline support is out of scope and risky for an
 *     adult-content platform (cached private content leaking to a different
 *     session is a real concern). When we want SW we'll do it deliberately
 *     with a network-first strategy and zero caching of authenticated
 *     responses.
 *
 * TODO (Jorge): generate the 192/512/maskable PNG icons in /public.
 *   Right now we point all entries at /favicon.svg which works on most
 *   browsers (Chromium accepts SVG icons in the manifest spec) but is
 *   ignored by older Safari and won't render a maskable adaptive icon.
 *   When the PNGs land, replace the entries below and remove this note.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Apapacho',
    short_name: 'Apapacho',
    description:
      'Plataforma chilena de creadores adultos con privacidad real, pagos locales y herramientas para monetizar contenido exclusivo.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0d0d1a',
    theme_color: '#d946ef',
    orientation: 'portrait-primary',
    lang: 'es-CL',
    dir: 'ltr',
    categories: ['lifestyle', 'social', 'entertainment'],
    // Until PNG icons are produced, the SVG covers Chromium/Edge/Firefox.
    // The duplicate sizes entries let browsers pick the closest match.
    icons: [
      {
        src: '/favicon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/favicon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/favicon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/favicon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
