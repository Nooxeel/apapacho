'use client';

import { useState, useEffect } from 'react';
import { Crown, Percent, Zap, Star, Shield, Sparkles, Gift } from 'lucide-react';
import { gamificationApi, type LevelPerks, type FanLevel } from '@/lib/api';
import { useAuthStore } from '@/stores';

interface LevelPerksDisplayProps {
  variant?: 'compact' | 'full' | 'card';
  className?: string;
}

export function LevelPerksDisplay({ variant = 'full', className = '' }: LevelPerksDisplayProps) {
  const { token } = useAuthStore();
  const [perks, setPerks] = useState<LevelPerks | null>(null);
  const [allLevels, setAllLevels] = useState<FanLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [perksResponse, levelsResponse] = await Promise.all([
          gamificationApi.getMyPerks(token),
          gamificationApi.getAllLevels(),
        ]);
        setPerks(perksResponse);
        setAllLevels(levelsResponse.levels || []);
      } catch (error) {
        console.error('Error fetching perks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!perks) {
    return null;
  }

  // Compact: show as a small badge with discount
  if (variant === 'compact') {
    if (perks.discountPercent === 0 && perks.bonusXpPercent === 0) {
      return null;
    }
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {perks.discountPercent > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <Percent className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-400">-{perks.discountPercent}%</span>
          </div>
        )}
        {perks.bonusXpPercent > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-medium text-purple-400">+{perks.bonusXpPercent}% XP</span>
          </div>
        )}
      </div>
    );
  }

  // Card: small info card
  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-yellow-400" />
          <h4 className="font-semibold text-white">Nivel {perks.level}: {perks.name}</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Percent className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">
              {perks.discountPercent > 0 ? `-${perks.discountPercent}% suscripciones` : 'Sin descuento aún'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">
              {perks.bonusXpPercent > 0 ? `+${perks.bonusXpPercent}% XP` : 'Sin bonus XP'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full: complete perks view with roadmap
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Beneficios de Nivel</h3>
          <p className="text-gray-400 text-sm">Nivel {perks.level}: {perks.name}</p>
        </div>
      </div>

      {/* Current Perks */}
      <div className="space-y-4 mb-6">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <Gift className="w-4 h-4 text-pink-400" />
          Tus Beneficios Actuales
        </h4>
        
        <div className="grid gap-3">
          {/* Discount */}
          <div className={`flex items-center gap-4 p-4 rounded-xl ${
            perks.discountPercent > 0 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-white/5 border border-white/10'
          }`}>
            <div className={`p-2 rounded-lg ${perks.discountPercent > 0 ? 'bg-green-500/20' : 'bg-white/10'}`}>
              <Percent className={`w-5 h-5 ${perks.discountPercent > 0 ? 'text-green-400' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${perks.discountPercent > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                {perks.discountPercent > 0 ? `${perks.discountPercent}% de descuento` : 'Sin descuento'}
              </p>
              <p className="text-gray-400 text-sm">En todas las suscripciones</p>
            </div>
            {perks.discountPercent > 0 && <Sparkles className="w-5 h-5 text-green-400" />}
          </div>

          {/* XP Bonus */}
          <div className={`flex items-center gap-4 p-4 rounded-xl ${
            perks.bonusXpPercent > 0 
              ? 'bg-purple-500/10 border border-purple-500/20' 
              : 'bg-white/5 border border-white/10'
          }`}>
            <div className={`p-2 rounded-lg ${perks.bonusXpPercent > 0 ? 'bg-purple-500/20' : 'bg-white/10'}`}>
              <Zap className={`w-5 h-5 ${perks.bonusXpPercent > 0 ? 'text-purple-400' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${perks.bonusXpPercent > 0 ? 'text-purple-400' : 'text-gray-400'}`}>
                {perks.bonusXpPercent > 0 ? `+${perks.bonusXpPercent}% XP bonus` : 'Sin bonus XP'}
              </p>
              <p className="text-gray-400 text-sm">En todas las actividades</p>
            </div>
            {perks.bonusXpPercent > 0 && <Sparkles className="w-5 h-5 text-purple-400" />}
          </div>

          {/* Beta Access */}
          <div className={`flex items-center gap-4 p-4 rounded-xl ${
            perks.canAccessBeta 
              ? 'bg-blue-500/10 border border-blue-500/20' 
              : 'bg-white/5 border border-white/10'
          }`}>
            <div className={`p-2 rounded-lg ${perks.canAccessBeta ? 'bg-blue-500/20' : 'bg-white/10'}`}>
              <Star className={`w-5 h-5 ${perks.canAccessBeta ? 'text-blue-400' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${perks.canAccessBeta ? 'text-blue-400' : 'text-gray-400'}`}>
                {perks.canAccessBeta ? 'Acceso Beta' : 'Sin acceso beta'}
              </p>
              <p className="text-gray-400 text-sm">Prueba funciones antes que nadie</p>
            </div>
            {perks.canAccessBeta && <Sparkles className="w-5 h-5 text-blue-400" />}
          </div>

          {/* Priority Support */}
          <div className={`flex items-center gap-4 p-4 rounded-xl ${
            perks.prioritySupport 
              ? 'bg-yellow-500/10 border border-yellow-500/20' 
              : 'bg-white/5 border border-white/10'
          }`}>
            <div className={`p-2 rounded-lg ${perks.prioritySupport ? 'bg-yellow-500/20' : 'bg-white/10'}`}>
              <Shield className={`w-5 h-5 ${perks.prioritySupport ? 'text-yellow-400' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${perks.prioritySupport ? 'text-yellow-400' : 'text-gray-400'}`}>
                {perks.prioritySupport ? 'Soporte Prioritario' : 'Soporte estándar'}
              </p>
              <p className="text-gray-400 text-sm">Atención preferente del equipo</p>
            </div>
            {perks.prioritySupport && <Sparkles className="w-5 h-5 text-yellow-400" />}
          </div>
        </div>
      </div>

      {/* Level Roadmap */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-white font-semibold mb-4">Beneficios por Nivel</h4>
        <div className="space-y-2">
          {allLevels.map((level) => (
            <div 
              key={level.level}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                level.level === perks.level 
                  ? 'bg-pink-500/20 border border-pink-500/30' 
                  : level.level < perks.level
                    ? 'bg-white/5 opacity-60'
                    : 'bg-white/5'
              }`}
            >
              <span className="text-2xl">{level.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${level.level === perks.level ? 'text-pink-400' : 'text-white'}`}>
                    Nivel {level.level}: {level.name}
                  </span>
                  {level.level === perks.level && (
                    <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">Actual</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  {level.discountPercent !== undefined && level.discountPercent > 0 && (
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3" /> {level.discountPercent}%
                    </span>
                  )}
                  {level.bonusXpPercent !== undefined && level.bonusXpPercent > 0 && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> +{level.bonusXpPercent}% XP
                    </span>
                  )}
                  {level.canAccessBeta && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> Beta
                    </span>
                  )}
                  {level.prioritySupport && (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" /> VIP
                    </span>
                  )}
                </div>
              </div>
              <span className="text-gray-500 text-sm">{level.minXp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
