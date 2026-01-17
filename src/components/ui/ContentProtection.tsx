'use client'

import { useEffect } from 'react'

/**
 * ContentProtection component
 * Prevents right-click context menu, text selection on images,
 * and common keyboard shortcuts for saving content.
 * 
 * This is a deterrent, not a security measure - determined users can bypass it.
 * Real protection comes from watermarking, low-res previews, and server-side controls.
 */
export function ContentProtection() {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Allow right-click on input/textarea for paste functionality
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }
      
      e.preventDefault()
      return false
    }

    // Prevent common keyboard shortcuts for saving
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        return false
      }
      
      // Prevent Ctrl/Cmd + Shift + I (DevTools) - deterrent only
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        return false
      }
      
      // Prevent Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault()
        return false
      }
    }

    // Prevent drag on images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
        e.preventDefault()
        return false
      }
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
    }
  }, [])

  return null
}
