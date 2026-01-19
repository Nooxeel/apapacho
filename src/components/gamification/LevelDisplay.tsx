'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronRight, Gift } from 'lucide-react';
import { gamificationApi, type UserLevelResponse } from '@/lib/api';
import { useAuthStore } from '@/stores';

interface LevelDisplayProps {
  variant?: 'compact' | 'full' | 'badge';
  className?: string;
}

export function LevelDisplay({ variant = 'full', className = '' }: LevelDisplayProps) {
  const { token } = useAuthStore();
  const [data, setData] = useState<UserLevelResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevel = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await gamificationApi.getMyLevel(token);
        setData(response);
      } catch (error) {
        console.error('Error fetching level:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [token]);

  if (loading) {
    if (variant === 'badge') {
      return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
    }
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="h-4 bg-white/10 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Badge: just the level icon
  if (variant === 'badge') {
    return (
      <div 
        className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${className}`}
        style={{ backgroundColor: `${data.levelColor}20`, borderColor: data.levelColor }}
        title={`Nivel ${data.level}: ${data.levelName}`}
      >
        {data.levelIcon}
      </div>
    );
  }

  // Compact: inline level display
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2"
          style={{ backgroundColor: `${data.levelColor}20`, borderColor: data.levelColor }}
        >
          {data.levelIcon}
        </div>
        <div>
          <p className="text-white font-medium">
            Nivel {data.level}: {data.levelName}
          </p>
          {data.progress && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${data.progress.percentage}%`, backgroundColor: data.levelColor }}
                />
              </div>
              <span className="text-gray-400 text-xs">{data.progress.percentage}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full: complete level card
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Tu Nivel</h3>
        </div>
      </div>

      {/* Level info */}
      <div className="flex items-center gap-4 mb-6">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2"
          style={{ backgroundColor: `${data.levelColor}20`, borderColor: data.levelColor }}
        >
          {data.levelIcon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{data.levelName}</p>
          <p className="text-gray-400">Nivel {data.level}</p>
        </div>
      </div>

      {/* XP Progress */}
      {data.progress && data.nextLevel && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              {data.currentXp.toLocaleString()} XP
            </span>
            <span style={{ color: data.levelColor }}>
              {data.progress.needed.toLocaleString()} XP para {data.nextLevel.name}
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${data.progress.percentage}%`, backgroundColor: data.levelColor }}
            />
          </div>
          <p className="text-center text-gray-400 text-sm mt-2">
            Faltan {data.nextLevel.xpNeeded.toLocaleString()} XP
          </p>
        </div>
      )}

      {/* Perks */}
      {data.perks.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Beneficios de tu nivel:
          </p>
          <div className="space-y-2">
            {data.perks.map((perk, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                <ChevronRight className="w-4 h-4" style={{ color: data.levelColor }} />
                <span className="text-white">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next level preview */}
      {data.nextLevel && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Próximo nivel:</p>
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">
              Nivel {data.nextLevel.level}: {data.nextLevel.name}
            </span>
            <span className="text-gray-400 text-sm">
              +{data.nextLevel.xpNeeded.toLocaleString()} XP
            </span>
          </div>
        </div>
      )}

      {/* Max level reached */}
      {!data.nextLevel && (
        <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl text-center">
          <p className="text-yellow-400 font-medium">🎉 ¡Nivel máximo alcanzado!</p>
          <p className="text-gray-300 text-sm mt-1">Eres un verdadero mito</p>
        </div>
      )}
    </div>
  );
}

// Level badge for profile display
export function LevelBadge({ userId, className = '' }: { userId?: string; className?: string }) {
  const { token, user } = useAuthStore();
  const [levelData, setLevelData] = useState<{ level: number; icon: string; color: string; name: string } | null>(null);

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        if (userId) {
          // Fetch from public endpoint
          const response = await gamificationApi.getUserBadges(userId);
          if (response.level) {
            setLevelData(response.level);
          }
        } else if (token) {
          // Fetch own level
          const response = await gamificationApi.getMyLevel(token);
          setLevelData({
            level: response.level,
            icon: response.levelIcon,
            color: response.levelColor,
            name: response.levelName,
          });
        }
      } catch (error) {
        console.error('Error fetching level badge:', error);
      }
    };

    fetchLevel();
  }, [userId, token]);

  if (!levelData) return null;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium ${className}`}
      style={{ backgroundColor: `${levelData.color}20`, color: levelData.color }}
      title={`Nivel ${levelData.level}: ${levelData.name}`}
    >
      <span>{levelData.icon}</span>
      <span>Nv.{levelData.level}</span>
    </div>
  );
}
