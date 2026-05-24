/**
 * Do Not Track (DNT) detection — Ley 21.719 hardening.
 *
 * Reads the browser's DNT preference (Firefox / Brave / Tor / extensions
 * still emit it; Chrome removed the UI but third-party privacy extensions
 * can set it). When DNT=1, we suppress:
 *  - Google Analytics (the GA script is not loaded at all)
 *  - Sentry session replays (sample rate forced to 0)
 *  - Any future client-side behavioral tracker
 *
 * What DNT does NOT disable on the client:
 *  - Application logic (auth, payments, content delivery) — all essential.
 *  - Error reporting itself (Sentry still captures errors, only replays are
 *    suppressed). Errors are not behavioral tracking; they are required to
 *    operate the service safely.
 *
 * Always returns `false` during SSR (the signal lives on `navigator`, which
 * is undefined on the server). The page may render trackers in the initial
 * HTML and the consumer is expected to re-check on mount.
 */

export function isDntEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & {
    msDoNotTrack?: string
    doNotTrack?: string
  }
  // Browser variants:
  //   - W3C standard: navigator.doNotTrack === '1'
  //   - IE/legacy Edge: navigator.msDoNotTrack === '1'
  //   - Some older builds set window.doNotTrack instead of on navigator
  const navDnt = nav.doNotTrack
  const msDnt = nav.msDoNotTrack
  const winDnt = (window as Window & { doNotTrack?: string }).doNotTrack
  return navDnt === '1' || msDnt === '1' || winDnt === '1'
}
