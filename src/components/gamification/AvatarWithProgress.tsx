'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import { gamificationApi } from '@/lib/api';
import { useAuthStore } from '@/stores';

interface AvatarWithProgressProps {
  /** User ID to fetch progress for (if not provided, uses current user) */
  userId?: string;
  /** Size of the avatar in pixels */
  size: number;
  /** Border/stroke width for the progress ring */
  strokeWidth?: number;
  /** The children (avatar image) to render inside */
  children: React.ReactNode;
  /** Border color from profile (used as fallback) */
  accentColor?: string;
  /** Additional className for the container */
  className?: string;
  /** Show the level badge overlay */
  showLevelBadge?: boolean;
}

interface ProgressData {
  percentage: number;
  color: string;
  level: number;
  icon: string;
}

// Memoized SVG ring component for performance
const ProgressRing = memo(function ProgressRing({
  size,
  strokeWidth,
  percentage,
  color,
  bgColor
}: {
  size: number;
  strokeWidth: number;
  percentage: number;
  color: string;
  bgColor: string;
}) {
  // Calculate dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      className="absolute inset-0 -rotate-90 pointer-events-none"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        opacity={0.3}
      />
      {/* Progress circle with glow effect */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.5s ease-out',
          filter: `drop-shadow(0 0 4px ${color}80)`,
        }}
      />
    </svg>
  );
});

// Cache for progress data to avoid repeated API calls
const progressCache = new Map<string, { data: ProgressData; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache

function AvatarWithProgressComponent({
  userId,
  size,
  strokeWidth = 4,
  children,
  accentColor = '#d946ef',
  className = '',
  showLevelBadge = true,
}: AvatarWithProgressProps) {
  const { token, user } = useAuthStore();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine the effective user ID
  const effectiveUserId = userId || user?.id;
  const cacheKey = effectiveUserId || 'self';

  useEffect(() => {
    const fetchProgress = async () => {
      // Check cache first
      const cached = progressCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setProgressData(cached.data);
        setIsLoading(false);
        return;
      }

      try {
        if (userId) {
          // Fetch public user data with progress
          const response = await gamificationApi.getUserBadges(userId);
          if (response.level) {
            const data: ProgressData = {
              percentage: response.progress?.percentage || 0,
              color: response.level.color,
              level: response.level.level,
              icon: response.level.icon,
            };
            progressCache.set(cacheKey, { data, timestamp: Date.now() });
            setProgressData(data);
          }
        } else if (token) {
          // Fetch own level with progress
          const response = await gamificationApi.getMyLevel(token);
          const data: ProgressData = {
            percentage: response.progress?.percentage || 0,
            color: response.levelColor,
            level: response.level,
            icon: response.levelIcon,
          };
          progressCache.set(cacheKey, { data, timestamp: Date.now() });
          setProgressData(data);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [userId, token, cacheKey]);

  // Use accent color as fallback while loading
  const ringColor = progressData?.color || accentColor;
  const percentage = progressData?.percentage || 0;

  // Memoize the container style
  const containerStyle = useMemo(() => ({
    width: size,
    height: size,
  }), [size]);

  return (
    <div 
      className={`relative ${className}`}
      style={containerStyle}
    >
      {/* Progress Ring */}
      <ProgressRing
        size={size}
        strokeWidth={strokeWidth}
        percentage={isLoading ? 0 : percentage}
        color={ringColor}
        bgColor={ringColor}
      />
      
      {/* Avatar container - inset by stroke width */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          top: strokeWidth,
          left: strokeWidth,
          right: strokeWidth,
          bottom: strokeWidth,
        }}
      >
        {children}
      </div>

      {/* Level Badge */}
      {showLevelBadge && progressData && (
        <div 
          className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full text-xs font-bold shadow-lg"
          style={{
            width: Math.max(20, size * 0.22),
            height: Math.max(20, size * 0.22),
            backgroundColor: progressData.color,
            color: '#fff',
            fontSize: Math.max(10, size * 0.12),
          }}
          title={`Nivel ${progressData.level}`}
        >
          {progressData.level}
        </div>
      )}
    </div>
  );
}

// Export memoized version for optimal performance
export const AvatarWithProgress = memo(AvatarWithProgressComponent);

// Compact version for navbar (smaller, with level badge)
export const AvatarWithProgressCompact = memo(function AvatarWithProgressCompact({
  size = 32,
  strokeWidth = 3,
  children,
  className = '',
  showLevelBadge = true,
}: {
  size?: number;
  strokeWidth?: number;
  children: React.ReactNode;
  className?: string;
  showLevelBadge?: boolean;
}) {
  const { token } = useAuthStore();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!token) return;
      
      // Check cache
      const cached = progressCache.get('self');
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setProgressData(cached.data);
        return;
      }

      try {
        const response = await gamificationApi.getMyLevel(token);
        const data: ProgressData = {
          percentage: response.progress?.percentage || 0,
          color: response.levelColor,
          level: response.level,
          icon: response.levelIcon,
        };
        progressCache.set('self', { data, timestamp: Date.now() });
        setProgressData(data);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
  }, [token]);

  const ringColor = progressData?.color || '#d946ef';
  const percentage = progressData?.percentage || 0;

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <ProgressRing
        size={size}
        strokeWidth={strokeWidth}
        percentage={percentage}
        color={ringColor}
        bgColor={ringColor}
      />
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          top: strokeWidth,
          left: strokeWidth,
          right: strokeWidth,
          bottom: strokeWidth,
        }}
      >
        {children}
      </div>
      
      {/* Level Badge */}
      {showLevelBadge && progressData && (
        <div 
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full font-bold shadow-lg border border-black/20"
          style={{
            width: Math.max(14, size * 0.4),
            height: Math.max(14, size * 0.4),
            backgroundColor: progressData.color,
            color: '#fff',
            fontSize: Math.max(8, size * 0.25),
          }}
          title={`Nivel ${progressData.level}`}
        >
          {progressData.level}
        </div>
      )}
    </div>
  );
});
