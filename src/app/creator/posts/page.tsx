'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, Button } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { Edit2, Trash2, Eye, Heart, MessageCircle, Image, Video, Plus } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface PostContent {
  type: 'text' | 'image' | 'video';
  content?: string;
  url?: string;
  caption?: string;
}

interface Post {
  id: string;
  title: string | null;
  description: string | null;
  content: PostContent[];
  visibility: string;
  price: number | null;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export default function CreatorPostsPage() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.push('/login');
      return;
    }
    loadPosts();
  }, [token, hasHydrated, router]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      console.log('[Posts] Fetching posts with token:', token?.substring(0, 20) + '...');
      const response = await fetch(`${API_URL}/posts/my-posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[Posts] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Posts] Posts loaded:', data.length);
        setPosts(data);
      } else {
        const errorData = await response.json();
        console.error('[Posts] Error response:', errorData);
      }
    } catch (error) {
      console.error('[Posts] Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditDescription(post.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    try {
      const response = await fetch(`${API_URL}/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription
        })
      });

      if (response.ok) {
        await loadPosts();
        setEditingPost(null);
        setEditTitle('');
        setEditDescription('');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error al actualizar el post');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) return;

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar el post');
    }
  };

  const getContentPreview = (content: PostContent[]) => {
    const images = content.filter(c => c.type === 'image');
    const videos = content.filter(c => c.type === 'video');
    
    return (
      <div className="flex gap-2 text-sm text-white/60">
        {images.length > 0 && (
          <div className="flex items-center gap-1">
            <Image className="w-4 h-4" />
            <span>{images.length}</span>
          </div>
        )}
        {videos.length > 0 && (
          <div className="flex items-center gap-1">
            <Video className="w-4 h-4" />
            <span>{videos.length}</span>
          </div>
        )}
      </div>
    );
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Mis <span className="gradient-text">Posts</span>
              </h1>
              <p className="text-white/60">Administra tu contenido</p>
            </div>
            <Link href="/creator/upload-image">
              <Button variant="primary" className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Crear Post
              </Button>
            </Link>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <Card variant="solid" className="p-12 text-center">
              <p className="text-white/60 mb-4">No tienes posts todavía</p>
              <Link href="/creator/upload-image">
                <Button variant="primary">Crear tu primer post</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} variant="solid" className="p-6">
                  {editingPost?.id === post.id ? (
                    // Modo edición
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                          placeholder="Título del post (opcional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none"
                          placeholder="Descripción del post"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="primary" onClick={handleSaveEdit}>
                          Guardar
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setEditingPost(null);
                            setEditTitle('');
                            setEditDescription('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo vista
                    <div className="flex gap-6">
                      {/* Preview Thumbnail */}
                      <div className="flex-shrink-0">
                        {post.content[0]?.type === 'image' && post.content[0].url && (
                          <div className="w-32 h-32 rounded-lg overflow-hidden bg-white/5">
                            <img 
                              src={`http://localhost:3001${post.content[0].url}`}
                              alt="Post preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {post.content[0]?.type === 'video' && post.content[0].url && (
                          <div className="w-32 h-32 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                            <Video className="w-8 h-8 text-white/40" />
                          </div>
                        )}
                        {!post.content[0] && (
                          <div className="w-32 h-32 rounded-lg bg-white/5 flex items-center justify-center">
                            <Image className="w-8 h-8 text-white/40" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {post.title || 'Sin título'}
                        </h3>
                        <p className="text-white/60 text-sm mb-3 line-clamp-2">
                          {post.description || 'Sin descripción'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-white/40">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </div>
                          {getContentPreview(post.content)}
                          <span className="ml-auto">
                            {new Date(post.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          className="!p-2"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit2 className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="!p-2 text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
