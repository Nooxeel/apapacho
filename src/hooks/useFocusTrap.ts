'use client'

/**
 * useFocusTrap — keep keyboard focus inside a container while it is mounted.
 *
 * Used by <Dialog> and any other modal/overlay that needs WCAG-compliant
 * focus containment. While `enabled` is true:
 *   - On mount we move focus to the first focusable element inside the container
 *     (the trigger element should be restored separately by the consumer via
 *     useRestoreFocus or by reading `document.activeElement` before opening).
 *   - Tab on the last focusable element loops to the first.
 *   - Shift+Tab on the first focusable element loops to the last.
 *
 * The hook intentionally does NOT handle:
 *   - Escape (consumer wires this — sometimes Escape should NOT close, e.g.
 *     destructive confirmation in flight).
 *   - Click-on-backdrop dismissal (handled by <Dialog>).
 *   - Restoring focus to the trigger on close (handled by <Dialog>).
 *
 * Why custom and not focus-trap-react: keep the dep footprint minimal —
 * Radix would add ~30kB and we only need ~50 lines.
 */

import { useEffect, type RefObject } from 'react'

// Selector that matches every "naturally focusable" element. Hidden/disabled
// elements are filtered out at runtime (CSS visibility checks).
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  'summary',
].join(',')

function isVisible(el: HTMLElement): boolean {
  // offsetParent is null when the element is display:none or its ancestor is.
  // We additionally check visibility because elements with `visibility:hidden`
  // can still have an offsetParent in some edge cases.
  if (el.offsetParent === null) return false
  const style = window.getComputedStyle(el)
  return style.visibility !== 'hidden' && style.display !== 'none'
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  )
  return nodes.filter(isVisible)
}

export interface UseFocusTrapOptions {
  /** Selector or element to receive initial focus. Defaults to first focusable. */
  initialFocus?: HTMLElement | null
}

export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled: boolean,
  options: UseFocusTrapOptions = {}
): void {
  useEffect(() => {
    if (!enabled) return
    const container = ref.current
    if (!container) return

    // Move initial focus inside the container. If no focusable child exists,
    // make the container itself focusable so screen readers land somewhere
    // meaningful instead of bouncing back to the body.
    const focusables = getFocusable(container)
    const initial =
      options.initialFocus ??
      (focusables[0] ?? null)

    if (initial) {
      // queueMicrotask defers the focus call until after React has painted —
      // necessary when the dialog mounts asynchronously (e.g. with portals).
      queueMicrotask(() => initial.focus())
    } else {
      // Fallback: focus the container itself.
      if (container.tabIndex < 0) container.tabIndex = -1
      queueMicrotask(() => container.focus())
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      if (!container) return

      const active = document.activeElement as HTMLElement | null
      const items = getFocusable(container)
      if (items.length === 0) {
        // Nothing to focus — prevent Tab from escaping the dialog.
        event.preventDefault()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]

      // Forward tab on the last element wraps back to the first.
      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
        return
      }

      // Backward tab on the first element wraps to the last.
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
        return
      }

      // If focus somehow escaped the container (e.g. browser autofocused
      // something outside), pull it back to the first focusable.
      if (active && !container.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
    // We intentionally only re-run when enabled toggles or the ref node identity
    // changes. `options.initialFocus` is a stable HTMLElement reference from the
    // consumer's perspective.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ref])
}

export default useFocusTrap
