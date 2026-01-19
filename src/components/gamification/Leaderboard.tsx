'use client';

import { useState, useEffect } from 'react';
import { Trophy, Flame, Heart, Medal, Crown, Star } from 'lucide-react';
import { gamificationApi, type LeaderboardEntry, type MyRankResponse } from '@/lib/api';
import { useAuthStore } from '@/stores';

type TabType = 'tippers' | 'points' | 'streaks';

interface LeaderboardProps {
  creatorId?: string; // Si se pasa, muestra solo top tippers de ese creador
  showMyRank?: boolean;
  className?: string;
}

export function Leaderboard({ creatorId, showMyRank = true, className = '' }: LeaderboardProps) {
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('tippers');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRankResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data: LeaderboardEntry[] = [];
        
        switch (activeTab) {
          case 'tippers':
            if (creatorId) {
              const res = await gamificationApi.getCreatorTopTippers(creatorId, { limit: 10 });
              data = res.leaderboard;
            } else {
              const res = await gamificationApi.getTopTippers({ limit: 10 });
              data = res.leaderboard;
            }
            break;
          case 'points':
            const pointsRes = await gamificationApi.getTopPoints(10);
            data = pointsRes.leaderboard;
            break;
          case 'streaks':
            const streaksRes = await gamificationApi.getTopStreaks(10);
            data = streaksRes.leaderboard;
            break;
        }
        
        setEntries(data);

        // Obtener mi ranking si estoy autenticado
        if (showMyRank && token) {
          const rankData = await gamificationApi.getMyRank(token);
          setMyRank(rankData);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, creatorId, token, showMyRank]);

  const tabs = [
    { id: 'tippers' as TabType, label: 'Top Tippers', icon: Heart },
    { id: 'points' as TabType, label: 'Más Puntos', icon: Star },
    { id: 'streaks' as TabType, label: 'Mejor Racha', icon: Flame },
  ];

  // No mostrar tab de tippers de creador específico si no hay creatorId
  const visibleTabs = creatorId ? tabs : tabs;

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">#{position}</span>;
    }
  };

  const getRankBgClass = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  const formatValue = (entry: LeaderboardEntry) => {
    if (activeTab === 'tippers') {
      return `$${entry.totalAmount?.toLocaleString() ?? 0}`;
    } else if (activeTab === 'points') {
      return `${entry.currentPoints?.toLocaleString() ?? 0} pts`;
    } else {
      return `${entry.loginStreak ?? 0} días`;
    }
  };

  const getMyRankForTab = (): { rank: number; value: number } | null => {
    if (!myRank) return null;
    switch (activeTab) {
      case 'tippers':
        return { rank: myRank.tipping.rank, value: myRank.tipping.totalAmount };
      case 'points':
        return myRank.points ? { rank: myRank.points.rank, value: myRank.points.currentPoints } : null;
      case 'streaks':
        return myRank.streak ? { rank: myRank.streak.rank, value: myRank.streak.currentStreak } : null;
    }
  };

  const currentMyRank = getMyRankForTab();

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-white">
          {creatorId ? 'Top Fans' : 'Leaderboard'}
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mi ranking */}
      {showMyRank && currentMyRank && token && (
        <div className="mb-4 p-3 bg-pink-500/20 border border-pink-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">Tú</span>
              </div>
              <div>
                <p className="text-white font-medium">Tu posición</p>
                <p className="text-gray-300 text-sm">
                  {currentMyRank.rank ? `#${currentMyRank.rank}` : 'Sin ranking'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-pink-400 font-bold">
                {activeTab === 'tippers' && `$${currentMyRank.value?.toLocaleString() ?? 0}`}
                {activeTab === 'points' && `${currentMyRank.value?.toLocaleString() ?? 0} pts`}
                {activeTab === 'streaks' && `${currentMyRank.value ?? 0} días`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-white/5 rounded-xl">
              <div className="w-8 h-8 bg-white/10 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-24 mb-2" />
                <div className="h-3 bg-white/10 rounded w-16" />
              </div>
              <div className="h-5 bg-white/10 rounded w-16" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No hay datos todavía</p>
          <p className="text-gray-500 text-sm mt-1">¡Sé el primero en aparecer!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const position = entry.rank || index + 1;
            const isMe = user?.id === entry.userId;
            
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                  isMe ? 'ring-2 ring-pink-500' : ''
                } ${getRankBgClass(position)}`}
              >
                {/* Posición */}
                <div className="w-8 flex justify-center">
                  {getRankIcon(position)}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
                  {entry.avatar ? (
                    <img 
                      src={entry.avatar} 
                      alt={entry.displayName || entry.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {(entry.displayName || entry.username || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {entry.displayName || entry.username || 'Anónimo'}
                    {isMe && <span className="text-pink-400 ml-2">(Tú)</span>}
                  </p>
                  <p className="text-gray-400 text-sm truncate">@{entry.username}</p>
                </div>

                {/* Valor */}
                <div className="text-right">
                  <p className={`font-bold ${position <= 3 ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {formatValue(entry)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
