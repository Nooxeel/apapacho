'use client'

import { useEffect, useState, createContext, useContext, ReactNode, useCallback, useRef } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

/**
 * ContentProtection component
 * Prevents right-click context menu, text selection on images,
 * and common keyboard shortcuts for saving content.
 * 
 * Enhanced features:
 * - Blur content when window loses focus (Alt+Tab, minimize)
 * - Detect PrintScreen key and screenshot shortcuts
 * - Show warning when screenshot attempt is detected
 * - Report screenshot attempts to backend for tracking
 * 
 * This is a deterrent, not a security measure - determined users can bypass it.
 * Real protection comes from watermarking, low-res previews, and server-side controls.
 */

// Context to share screenshot detection state
interface ProtectionContextType {
  isBlurred: boolean
  showWarning: boolean
  triggerWarning: (method?: string, postId?: string, creatorId?: string) => void
  setCurrentContent: (postId?: string, creatorId?: string) => void
}

const ProtectionContext = createContext<ProtectionContextType>({
  isBlurred: false,
  showWarning: false,
  triggerWarning: () => {},
  setCurrentContent: () => {},
})

export const useProtection = () => useContext(ProtectionContext)

interface ContentProtectionProps {
  children?: ReactNode
  blurOnFocusLoss?: boolean
  creatorId?: string
}

export function ContentProtection({ children, blurOnFocusLoss = true, creatorId }: ContentProtectionProps) {
  const [isBlurred, setIsBlurred] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const { token } = useAuthStore()
  
  // Track current content being viewed
  const currentPostId = useRef<string | undefined>(undefined)
  const currentCreatorId = useRef<string | undefined>(creatorId)

  const setCurrentContent = useCallback((postId?: string, cId?: string) => {
    currentPostId.current = postId
    if (cId) currentCreatorId.current = cId
  }, [])

  // Report screenshot attempt to backend
  const reportScreenshotAttempt = useCallback(async (method: string, postId?: string, cId?: string) => {
    if (!token) return // Only track logged-in users
    
    try {
      await api('/security/screenshot-attempt', {
        method: 'POST',
        body: {
          method,
          postId: postId || currentPostId.current,
          creatorId: cId || currentCreatorId.current,
          pageUrl: window.location.pathname,
        },
        token,
      })
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('Failed to report screenshot attempt:', error)
    }
  }, [token])

  const triggerWarning = useCallback((method = 'unknown', postId?: string, cId?: string) => {
    setShowWarning(true)
    setIsBlurred(true)
    
    // Report to backend
    reportScreenshotAttempt(method, postId, cId)
    
    setTimeout(() => {
      setIsBlurred(false)
    }, 1000)
  }, [reportScreenshotAttempt])

  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Allow right-click on input/textarea for paste functionality
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }
      
      e.preventDefault()
      triggerWarning('right-click')
      return false
    }

    // Prevent common keyboard shortcuts for saving/screenshots
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        triggerWarning('ctrl-s')
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

      // Detect PrintScreen key
      if (e.key === 'PrintScreen') {
        triggerWarning('printscreen')
      }

      // Windows + Shift + S (Windows Snipping Tool)
      if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        triggerWarning('snipping-tool')
      }

      // Cmd + Shift + 3/4/5 (Mac screenshots)
      if ((e.key === '3' || e.key === '4' || e.key === '5') && e.shiftKey && e.metaKey) {
        triggerWarning('mac-screenshot')
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

    // Handle visibility change (tab switch, minimize)
    const handleVisibilityChange = () => {
      if (blurOnFocusLoss) {
        if (document.hidden) {
          setIsBlurred(true)
        } else {
          setTimeout(() => setIsBlurred(false), 300)
        }
      }
    }

    // Handle window blur/focus
    const handleBlur = () => {
      if (blurOnFocusLoss) {
        setIsBlurred(true)
      }
    }

    const handleFocus = () => {
      if (blurOnFocusLoss) {
        setTimeout(() => setIsBlurred(false), 300)
      }
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [blurOnFocusLoss, triggerWarning])

  // Dismiss warning after 3 seconds
  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => setShowWarning(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showWarning])

  return (
    <ProtectionContext.Provider value={{ isBlurred, showWarning, triggerWarning, setCurrentContent }}>
      {children}
      
      {/* Global warning overlay */}
      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[100] animate-fade-in pointer-events-none">
          <div className="text-center p-6 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Contenido Protegido
            </h3>
            <p className="text-white/70 text-sm">
              Este contenido está protegido. Las capturas de pantalla y descargas no están permitidas.
            </p>
          </div>
        </div>
      )}
    </ProtectionContext.Provider>
  )
}

/**
 * ProtectedMedia - Wrapper for images/videos with blur effect
 */
interface ProtectedMediaProps {
  children: ReactNode
  className?: string
  watermarkText?: string
  postId?: string
  creatorId?: string
}

export function ProtectedMedia({ children, className = '', watermarkText, postId, creatorId }: ProtectedMediaProps) {
  const { isBlurred, triggerWarning } = useProtection()

  // Handle right-click specifically on this media
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    triggerWarning('right-click-media', postId, creatorId)
  }

  return (
    <div 
      className={`relative select-none ${className}`}
      style={{
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Content with conditional blur */}
      <div className={`transition-all duration-300 ${isBlurred ? 'blur-xl opacity-50' : ''}`}>
        {children}
      </div>

      {/* Watermark overlay */}
      {watermarkText && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
          style={{ opacity: 0.08 }}
        >
          <div 
            className="absolute inset-0 flex flex-wrap items-center justify-center gap-12 -rotate-45 scale-150"
            style={{ 
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              textShadow: '0 0 10px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
            }}
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} className="select-none">
                {watermarkText}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
