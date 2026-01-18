'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { uploadApi, ApiError, subscriptionsApi } from '@/lib/api';
import { API_URL } from '@/lib/config';
import {
  User,
  Heart,
  CreditCard,
  MessageCircle,
  Gift,
  Settings,
  Camera,
  LogOut,
  BadgeCheck,
  Receipt,
  Calendar,
  Video,
  Image as ImageIcon,
  ArrowRight,
  Users
} from 'lucide-react';

interface Subscription {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  tier: {
    name: string;
    price: number;
    currency: string;
  };
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    profileImage: string | null;
    isVerified: boolean;
  };
}

interface Favorite {
  id: string;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    profileImage: string | null;
    bio: string | null;
    isVerified: boolean;
    accentColor: string;
  };
}

interface UserStats {
  activeSubscriptions: number;
  favorites: number;
  comments: number;
  donations: number;
  fans?: number; // Cuántos usuarios tienen a este creador en favoritos
}

interface Payment {
  id: string;
  type: 'donation' | 'subscription';
  amount: number;
  currency: string;
  message?: string;
  tierName?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    profileImage: string | null;
    isVerified: boolean;
  };
}

interface MyComment {
  id: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  creator: {
    id: string;
    user: {
      username: string;
      displayName: string;
      avatar: string | null;
    };
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, updateUser, hasHydrated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'favorites' | 'payments' | 'comments'>('favorites');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pendingCommentsCount, setPendingCommentsCount] = useState(0);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // Esperar a que el store se hidrate desde localStorage
    if (!hasHydrated) return;
    
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [token, router, hasHydrated]);

  const loadData = async () => {
    if (!token) return;

    setIsLoading(true);

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Ejecutar TODAS las llamadas en paralelo para reducir tiempo de carga
      const [statsRes, subsRes, favsRes, paymentsRes, commentsRes, pendingRes] = await Promise.all([
        fetch(`${API_URL}/users/me/stats`, { headers }),
        fetch(`${API_URL}/users/me/subscriptions`, { headers }),
        fetch(`${API_URL}/favorites`, { headers }),
        fetch(`${API_URL}/users/me/payments`, { headers }),
        fetch(`${API_URL}/comments/user/my-comments`, { headers }),
        // Solo cargar comentarios pendientes si es creador
        user?.isCreator
          ? fetch(`${API_URL}/comments/creator/pending`, { headers })
          : Promise.resolve(null)
      ]);

      // Procesar respuestas
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (subsRes.ok) {
        setSubscriptions(await subsRes.json());
      }

      if (favsRes.ok) {
        setFavorites(await favsRes.json());
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
        // Actualizar stats con el conteo de comentarios
        if (stats) {
          setStats(prev => prev ? { ...prev, comments: commentsData.length } : prev);
        }
      }

      if (pendingRes && pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingCommentsCount(pendingData.length || 0);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !token) return;

    setUploadingAvatar(true);

    try {
      const data = await uploadApi.avatar(file, token);
      updateUser({ avatar: data.url });
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        logout();
        router.push('/login');
        return;
      }
      console.error('Error subiendo avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const removeFavorite = async (creatorId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/favorites/${creatorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setFavorites(prev => prev.filter(f => f.creator.id !== creatorId));
        if (stats) {
          setStats({ ...stats, favorites: stats.favorites - 1 });
        }
      }
    } catch (error) {
      console.error('Error eliminando favorito:', error);
    }
  };

  // Handler para cancelar suscripción
  const handleCancelSubscription = async () => {
    if (!token || !selectedSubscription) return;

    setCancelling(true);
    try {
      await subscriptionsApi.unsubscribe(selectedSubscription.creator.id, token);
      
      // Actualizar lista de suscripciones
      setSubscriptions(prev => prev.filter(s => s.id !== selectedSubscription.id));
      setShowCancelConfirm(false);
      setShowManageModal(false);
      setSelectedSubscription(null);
      
      alert('✅ Suscripción cancelada. Mantendrás acceso hasta el fin del período pagado.');
      
      // Recargar datos
      loadData();
      
    } catch (error: any) {
      console.error('Error al cancelar suscripción:', error);
      alert(error.message || 'Error al cancelar la suscripción. Intenta de nuevo.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;
    
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        if (stats) {
          setStats({ ...stats, comments: stats.comments - 1 });
        }
      }
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      alert('Error al eliminar el comentario');
    }
  };

  const getCreatorImage = (creator: Favorite['creator'] | Subscription['creator']) => {
    if (creator.profileImage) {
      return creator.profileImage;
    }
    if (creator.avatar) {
      return creator.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.displayName)}&background=random&size=100`;
  };

  const getUserAvatar = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=random&size=150`;
  };

  // Mostrar loading mientras se hidrata el store o no hay usuario
  if (!hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar con opción de subir */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                <Image
                  src={getUserAvatar()}
                  alt={user.displayName}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Camera className="w-8 h-8" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <p className="text-white/70">@{user.username}</p>
              <p className="text-white/50 text-sm mt-1">{user.email}</p>

              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                {user.isCreator ? (
                  <Link
                    href="/creator/edit"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-fuchsia-600/80 rounded-full text-sm hover:bg-fuchsia-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Editar perfil
                  </Link>
                ) : (
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-fuchsia-600/80 rounded-full text-sm hover:bg-fuchsia-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Editar mi perfil
                  </Link>
                )}
              </div>
            </div>

            {/* Logout */}
            <div className="md:ml-auto">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Action Cards - Only for creators */}
      {user.isCreator && (
        <div className="max-w-5xl mx-auto px-4 mt-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
            </svg>
            Herramientas de Creador
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Subir Video */}
            <button
              onClick={() => router.push('/creator/upload-video')}
              className="group bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 hover:from-purple-500/20 hover:to-fuchsia-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm text-white">Subir Video</h3>
              </div>
            </button>

            {/* Subir Foto */}
            <button
              onClick={() => router.push('/creator/upload-image')}
              className="group bg-gradient-to-br from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border border-pink-500/20 hover:border-pink-500/40 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm text-white">Subir Foto</h3>
              </div>
            </button>

            {/* Mis Ganancias */}
            <button
              onClick={() => router.push('/creator/earnings')}
              className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/20 hover:border-green-500/40 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm text-white">Ganancias</h3>
              </div>
            </button>

            {/* Suscripciones */}
            <button
              onClick={() => router.push('/creator/subscriptions')}
              className="group bg-gradient-to-br from-indigo-500/10 to-violet-500/10 hover:from-indigo-500/20 hover:to-violet-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm text-white">Planes</h3>
              </div>
            </button>

            {/* Libro de Visitas */}
            <button
              onClick={() => router.push('/creator/comments')}
              className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 relative"
            >
              {pendingCommentsCount > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
                  {pendingCommentsCount}
                </div>
              )}
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm text-white">Visitas</h3>
              </div>
            </button>

            {/* Editar Perfil */}
            <button
              onClick={() => router.push('/creator/edit')}
              className="group bg-gradient-to-br from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border border-orange-500/20 hover:border-orange-500/40 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm text-white">Editar</h3>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {user.isCreator ? (
          // Stats para creadores
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              value={stats?.fans || 0}
              label="Fans"
              color="bg-purple-500"
            />
            <StatCard
              icon={<CreditCard className="w-5 h-5" />}
              value={stats?.activeSubscriptions || 0}
              label="Suscripciones"
              color="bg-blue-500"
            />
            <StatCard
              icon={<MessageCircle className="w-5 h-5" />}
              value={stats?.comments || 0}
              label="Comentarios"
              color="bg-green-500"
            />
            <StatCard
              icon={<Gift className="w-5 h-5" />}
              value={stats?.donations || 0}
              label="Propinas"
              color="bg-yellow-500"
            />
            <StatCard
              icon={<Heart className="w-5 h-5" />}
              value={stats?.favorites || 0}
              label="Favoritos"
              color="bg-pink-500"
            />
          </div>
        ) : (
          // Stats para fans normales
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<CreditCard className="w-5 h-5" />}
              value={stats?.activeSubscriptions || 0}
              label="Suscripciones"
              color="bg-blue-500"
            />
            <StatCard
              icon={<Heart className="w-5 h-5" />}
              value={stats?.favorites || 0}
              label="Favoritos"
              color="bg-pink-500"
            />
            <StatCard
              icon={<MessageCircle className="w-5 h-5" />}
              value={stats?.comments || 0}
              label="Comentarios"
              color="bg-green-500"
            />
            <StatCard
              icon={<Gift className="w-5 h-5" />}
              value={stats?.donations || 0}
              label="Propinas"
              color="bg-yellow-500"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex gap-4 border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Favoritos ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Suscripciones ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'payments'
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4 inline mr-2" />
            Historial ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Comentarios ({comments.length})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-fuchsia-500 mx-auto"></div>
          </div>
        ) : activeTab === 'favorites' ? (
          favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map(fav => (
                <div
                  key={fav.id}
                  className="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
                >
                  <Link href={`/${fav.creator.username}`} className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={getCreatorImage(fav.creator)}
                        alt={fav.creator.displayName}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{fav.creator.displayName}</span>
                        {fav.creator.isVerified && (
                          <BadgeCheck 
                            className="w-4 h-4 flex-shrink-0" 
                            style={{ color: fav.creator.accentColor }}
                            fill={fav.creator.accentColor}
                          />
                        )}
                      </div>
                      <p className="text-white/50 text-sm">@{fav.creator.username}</p>
                      {fav.creator.bio && (
                        <p className="text-white/40 text-xs mt-1 line-clamp-1">{fav.creator.bio}</p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(fav.creator.id)}
                    className="p-2 text-white/40 hover:text-red-400 transition-colors"
                    title="Quitar de favoritos"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aún no tienes creadores favoritos</p>
              <Link
                href="/"
                className="inline-block mt-4 px-6 py-2 bg-fuchsia-600 rounded-full text-white hover:bg-fuchsia-500 transition-colors"
              >
                Explorar creadores
              </Link>
            </div>
          )
        ) : activeTab === 'subscriptions' ? (
          subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.map(sub => (
                <div
                  key={sub.id}
                  className="bg-white/5 rounded-xl p-4 flex items-center gap-4"
                >
                  <Link href={`/${sub.creator.username}`} className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={getCreatorImage(sub.creator)}
                        alt={sub.creator.displayName}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{sub.creator.displayName}</span>
                        {sub.creator.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-fuchsia-400" fill="currentColor" />
                        )}
                      </div>
                      <p className="text-white/50 text-sm">@{sub.creator.username}</p>
                    </div>
                  </Link>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-fuchsia-400">
                        ${sub.tier.price.toFixed(2)}/{sub.tier.currency}
                      </p>
                      <p className="text-xs text-white/40">{sub.tier.name}</p>
                      <p className="text-xs text-green-400 mt-1">Activa</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSubscription(sub);
                        setShowManageModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                    >
                      Gestionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tienes suscripciones activas</p>
              <Link
                href="/"
                className="inline-block mt-4 px-6 py-2 bg-fuchsia-600 rounded-full text-white hover:bg-fuchsia-500 transition-colors"
              >
                Explorar creadores
              </Link>
            </div>
          )
        ) : activeTab === 'payments' ? (
          // Tab de Historial de Pagos
          payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map(payment => (
                <div
                  key={payment.id}
                  className="bg-white/5 rounded-xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <Link href={`/${payment.creator.username}`} className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={getCreatorImage(payment.creator)}
                          alt={payment.creator.displayName}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{payment.creator.displayName}</span>
                          {payment.creator.isVerified && (
                            <BadgeCheck className="w-4 h-4 text-fuchsia-400" fill="currentColor" />
                          )}
                        </div>
                        <p className="text-white/50 text-sm">@{payment.creator.username}</p>
                      </div>
                    </Link>
                    <div className="text-right">
                      <p className="font-semibold text-fuchsia-400">
                        ${payment.amount.toFixed(2)} {payment.currency}
                      </p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        {payment.type === 'donation' ? (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            Propina
                          </span>
                        ) : (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {payment.tierName || 'Suscripción'}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          payment.status === 'completed' || payment.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : payment.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : payment.status === 'cancelled' || payment.status === 'expired'
                            ? 'bg-white/10 text-white/50'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {payment.status === 'completed' ? 'Completado' : 
                           payment.status === 'active' ? 'Activa' :
                           payment.status === 'pending' ? 'Pendiente' :
                           payment.status === 'cancelled' ? 'Cancelada' :
                           payment.status === 'expired' ? 'Expirada' : payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Fecha y mensaje */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(payment.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    {payment.message && (
                      <p className="text-white/50 italic truncate max-w-[200px]">"{payment.message}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tienes historial de pagos</p>
              <p className="text-sm mt-2">Tus propinas y suscripciones aparecerán aquí</p>
            </div>
          )
        ) : activeTab === 'comments' ? (
          comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info del creador */}
                    <div className="flex-1">
                      <Link 
                        href={`/${comment.creator.user.username}`}
                        className="text-white/80 hover:text-white font-medium inline-flex items-center gap-2 mb-2"
                      >
                        Comentario en el perfil de <span className="gradient-text">{comment.creator.user.displayName}</span>
                      </Link>
                      <p className="text-white mb-3">{comment.content}</p>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full ${
                          comment.isApproved 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {comment.isApproved ? '✓ Aprobado' : '⏱ Pendiente'}
                        </span>
                      </div>
                    </div>
                    {/* Botón eliminar */}
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                      title="Eliminar comentario"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No has enviado comentarios</p>
              <p className="text-sm mt-2">Tus comentarios en perfiles de creadores aparecerán aquí</p>
            </div>
          )
        ) : null}
      </div>

      {/* Manage Subscription Modal */}
      {showManageModal && selectedSubscription && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowManageModal(false)}
        >
          <div 
            className="bg-[#1a1a24] rounded-2xl border border-white/10 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Gestionar Suscripción</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Subscription Info */}
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Creador</span>
                  <span className="font-semibold text-white">{selectedSubscription.creator.displayName}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Plan</span>
                  <span className="font-semibold text-white">{selectedSubscription.tier.name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Precio</span>
                  <span className="font-semibold text-fuchsia-400">
                    ${selectedSubscription.tier.price.toFixed(2)}/{selectedSubscription.tier.currency}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Fecha de inicio</span>
                  <span className="text-white">{new Date(selectedSubscription.startDate).toLocaleDateString('es-CL')}</span>
                </div>
                {selectedSubscription.endDate && (
                  <div className="flex justify-between items-start">
                    <span className="text-white/50 text-sm">Válido hasta</span>
                    <span className="text-white">{new Date(selectedSubscription.endDate).toLocaleDateString('es-CL')}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-sm">Estado</span>
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    {selectedSubscription.status === 'active' ? 'Activa' : selectedSubscription.status}
                  </span>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setShowCancelConfirm(true);
                }}
                className="w-full py-3 rounded-lg font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
              >
                Cancelar Suscripción
              </button>

              <button
                onClick={() => setShowManageModal(false)}
                className="w-full py-2 text-white/50 hover:text-white transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && selectedSubscription && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => !cancelling && setShowCancelConfirm(false)}
        >
          <div 
            className="bg-[#1a1a24] rounded-2xl border border-white/10 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              {/* Warning Icon */}
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-white">
                ¿Cancelar suscripción?
              </h2>

              {/* Message */}
              <div className="space-y-2 text-white/70 text-sm">
                <p>Estás a punto de cancelar tu suscripción a <span className="font-semibold text-white">{selectedSubscription.creator.displayName}</span></p>
                {selectedSubscription.endDate && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-200">
                    <p className="font-medium">ℹ️ Importante:</p>
                    <p className="mt-1">Mantendrás acceso al contenido exclusivo hasta el <span className="font-semibold">{new Date(selectedSubscription.endDate).toLocaleDateString('es-CL')}</span></p>
                  </div>
                )}
                <p className="text-white/50 text-xs mt-3">Podrás volver a suscribirte en cualquier momento</p>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="w-full py-3 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelando...' : 'Sí, cancelar suscripción'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelling}
                  className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30"
                >
                  No, mantener suscripción
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
      <div className={`${color} p-3 rounded-full`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-white/50 text-sm">{label}</p>
      </div>
    </div>
  );
}
