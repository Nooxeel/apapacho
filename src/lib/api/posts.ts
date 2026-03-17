import { api } from './client'

// Post API
export const postApi = {
  // Likes
  toggleLike: (postId: string, token: string) =>
    api(`/posts/${postId}/like`, { method: 'POST', token }),

  getLikeStatus: (postId: string, token: string) =>
    api(`/posts/${postId}/like-status`, { token }),

  // Batch like status (fixes N+1 query problem)
  getBatchLikeStatus: (postIds: string[], token: string) =>
    api(`/posts/like-status/batch?postIds=${postIds.join(',')}`, { token }),

  // Comments
  getComments: (postId: string, limit = 50, offset = 0) =>
    api(`/posts/${postId}/comments?limit=${limit}&offset=${offset}`, {}),

  createComment: (postId: string, content: string, token: string) =>
    api(`/posts/${postId}/comments`, { method: 'POST', body: { content }, token }),

  deleteComment: (commentId: string, token: string) =>
    api(`/posts/comments/${commentId}`, { method: 'DELETE', token }),
}
