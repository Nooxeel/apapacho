'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, Sparkles } from 'lucide-react';
import { gamificationApi, type Badge } from '@/lib/api';
import { useAuthStore } from '@/stores';

interface BadgeNotification {
  id: string;
  badge: Badge;
  isVisible: boolean;
}

interface BadgeNotificationContextType {
  showBadge: (badge: Badge) => void;
  checkForNewBadges: () => Promise<Badge[]>;
}

const BadgeNotificationContext = createContext<BadgeNotificationContextType | null>(null);

export function useBadgeNotification() {
  const context = useContext(BadgeNotificationContext);
  if (!context) {
    throw new Error('useBadgeNotification must be used within BadgeNotificationProvider');
  }
  return context;
}

const RARITY_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  COMMON: { bg: 'from-gray-600 to-gray-700', border: 'border-gray-400', glow: 'shadow-gray-500/50' },
  UNCOMMON: { bg: 'from-green-600 to-green-700', border: 'border-green-400', glow: 'shadow-green-500/50' },
  RARE: { bg: 'from-blue-600 to-blue-700', border: 'border-blue-400', glow: 'shadow-blue-500/50' },
  EPIC: { bg: 'from-purple-600 to-purple-700', border: 'border-purple-400', glow: 'shadow-purple-500/50' },
  LEGENDARY: { bg: 'from-yellow-500 to-orange-500', border: 'border-yellow-400', glow: 'shadow-yellow-500/50' },
};

const RARITY_NAMES: Record<string, string> = {
  COMMON: 'Común',
  UNCOMMON: 'Poco Común',
  RARE: 'Raro',
  EPIC: 'Épico',
  LEGENDARY: 'Legendario',
};

export function BadgeNotificationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<BadgeNotification[]>([]);

  const showBadge = useCallback((badge: Badge) => {
    const id = `${badge.code}-${Date.now()}`;
    setNotifications((prev) => [...prev, { id, badge, isVisible: true }]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isVisible: false } : n))
      );
      // Remove from DOM after animation
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 500);
    }, 5000);
  }, []);

  const dismissBadge = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isVisible: false } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 500);
  }, []);

  const checkForNewBadges = useCallback(async (): Promise<Badge[]> => {
    if (!token) return [];
    
    try {
      const response = await gamificationApi.checkBadges(token);
      const newBadges = response.newBadges || [];
      
      // Show notification for each new badge
      for (const badge of newBadges) {
        showBadge(badge);
      }
      
      return newBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }, [token, showBadge]);

  return (
    <BadgeNotificationContext.Provider value={{ showBadge, checkForNewBadges }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map((notification) => (
          <BadgeNotificationPopup
            key={notification.id}
            badge={notification.badge}
            isVisible={notification.isVisible}
            onDismiss={() => dismissBadge(notification.id)}
          />
        ))}
      </div>
    </BadgeNotificationContext.Provider>
  );
}

interface BadgeNotificationPopupProps {
  badge: Badge;
  isVisible: boolean;
  onDismiss: () => void;
}

function BadgeNotificationPopup({ badge, isVisible, onDismiss }: BadgeNotificationPopupProps) {
  const colors = RARITY_COLORS[badge.rarity] || RARITY_COLORS.COMMON;

  return (
    <div
      className={`pointer-events-auto transform transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`bg-gradient-to-r ${colors.bg} border-2 ${colors.border} rounded-2xl p-4 shadow-2xl ${colors.glow} min-w-[300px] max-w-[400px]`}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span className="text-sm font-medium text-yellow-300">¡Nuevo Badge Desbloqueado!</span>
        </div>

        {/* Badge content */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-4xl animate-bounce">
            {badge.icon}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{badge.name}</h3>
            <p className="text-white/70 text-sm">{badge.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                {RARITY_NAMES[badge.rarity]}
              </span>
              {badge.pointsReward > 0 && (
                <span className="text-xs text-yellow-300 font-medium">
                  +{badge.pointsReward} pts
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
