'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface CommentUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

interface Comment {
  id: string;
  userId: string;
  creatorId: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

interface CommentsProps {
  creatorId: string;
  isOwner?: boolean;
  accentColor?: string;
}

export default function Comments({ creatorId, isOwner = false, accentColor = '#d946ef' }: CommentsProps) {
  const { user, token } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Cargar comentarios aprobados
  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/comments/${creatorId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error cargando comentarios:', err);
    }
  }, [creatorId]);

  // Cargar comentarios pendientes (solo para el dueño)
  const loadPendingComments = useCallback(async () => {
    if (!isOwner || !token) return;
    
    try {
      const response = await fetch(`${API_URL}/comments/${creatorId}/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingComments(data);
      }
    } catch (err) {
      console.error('Error cargando comentarios pendientes:', err);
    }
  }, [creatorId, isOwner, token]);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([loadComments(), loadPendingComments()]);
      setIsLoading(false);
    };
    loadAll();
  }, [loadComments, loadPendingComments]);

  // Enviar nuevo comentario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/comments/${creatorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (response.ok) {
        const comment = await response.json();
        setNewComment('');
        
        if (comment.isApproved) {
          // Si fue auto-aprobado (es el dueño), añadir a comentarios visibles
          setComments(prev => [comment, ...prev]);
        } else {
          // Mostrar mensaje de que está pendiente
          setError('✓ Tu comentario fue enviado y está pendiente de aprobación');
          setTimeout(() => setError(null), 3000);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Error al enviar comentario');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aprobar comentario
  const handleApprove = async (commentId: string) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const approved = await response.json();
        setPendingComments(prev => prev.filter(c => c.id !== commentId));
        setComments(prev => [approved, ...prev]);
      }
    } catch (err) {
      console.error('Error aprobando comentario:', err);
    }
  };

  // Rechazar/eliminar comentario
  const handleDelete = async (commentId: string, isPending: boolean) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        if (isPending) {
          setPendingComments(prev => prev.filter(c => c.id !== commentId));
        } else {
          setComments(prev => prev.filter(c => c.id !== commentId));
        }
      }
    } catch (err) {
      console.error('Error eliminando comentario:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getUserAvatar = (comment: Comment) => {
    if (comment.user.avatar) {
      return `/images/${comment.userId}/profile.jpeg`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.displayName)}&background=random`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📖 Libro de visitas
            <span className="text-sm text-white/60">({comments.length})</span>
          </h3>
          
          {isOwner && pendingComments.length > 0 && (
            <button
              onClick={() => setShowPending(!showPending)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: showPending ? accentColor : 'rgba(255,255,255,0.1)',
                color: showPending ? 'white' : accentColor
              }}
            >
              🔔 {pendingComments.length} pendiente{pendingComments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
        <p className="text-sm text-white/50">
          Deja tu mensaje. El creador lo aprueba antes de mostrarlo.
        </p>
      </div>

      {/* Comentarios pendientes (solo visible para el dueño) */}
      {isOwner && showPending && pendingComments.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <h4 className="text-sm font-medium text-yellow-400 mb-3">Pendientes de aprobación</h4>
          <div className="space-y-3">
            {pendingComments.map(comment => (
              <div key={comment.id} className="bg-black/20 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <img
                    src={getUserAvatar(comment)}
                    alt={comment.user.displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.user.displayName}</span>
                      <span className="text-xs text-white/40">@{comment.user.username}</span>
                    </div>
                    <p className="text-sm text-white/80">{comment.content}</p>
                    <span className="text-xs text-white/40">{formatDate(comment.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    onClick={() => handleApprove(comment.id)}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium hover:bg-green-500/30 transition-colors"
                  >
                    ✓ Aprobar
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id, true)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium hover:bg-red-500/30 transition-colors"
                  >
                    ✕ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario para nuevo comentario */}
      {user && token ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-3">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                maxLength={500}
                rows={2}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none focus:outline-none transition-colors"
                style={{ borderColor: newComment ? accentColor : undefined }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-white/40">{newComment.length}/500</span>
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: accentColor }}
                >
                  {isSubmitting ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </div>
          </div>
          {error && (
            <p className={`text-sm mt-2 ${error.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="mb-4 p-4 bg-white/5 rounded-lg text-center">
          <p className="text-white/60 text-sm">
            <a href="/login" className="underline" style={{ color: accentColor }}>Inicia sesión</a> para dejar un comentario
          </p>
        </div>
      )}

      {/* Lista de comentarios aprobados */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-3 group">
              <img
                src={getUserAvatar(comment)}
                alt={comment.user.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.user.displayName}</span>
                  <span className="text-sm text-white/40">@{comment.user.username}</span>
                  <span className="text-xs text-white/30">• {formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-white/80">{comment.content}</p>
              </div>
              {/* Botón de eliminar (visible para el autor o el dueño del perfil) */}
              {(user?.id === comment.userId || isOwner) && (
                <button
                  onClick={() => handleDelete(comment.id, false)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 transition-all"
                  title="Eliminar comentario"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-white/40">
          <p>Aún no hay comentarios</p>
          <p className="text-sm mt-1">¡Sé el primero en comentar!</p>
        </div>
      )}
    </div>
  );
}
