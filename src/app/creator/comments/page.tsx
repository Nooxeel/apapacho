'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button, Card } from '@/components/ui';
import { MessageCircle, Check, X, Trash2, Clock, CheckCircle } from 'lucide-react';
import { API_URL } from '@/lib/config';

interface Comment {
  id: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  };
}

export default function CreatorCommentsPage() {
  const router = useRouter();
  const { token, user, hasHydrated } = useAuthStore();
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [approvedComments, setApprovedComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || !user?.isCreator) {
      router.push('/login');
      return;
    }
    fetchCreatorProfile();
  }, [token, user, hasHydrated, router]);

  useEffect(() => {
    if (creatorProfile) {
      fetchComments();
    }
  }, [creatorProfile]);

  const fetchCreatorProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/creators/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error body:', errorText);
        return;
      }
      
      const data = await response.json();
      console.log('Creator profile loaded:', data);
      setCreatorProfile(data);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    }
  };

  const fetchComments = async () => {
    if (!creatorProfile) {
      console.log('No creator profile yet');
      return;
    }
    
    console.log('Fetching comments for creator:', creatorProfile.id);
    
    try {
      setIsLoading(true);
      
      const [pendingRes, approvedRes] = await Promise.all([
        fetch(`${API_URL}/comments/${creatorProfile.id}/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/comments/${creatorProfile.id}`)
      ]);
      
      console.log('Pending response:', pendingRes.status);
      console.log('Approved response:', approvedRes.status);
      
      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();
      
      console.log('Pending data:', pendingData);
      console.log('Approved data:', approvedData);
      
      // Validar que sean arrays antes de asignar
      if (Array.isArray(pendingData)) {
        setPendingComments(pendingData);
      } else {
        console.error('Pending comments response is not an array:', pendingData);
        setPendingComments([]);
      }
      
      if (Array.isArray(approvedData)) {
        setApprovedComments(approvedData);
      } else {
        console.error('Approved comments response is not an array:', approvedData);
        setApprovedComments([]);
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      setPendingComments([]);
      setApprovedComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Actualizar estado local
        const comment = pendingComments.find(c => c.id === commentId);
        if (comment) {
          setPendingComments(prev => prev.filter(c => c.id !== commentId));
          setApprovedComments(prev => [{ ...comment, isApproved: true }, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error al aprobar comentario:', error);
      alert('Error al aprobar comentario');
    }
  };

  const handleDelete = async (commentId: string, isPending: boolean) => {
    if (!confirm('¿Estás seguro de eliminar este mensaje del libro de visitas?')) return;
    
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        if (isPending) {
          setPendingComments(prev => prev.filter(c => c.id !== commentId));
        } else {
          setApprovedComments(prev => prev.filter(c => c.id !== commentId));
        }
      }
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      alert('Error al eliminar comentario');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const CommentCard = ({ comment, isPending }: { comment: Comment; isPending: boolean }) => (
    <Card variant="solid" className="p-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          {comment.user.avatar ? (
            <img src={comment.user.avatar} alt={comment.user.displayName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white font-semibold">
              {comment.user.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{comment.user.displayName}</span>
            <span className="text-white/40 text-sm">@{comment.user.username}</span>
            {isPending && (
              <span className="ml-auto flex items-center gap-1 text-xs text-yellow-400">
                <Clock className="w-3 h-3" />
                Pendiente
              </span>
            )}
            {!isPending && (
              <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
                <CheckCircle className="w-3 h-3" />
                Aprobado
              </span>
            )}
          </div>
          <p className="text-white/80 text-sm mb-2">{comment.content}</p>
          <span className="text-white/40 text-xs">{formatDate(comment.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          {isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(comment.id)}
              className="text-green-400 hover:text-green-300"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(comment.id, isPending)}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Administrar <span className="gradient-text">Libro de visitas</span>
            </h1>
            <p className="text-white/60">
              Aprueba o rechaza los mensajes en tu libro de visitas
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'pending'
                  ? 'text-fuchsia-400'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Pendientes
              {pendingComments.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  {pendingComments.length}
                </span>
              )}
              {activeTab === 'pending' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-fuchsia-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'approved'
                  ? 'text-fuchsia-400'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Aprobados
              {approvedComments.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {approvedComments.length}
                </span>
              )}
              {activeTab === 'approved' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-fuchsia-400" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'pending' && (
              <>
                {pendingComments.length === 0 ? (
                  <Card variant="solid" className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No hay mensajes pendientes
                    </h3>
                    <p className="text-white/60 text-sm">
                      Los nuevos mensajes en tu libro de visitas aparecerán aquí para tu aprobación
                    </p>
                  </Card>
                ) : (
                  pendingComments.map(comment => (
                    <CommentCard key={comment.id} comment={comment} isPending={true} />
                  ))
                )}
              </>
            )}

            {activeTab === 'approved' && (
              <>
                {approvedComments.length === 0 ? (
                  <Card variant="solid" className="p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No hay mensajes aprobados
                    </h3>
                    <p className="text-white/60 text-sm">
                      Los mensajes aprobados de tu libro de visitas aparecerán aquí
                    </p>
                  </Card>
                ) : (
                  approvedComments.map(comment => (
                    <CommentCard key={comment.id} comment={comment} isPending={false} />
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
