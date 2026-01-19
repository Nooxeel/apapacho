'use client';

import { useState, useEffect } from 'react';
import { Award, Lock, Sparkles, X } from 'lucide-react';
import { gamificationApi, type Badge, type BadgeCategory, type BadgeRarity, type UserBadgesResponse } from '@/lib/api';
import { useAuthStore } from '@/stores';

interface BadgesDisplayProps {
  variant?: 'compact' | 'full' | 'showcase';
  maxDisplay?: number;
  className?: string;
}

const RARITY_COLORS: Record<BadgeRarity, { bg: string; border: string; text: string }> = {
  COMMON: { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-300' },
  UNCOMMON: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
  RARE: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  EPIC: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  LEGENDARY: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
};

const RARITY_NAMES: Record<BadgeRarity, string> = {
  COMMON: 'Común',
  UNCOMMON: 'Poco Común',
  RARE: 'Raro',
  EPIC: 'Épico',
  LEGENDARY: 'Legendario',
};

const CATEGORY_NAMES: Record<BadgeCategory, string> = {
  TIPPING: 'Propinas',
  STREAK: 'Rachas',
  SOCIAL: 'Social',
  LOYALTY: 'Lealtad',
  MILESTONE: 'Hitos',
  SPECIAL: 'Especiales',
};

export function BadgesDisplay({ variant = 'full', maxDisplay = 6, className = '' }: BadgesDisplayProps) {
  const { token } = useAuthStore();
  const [data, setData] = useState<UserBadgesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeCategory, setActiveCategory] = useState<BadgeCategory | 'all'>('all');

  useEffect(() => {
    const fetchBadges = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await gamificationApi.getMyBadges(token);
        setData(response);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [token]);

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/10 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const earnedBadges = data.badges.filter((b) => b.earned);
  const filteredBadges = activeCategory === 'all' 
    ? data.badges 
    : data.badges.filter((b) => b.category === activeCategory);

  // Compact: just show earned badges in a row
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {earnedBadges.slice(0, maxDisplay).map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${RARITY_COLORS[badge.rarity].bg} border ${RARITY_COLORS[badge.rarity].border} transition-transform hover:scale-110`}
            title={badge.name}
          >
            {badge.icon}
          </button>
        ))}
        {earnedBadges.length > maxDisplay && (
          <span className="text-gray-400 text-sm">+{earnedBadges.length - maxDisplay}</span>
        )}

        {/* Badge Modal */}
        {selectedBadge && (
          <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
        )}
      </div>
    );
  }

  // Showcase: minimal badges for profile display
  if (variant === 'showcase') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Award className="w-5 h-5 text-yellow-400" />
        <div className="flex items-center gap-1">
          {earnedBadges.slice(0, 5).map((badge) => (
            <span
              key={badge.id}
              className={`text-xl cursor-default ${RARITY_COLORS[badge.rarity].text}`}
              title={badge.name}
            >
              {badge.icon}
            </span>
          ))}
        </div>
        <span className="text-gray-400 text-sm">
          {data.stats.earned}/{data.stats.total}
        </span>
      </div>
    );
  }

  // Full: complete badge collection view
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Mis Badges</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-400">{data.stats.earned}</p>
          <p className="text-gray-400 text-sm">de {data.stats.total}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progreso de colección</span>
          <span className="text-yellow-400">{data.stats.percentage}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
            style={{ width: `${data.stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Todos
        </button>
        {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as BadgeCategory)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              activeCategory === key
                ? 'bg-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {filteredBadges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`aspect-square rounded-xl border p-3 flex flex-col items-center justify-center gap-1 transition-all ${
              badge.earned
                ? `${RARITY_COLORS[badge.rarity].bg} ${RARITY_COLORS[badge.rarity].border} hover:scale-105`
                : 'bg-white/5 border-white/10 opacity-50 grayscale'
            }`}
          >
            <span className="text-2xl">{badge.icon}</span>
            {!badge.earned && <Lock className="w-3 h-3 text-gray-500" />}
          </button>
        ))}
      </div>

      {/* New badges notification */}
      {data.newBadges.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-white font-medium">¡Nuevos badges desbloqueados!</p>
              <p className="text-gray-300 text-sm">
                Has ganado {data.newBadges.length} badge{data.newBadges.length > 1 ? 's' : ''} nuevo{data.newBadges.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Badge Modal */}
      {selectedBadge && (
        <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      )}
    </div>
  );
}

// Badge detail modal
function BadgeModal({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const colors = RARITY_COLORS[badge.rarity];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={`${colors.bg} border ${colors.border} rounded-2xl p-6 max-w-sm w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge icon */}
        <div className="text-center mb-4">
          <span className="text-6xl">{badge.icon}</span>
        </div>

        {/* Badge info */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">{badge.name}</h3>
          <p className={`text-sm font-medium ${colors.text}`}>
            {RARITY_NAMES[badge.rarity]}
          </p>
          <p className="text-gray-300 text-sm">{badge.description}</p>
          
          {badge.pointsReward > 0 && (
            <p className="text-yellow-400 text-sm font-medium">
              +{badge.pointsReward} puntos al desbloquear
            </p>
          )}

          {badge.earned ? (
            <div className="pt-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm">
                ✓ Desbloqueado
                {badge.earnedAt && (
                  <span className="text-gray-400">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div className="pt-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-400 rounded-full text-sm">
                <Lock className="w-4 h-4" />
                Bloqueado
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
