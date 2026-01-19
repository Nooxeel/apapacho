'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { gamificationApi, type UserLevelResponse, type UserPointsInfo } from '@/lib/api';
import { 
  StreakDisplay, 
  Leaderboard, 
  BadgesDisplay, 
  LevelDisplay, 
  LevelBadge, 
  LevelPerksDisplay,
  MissionsDisplay,
  AvatarWithProgress 
} from '@/components/gamification';
import { Navbar } from '@/components/layout';
import {
  Trophy,
  Target,
  Flame,
  Star,
  Gift,
  Medal,
  Zap,
  TrendingUp,
  Award,
  Crown,
  Coins
} from 'lucide-react';

export default function RewardsPage() {
  const router = useRouter();
  const { user, token, hasHydrated } = useAuthStore();
  const [levelData, setLevelData] = useState<UserLevelResponse | null>(null);
  const [pointsData, setPointsData] = useState<UserPointsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'missions' | 'badges' | 'perks' | 'leaderboard'>('missions');

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.push('/login');
      return;
    }
    loadLevelData();
  }, [hasHydrated, token, router]);

  const loadLevelData = async () => {
    if (!token) return;
    try {
      const [levelResponse, pointsResponse] = await Promise.all([
        gamificationApi.getMyLevel(token),
        gamificationApi.getPoints(token),
      ]);
      setLevelData(levelResponse);
      setPointsData(pointsResponse);
    } catch (error) {
      console.error('Error loading level data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserAvatar = () => {
    if (user?.avatar) return user.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=random&size=150`;
  };

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-fuchsia-600/20 to-purple-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 pt-24">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar with Progress */}
            <div className="relative">
              <AvatarWithProgress size={140}>
                <Image
                  src={getUserAvatar()}
                  alt={user.displayName}
                  width={140}
                  height={140}
                  className="object-cover w-full h-full"
                />
              </AvatarWithProgress>
            </div>

            {/* User Info & Level */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
                <h1 className="text-3xl font-bold">{user.displayName}</h1>
                <LevelBadge />
              </div>
              <p className="text-white/60 mb-4">@{user.username}</p>
              
              {levelData && (
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10 max-w-md mx-auto lg:mx-0">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{levelData.levelIcon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold" style={{ color: levelData.levelColor }}>
                          {levelData.levelName}
                        </span>
                        <span className="text-sm text-white/60">Nivel {levelData.level}</span>
                      </div>
                      {levelData.progress && (
                        <>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${levelData.progress.percentage}%`, 
                                backgroundColor: levelData.levelColor 
                              }}
                            />
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-white/50">
                            <span>{levelData.currentXp} XP</span>
                            {levelData.nextLevel && (
                              <span>{levelData.nextLevel.xpNeeded} XP para {levelData.nextLevel.name}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 text-center border border-amber-500/20">
                <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-400">{levelData?.level || 1}</p>
                <p className="text-xs text-white/50">Nivel</p>
              </div>
              <div className="bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-600/10 rounded-xl p-4 text-center border border-fuchsia-500/20">
                <Zap className="w-6 h-6 text-fuchsia-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-fuchsia-400">{levelData?.currentXp || 0}</p>
                <p className="text-xs text-white/50">XP Total</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-4 text-center border border-yellow-500/20">
                <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-400">{pointsData?.points || 0}</p>
                <p className="text-xs text-white/50">Puntos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-[#0f0f14]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('missions')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'missions' 
                  ? 'text-fuchsia-400 border-fuchsia-400' 
                  : 'text-white/60 border-transparent hover:text-white/80'
              }`}
            >
              <Target className="w-5 h-5" />
              Misiones
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'badges' 
                  ? 'text-amber-400 border-amber-400' 
                  : 'text-white/60 border-transparent hover:text-white/80'
              }`}
            >
              <Medal className="w-5 h-5" />
              Insignias
            </button>
            <button
              onClick={() => setActiveTab('perks')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'perks' 
                  ? 'text-green-400 border-green-400' 
                  : 'text-white/60 border-transparent hover:text-white/80'
              }`}
            >
              <Gift className="w-5 h-5" />
              Beneficios
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'leaderboard' 
                  ? 'text-purple-400 border-purple-400' 
                  : 'text-white/60 border-transparent hover:text-white/80'
              }`}
            >
              <Crown className="w-5 h-5" />
              Ranking
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'missions' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main: Missions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 rounded-2xl p-6 border border-fuchsia-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Completa Misiones</h2>
                    <p className="text-white/60 text-sm">Gana XP y sube de nivel completando objetivos</p>
                  </div>
                </div>
                <MissionsDisplay />
              </div>
            </div>

            {/* Sidebar: Level & Streak */}
            <div className="space-y-6">
              {/* Level Progress Card */}
              <div className="bg-[#1a1a24] rounded-2xl p-6 border border-white/5">
                <LevelDisplay />
              </div>
              
              {/* Streak Card */}
              <div className="bg-[#1a1a24] rounded-2xl p-6 border border-white/5">
                <StreakDisplay />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Medal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Tus Insignias</h2>
                  <p className="text-white/60 text-sm">Colecciona insignias desbloqueando logros especiales</p>
                </div>
              </div>
              <BadgesDisplay />
            </div>
          </div>
        )}

        {activeTab === 'perks' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <LevelPerksDisplay />
            
            {/* Benefits Info */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Cómo obtener beneficios</h2>
                  <p className="text-white/60 text-sm">Sube de nivel para desbloquear más recompensas</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-green-400 mb-2">💰 Descuentos en Suscripciones</h3>
                  <p className="text-sm text-white/60">
                    A partir del nivel 5, obtienes descuentos automáticos en todas las suscripciones. 
                    Hasta un 15% en el nivel máximo.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-purple-400 mb-2">⚡ Bonus de XP</h3>
                  <p className="text-sm text-white/60">
                    Gana XP extra en todas tus actividades. Los niveles más altos 
                    otorgan hasta +25% de XP adicional.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-blue-400 mb-2">⭐ Acceso Beta</h3>
                  <p className="text-sm text-white/60">
                    Los niveles 8+ pueden probar nuevas funciones antes que nadie.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-yellow-400 mb-2">🛡️ Soporte Prioritario</h3>
                  <p className="text-sm text-white/60">
                    Alcanza el nivel 10 para obtener atención preferente del equipo de soporte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Ranking Global</h2>
                  <p className="text-white/60 text-sm">Compite con otros usuarios y alcanza el top</p>
                </div>
              </div>
              <Leaderboard />
            </div>
          </div>
        )}

        {/* How it Works Section */}
        <div className="mt-12 bg-[#1a1a24] rounded-2xl p-8 border border-white/5">
          <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <Gift className="w-7 h-7 text-fuchsia-400" />
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Completa Misiones</h3>
              <p className="text-sm text-white/50">Realiza acciones diarias y semanales para ganar XP</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                <Flame className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Mantén tu Racha</h3>
              <p className="text-sm text-white/50">Entra cada día para multiplicar tus recompensas</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-600/10 flex items-center justify-center mx-auto mb-4 border border-fuchsia-500/20">
                <TrendingUp className="w-8 h-8 text-fuchsia-400" />
              </div>
              <h3 className="font-semibold mb-2">Sube de Nivel</h3>
              <p className="text-sm text-white/50">Acumula XP para desbloquear nuevos niveles</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">Gana Insignias</h3>
              <p className="text-sm text-white/50">Colecciona insignias exclusivas por tus logros</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
