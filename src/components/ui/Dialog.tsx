'use client'

/**
 * Dialog — accessible modal primitive for Apapacho (WCAG 2.1 AA).
 *
 * Why this exists: the codebase had ~10 ad-hoc `<div className="fixed inset-0">`
 * modals, each rolling its own backdrop / Escape / focus logic (most of them
 * incorrectly). This component centralises the WCAG requirements:
 *
 *   - role="dialog" + aria-modal="true"
 *   - aria-labelledby pointing to the visible <h2> title
 *   - aria-describedby pointing to the optional description
 *   - Focus is trapped inside the dialog while open (via useFocusTrap)
 *   - Escape closes (configurable)
 *   - Click on backdrop closes (configurable)
 *   - Focus returns to the element that opened the dialog on close
 *   - `inert` on document.body's siblings (#main-content) so SR users don't
 *     accidentally tab outside the dialog
 *   - Animations respect prefers-reduced-motion
 *
 * Public API stays intentionally small. Use sub-components for layout:
 *
 *   <Dialog open={open} onClose={...} title="Cancelar suscripción">
 *     <Dialog.Description>...</Dialog.Description>
 *     ... body ...
 *     <Dialog.Footer>
 *       <button onClick={...}>Cancelar</button>
 *       <button onClick={...}>Confirmar</button>
 *     </Dialog.Footer>
 *   </Dialog>
 *
 * The body is rendered in a React portal so it always sits at the end of
 * document.body — sidesteps z-index / overflow:hidden ancestor issues.
 */

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl'

export interface DialogProps {
  open: boolean
  onClose: () => void
  /** Visible title. Rendered as <h2>; used for aria-labelledby. */
  title: ReactNode
  /** Optional supporting paragraph. Used for aria-describedby. */
  description?: ReactNode
  children?: ReactNode
  size?: DialogSize
  /** When false, clicks on the backdrop do nothing. Default: true. */
  closeOnOverlay?: boolean
  /** When false, the Escape key does nothing. Default: true. */
  closeOnEscape?: boolean
  /** When false, the top-right X button is hidden. Default: true. */
  showCloseButton?: boolean
  /** Extra classes applied to the panel (inner card). */
  className?: string
  /** aria-label for the close button. Default: "Cerrar". */
  closeLabel?: string
  /**
   * When true, prevents the page from scrolling while the dialog is open by
   * locking <body> overflow. Default: true.
   */
  lockBodyScroll?: boolean
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const SIZE_CLASSES: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

// ---------------------------------------------------------------------------
// Body scroll lock helper (refcount so nested dialogs don't fight each other)
// ---------------------------------------------------------------------------

let scrollLockCount = 0
let originalOverflow = ''

function lockScroll() {
  if (typeof document === 'undefined') return
  if (scrollLockCount === 0) {
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockCount++
}

function unlockScroll() {
  if (typeof document === 'undefined') return
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) {
    document.body.style.overflow = originalOverflow
  }
}

// ---------------------------------------------------------------------------
// Inert helper — toggles `inert` on the main app shell so screen readers
// don't reach content behind the modal.
// ---------------------------------------------------------------------------

let inertRefCount = 0

function setMainInert(inert: boolean) {
  if (typeof document === 'undefined') return
  const main = document.getElementById('main-content')
  if (!main) return
  if (inert) {
    inertRefCount++
    if (inertRefCount === 1) {
      main.setAttribute('inert', '')
      main.setAttribute('aria-hidden', 'true')
    }
  } else {
    inertRefCount = Math.max(0, inertRefCount - 1)
    if (inertRefCount === 0) {
      main.removeAttribute('inert')
      main.removeAttribute('aria-hidden')
    }
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function DialogRoot({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  closeLabel = 'Cerrar',
  lockBodyScroll = true,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)
  // Remember the element that had focus before the dialog opened so we can
  // restore it on close — WCAG 2.4.3 (Focus Order).
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Capture previous focus + lock scroll + mark main inert on open.
  useEffect(() => {
    if (!open) return
    previousFocusRef.current = (document.activeElement as HTMLElement) ?? null
    if (lockBodyScroll) lockScroll()
    setMainInert(true)
    return () => {
      if (lockBodyScroll) unlockScroll()
      setMainInert(false)
      // Restore focus only if the previous element is still in the DOM and
      // focusable. Wrap in queueMicrotask so React unmount finishes first.
      const previous = previousFocusRef.current
      if (previous && document.body.contains(previous)) {
        queueMicrotask(() => previous.focus())
      }
    }
  }, [open, lockBodyScroll])

  // Escape handler.
  useEffect(() => {
    if (!open || !closeOnEscape) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeOnEscape, onClose])

  // Focus trap (always enabled while open).
  useFocusTrap(panelRef, open)

  if (!open) return null
  if (typeof document === 'undefined') return null

  const node = (
    <div
      // Backdrop. Centralised z-index — keep above Navbar (z-50) and toast.
      // The .dialog-backdrop class defines a fade-in keyframe that respects
      // prefers-reduced-motion (handled globally in globals.css).
      className="dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(event) => {
        // Use mousedown (not click) to avoid race with text-selection drags
        // that end outside the panel. Only close if the down event began on
        // the backdrop itself, not bubbled from inside the panel.
        if (!closeOnOverlay) return
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'dialog-panel relative w-full bg-[#1a1a24] border border-white/10 rounded-2xl shadow-2xl',
          'max-h-[90vh] overflow-y-auto',
          'focus:outline-none',
          SIZE_CLASSES[size],
          className
        )}
        // tabIndex=-1 makes the panel focusable as a last-resort target for
        // useFocusTrap when no focusable children exist.
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <h2
            id={titleId}
            className="text-lg sm:text-xl font-semibold text-white leading-snug flex-1"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex-shrink-0 -mt-1 -mr-1 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {description && (
          <div
            id={descriptionId}
            className="px-6 -mt-2 mb-2 text-sm text-white/70 leading-relaxed"
          >
            {description}
          </div>
        )}

        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  )

  return createPortal(node, document.body)
}

// ---------------------------------------------------------------------------
// Sub-components for semantic structure
// ---------------------------------------------------------------------------

function DialogTitleSub({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  // Useful when the consumer renders the title imperatively rather than via
  // the `title` prop. Mostly here for symmetry with Dialog.Description /
  // Dialog.Footer; the `title` prop is the common path.
  return (
    <h2 className={cn('text-lg sm:text-xl font-semibold text-white', className)}>
      {children}
    </h2>
  )
}

function DialogDescription({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p className={cn('text-sm text-white/70 leading-relaxed', className)}>
      {children}
    </p>
  )
}

function DialogFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3',
        className
      )}
    >
      {children}
    </div>
  )
}

// Attach sub-components as static properties for the `Dialog.X` pattern.
type DialogComponent = typeof DialogRoot & {
  Title: typeof DialogTitleSub
  Description: typeof DialogDescription
  Footer: typeof DialogFooter
}

export const Dialog = DialogRoot as DialogComponent
Dialog.Title = DialogTitleSub
Dialog.Description = DialogDescription
Dialog.Footer = DialogFooter

export default Dialog
