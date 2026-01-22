import { io, Socket } from 'socket.io-client'

// Remove /api from the URL for Socket.IO connection
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  .replace('/api', '')

// Solo loggear en desarrollo
const isDev = process.env.NODE_ENV === 'development'
const log = (...args: any[]) => isDev && console.log(...args)

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()
  private connectionCount = 0 // Track number of components using the socket
  private currentUserId: string | null = null // Track current user
  private authToken: string | null = null // Auth token for WebSocket

  connect(userId: string, token?: string) {
    this.connectionCount++
    this.currentUserId = userId
    
    // Prefer passed token, fallback to stored token only if necessary
    if (token) {
      this.authToken = token
    } else if (!this.authToken) {
      // Only access localStorage as last resort fallback
      this.authToken = typeof window !== 'undefined' ? localStorage.getItem('apapacho-token') : null
    }
    
    log(`[Socket] Connection count: ${this.connectionCount}, userId: ${userId}`)
    
    if (!this.authToken) {
      log('[Socket] No auth token available, skipping connection')
      return
    }
    
    if (this.socket?.connected) {
      log('[Socket] Already connected, re-joining user room')
      // Re-join user room in case of reconnection or multiple connects
      this.socket.emit('join:user', userId)
      log('[Socket] Emitted join:user for:', userId)
      return
    }

    log('[Socket] Creating new connection to:', API_URL)
    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: this.authToken
      }
    })

    this.socket.on('connect', () => {
      log('✅ WebSocket connected:', this.socket?.id)
      // Join user-specific room
      log('[Socket] Emitting join:user for:', this.currentUserId)
      this.socket?.emit('join:user', this.currentUserId)
    })

    this.socket.on('reconnect', (attemptNumber) => {
      log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`)
      // Re-join user room after reconnection
      if (this.currentUserId) {
        log('[Socket] Re-joining user room after reconnect:', this.currentUserId)
        this.socket?.emit('join:user', this.currentUserId)
      }
    })

    this.socket.on('disconnect', () => {
      log('❌ WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      // Solo loggear error en desarrollo, en producción puede ser normal
      if (isDev) console.error('❌ WebSocket connection error:', error.message)
      
      // If authentication error, clear token and disconnect
      if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
        log('[Socket] Authentication failed, disconnecting')
        this.authToken = null
        this.disconnect()
      }
    })

    // Handle server-side errors
    this.socket.on('error', (error: { message: string }) => {
      log('[Socket] Server error:', error.message)
    })

    // Setup event listeners with logging
    this.socket.on('message:new', (message) => {
      log('[Socket] 📨 Received message:new event:', message)
      this.emit('message:new', message)
    })

    this.socket.on('unread:update', (data) => {
      log('[Socket] 🔔 Received unread:update event:', data)
      this.emit('unread:update', data)
    })

    this.socket.on('stats:update', (data) => {
      log('[Socket] 📊 Received stats:update event:', data)
      this.emit('stats:update', data)
    })
  }

  disconnect() {
    this.connectionCount--
    log(`[Socket] Disconnect called, connection count: ${this.connectionCount}`)
    
    // Only actually disconnect if no components are using it
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
      callbacks.forEach(callback => callback(data))
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

// Export singleton instance
export const socketService = new SocketService()
