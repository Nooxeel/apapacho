import { io, Socket } from 'socket.io-client'

/**
 * Socket.IO client — R0-05
 *
 * Auth model (post-R0-05):
 *  - The access token lives only in httpOnly cookies. We pass
 *    `withCredentials: true` so Socket.IO's HTTP handshake forwards the
 *    cookie.
 *  - We intentionally no longer read `localStorage.getItem('apapacho-token')`
 *    (the previous key didn't even match the Zustand persist key — C3) and
 *    we do not pass `auth.token` anymore.
 *
 * BACKEND NOTE (tracked as a follow-up): the backend WebSocket middleware
 * (`backend/src/index.ts:264-298`) today only reads
 * `socket.handshake.auth.token` / `Authorization` header. Until that
 * middleware is updated to accept the JWT from the cookie jar, sockets will
 * fail to authenticate. That change is out of scope for this frontend
 * grouping (auth overhaul).
 */

// Remove /api from the URL for Socket.IO connection
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace('/api', '')

// Development-only logger to keep production consoles quiet.
const isDev = process.env.NODE_ENV === 'development'
const log = (...args: any[]) => isDev && console.log(...args)

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()
  // Reference counting so multiple components can share one socket.
  private connectionCount = 0
  private currentUserId: string | null = null

  connect(userId: string) {
    this.connectionCount++
    this.currentUserId = userId

    log(`[Socket] Connection count: ${this.connectionCount}, userId: ${userId}`)

    if (this.socket?.connected) {
      log('[Socket] Already connected, re-joining user room')
      this.socket.emit('join:user', userId)
      return
    }

    log('[Socket] Creating new connection to:', API_URL)
    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      // Cookie-based auth: the httpOnly session cookie is forwarded with the
      // handshake request by the browser.
      withCredentials: true,
    })

    this.socket.on('connect', () => {
      log('WebSocket connected:', this.socket?.id)
      log('[Socket] Emitting join:user for:', this.currentUserId)
      this.socket?.emit('join:user', this.currentUserId)
    })

    this.socket.on('reconnect', (attemptNumber) => {
      log(`WebSocket reconnected after ${attemptNumber} attempts`)
      if (this.currentUserId) {
        log('[Socket] Re-joining user room after reconnect:', this.currentUserId)
        this.socket?.emit('join:user', this.currentUserId)
      }
    })

    this.socket.on('disconnect', () => {
      log('WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      if (isDev) console.error('WebSocket connection error:', error.message)

      // On auth failure just tear down — there is nothing a token refresh
      // can do client-side now that the token lives in a cookie we cannot
      // read.
      if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
        log('[Socket] Authentication failed, disconnecting')
        this.disconnect()
      }
    })

    this.socket.on('error', (error: { message: string }) => {
      log('[Socket] Server error:', error.message)
    })

    this.socket.on('message:new', (message) => {
      log('[Socket] Received message:new event:', message)
      this.emit('message:new', message)
    })

    this.socket.on('unread:update', (data) => {
      log('[Socket] Received unread:update event:', data)
      this.emit('unread:update', data)
    })

    this.socket.on('stats:update', (data) => {
      log('[Socket] Received stats:update event:', data)
      this.emit('stats:update', data)
    })
  }

  disconnect() {
    this.connectionCount--
    log(`[Socket] Disconnect called, connection count: ${this.connectionCount}`)

    if (this.connectionCount <= 0 && this.socket) {
      log('[Socket] Actually disconnecting')
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
      this.connectionCount = 0
      this.currentUserId = null
    }
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('join:conversation', conversationId)
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave:conversation', conversationId)
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

// Export singleton instance
export const socketService = new SocketService()
