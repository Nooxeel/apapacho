'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout';
import SubscriptionTiersManager from '@/components/subscriptions/SubscriptionTiersManager';
import { ArrowLeft, Users, CreditCard } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface SubscriberInfo {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  };
  tier: {
    id: string;
    name: string;
    price: number;
  };
}

export default function CreatorSubscriptionsPage() {
  const router = useRouter();
  const { user, token, hasHydrated } = useAuthStore();
  const [subscribers, setSubscribers] = useState<SubscriberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tiers' | 'subscribers'>('tiers');

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || !user?.isCreator) {
      router.push('/login');
      return;
    }
    loadSubscribers();
  }, [hasHydrated, token, user, router]);

  const loadSubscribers = async () => {
    try {
      const response = await fetch(`${API_URL}/subscriptions/subscribers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data || []);
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-400" />
                Gestión de Suscripciones
              </h1>
              <p className="text-white/60">Administra tus planes y suscriptores</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('tiers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tiers'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Planes ({(user as any).subscriptionTiers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'subscribers'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Suscriptores ({subscribers.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'tiers' ? (
            <SubscriptionTiersManager token={token || ''} />
          ) : (
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Tus Suscriptores Activos</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">Aún no tienes suscriptores</p>
                  <p className="text-white/30 text-sm mt-2">
                    Comparte tu perfil para conseguir fans
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscribers.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {sub.user.displayName?.charAt(0) || sub.user.username.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{sub.user.displayName}</p>
                          <p className="text-white/50 text-sm">@{sub.user.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-400 font-medium">{sub.tier.name}</p>
                        <p className="text-white/50 text-sm">
                          Hasta {new Date(sub.endDate).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
