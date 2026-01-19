'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { API_URL } from '@/lib/config';
import { missionsApi } from '@/lib/api';
import { useBadgeNotification } from '@/components/gamification';

interface FavoriteButtonProps {
  creatorId: string;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export default function FavoriteButton({ 
  creatorId, 
  accentColor = '#d946ef',
  size = 'md',
  showCount = false
}: FavoriteButtonProps) {
  const { user, token } = useAuthStore();
  const { checkForNewBadges } = useBadgeNotification();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(0);

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Verificar si el creador está en favoritos
  useEffect(() => {
    const checkFavorite = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`${API_URL}/favorites/check/${creatorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (err) {
        console.error('Error verificando favorito:', err);
      }
    };

    checkFavorite();
  }, [creatorId, token]);

  // Cargar conteo de favoritos
  useEffect(() => {
    const loadCount = async () => {
      if (!showCount) return;
      
      try {
        const response = await fetch(`${API_URL}/favorites/count/${creatorId}`);
        if (response.ok) {
          const data = await response.json();
          setCount(data.count);
        }
      } catch (err) {
        console.error('Error cargando conteo:', err);
      }
    };

    loadCount();
  }, [creatorId, showCount]);

  const handleToggle = async () => {
    if (!token || !user) {
      // Redirigir a login
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const response = await fetch(`${API_URL}/favorites/${creatorId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setIsFavorite(false);
          if (showCount) setCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Agregar a favoritos
        const response = await fetch(`${API_URL}/favorites/${creatorId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setIsFavorite(true);
          if (showCount) setCount(prev => prev + 1);
          
          // Track mission progress
          missionsApi.trackProgress(token, 'favorite').catch(() => {});
          
          // Verificar si se desbloquearon nuevos badges
          checkForNewBadges();
        }
      }
    } catch (err) {
      console.error('Error toggle favorito:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-full border transition-all duration-200 flex items-center gap-2 ${
        isFavorite 
          ? 'border-transparent scale-110' 
          : 'border-gray-600 hover:bg-white/5'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={isFavorite ? { backgroundColor: accentColor } : {}}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart 
        className={`${iconSizes[size]} transition-all ${isFavorite ? 'fill-white text-white' : ''}`}
      />
      {showCount && (
        <span className="text-sm font-medium">{count}</span>
      )}
    </button>
  );
}
