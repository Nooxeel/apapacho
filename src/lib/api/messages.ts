import { api } from './client'

// Message API
export const messageApi = {
  getConversations: (token: string) => api('/messages/conversations', { token }),

  createConversation: (recipientId: string, token: string) =>
    api('/messages/conversations', { method: 'POST', body: { recipientId }, token }),

  getMessages: (conversationId: string, token: string, cursor?: string) => {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
    return api(`/messages/conversations/${conversationId}/messages${query}`, { token })
  },

  sendMessage: (
    conversationId: string,
    data: { content: string; type?: string; price?: number },
    token: string
  ) => api(`/messages/conversations/${conversationId}/messages`, { method: 'POST', body: data, token }),

  getUnreadCount: (token: string) => api('/messages/unread-count', { token }),

  deleteMessage: (messageId: string, token: string) =>
    api(`/messages/messages/${messageId}`, { method: 'DELETE', token }),

  updateConversationStatus: (conversationId: string, status: string, token: string) =>
    api(`/messages/conversations/${conversationId}/status`, { method: 'PATCH', body: { status }, token }),
}
