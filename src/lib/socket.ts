import { io, Socket } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()
  private connectionCount = 0 // Track number of components using the socket
  private currentUserId: string | null = null // Track current user

  connect(userId: string) {
    this.connectionCount++
    this.currentUserId = userId
    console.log(`[Socket] Connection count: ${this.connectionCount}, userId: ${userId}`)
    
    if (this.socket?.connected) {
      console.log('[Socket] Already connected, re-joining user room')
      // Re-join user room in case of reconnection or multiple connects
      this.socket.emit('join:user', userId)
      console.log('[Socket] Emitted join:user for:', userId)
      return
    }

    console.log('[Socket] Creating new connection to:', API_URL)
    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id)
      // Join user-specific room
      console.log('[Socket] Emitting join:user for:', this.currentUserId)
      this.socket?.emit('join:user', this.currentUserId)
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`)
      // Re-join user room after reconnection
      if (this.currentUserId) {
        console.log('[Socket] Re-joining user room after reconnect:', this.currentUserId)
        this.socket?.emit('join:user', this.currentUserId)
      }
    })

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
    })

    // Setup event listeners with logging
    this.socket.on('message:new', (message) => {
      console.log('[Socket] 📨 Received message:new event:', message)
      this.emit('message:new', message)
    })

    this.socket.on('unread:update', (data) => {
      console.log('[Socket] 🔔 Received unread:update event:', data)
      this.emit('unread:update', data)
    })

    this.socket.on('stats:update', (data) => {
      console.log('[Socket] 📊 Received stats:update event:', data)
      this.emit('stats:update', data)
    })
  }

  disconnect() {
    this.connectionCount--
    console.log(`[Socket] Disconnect called, connection count: ${this.connectionCount}`)
    
    // Only actually disconnect if no components are using it
    if (this.connectionCount <= 0 && this.socket) {
      console.log('[Socket] Actually disconnecting')
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
