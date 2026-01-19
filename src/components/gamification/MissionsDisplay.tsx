'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { missionsApi, UserMission, MissionsResponse } from '@/lib/api';
import { Check, Clock, Gift, Target, Star, Flame } from 'lucide-react';

interface MissionCardProps {
  mission: UserMission;
  onClaim: (id: string) => Promise<void>;
  isClaiming: boolean;
}

function MissionCard({ mission, onClaim, isClaiming }: MissionCardProps) {
  const progressPercent = Math.min((mission.progress / mission.targetCount) * 100, 100);
  
  const getCategoryColor = () => {
    switch (mission.category) {
      case 'ENGAGEMENT': return 'from-blue-500 to-cyan-500';
      case 'TIPPING': return 'from-yellow-500 to-orange-500';
      case 'SOCIAL': return 'from-pink-500 to-fuchsia-500';
      case 'DISCOVERY': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div 
      className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-4 border transition-all ${
        mission.completed && !mission.claimed 
          ? 'border-green-500/50 bg-green-500/10' 
          : mission.completed 
            ? 'border-white/10 opacity-60' 
            : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`text-2xl p-2 rounded-lg bg-gradient-to-br ${getCategoryColor()} bg-opacity-20`}>
          {mission.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{mission.name}</h4>
          <p className="text-sm text-white/60 line-clamp-2">{mission.description}</p>
        </div>
        {mission.completed && mission.claimed && (
          <div className="flex-shrink-0 bg-green-500/20 text-green-400 p-1.5 rounded-full">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>Progreso</span>
          <span>{mission.progress}/{mission.targetCount}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getCategoryColor()}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Rewards & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-yellow-400">
            <Star className="w-4 h-4" />
            {mission.pointsReward}
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <Flame className="w-4 h-4" />
            {mission.xpReward} XP
          </span>
        </div>

        {mission.completed && !mission.claimed ? (
          <button
            onClick={() => onClaim(mission.id)}
            disabled={isClaiming}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
          >
            <Gift className="w-4 h-4" />
            {isClaiming ? 'Reclamando...' : 'Reclamar'}
          </button>
        ) : !mission.completed ? (
          <span className="text-xs text-white/40 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            En progreso
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface MissionsDisplayProps {
  compact?: boolean;
}

export default function MissionsDisplay({ compact = false }: MissionsDisplayProps) {
  const { token } = useAuthStore();
  const [missions, setMissions] = useState<MissionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const loadMissions = useCallback(async () => {
    if (!token) return;
    
    try {
      const data = await missionsApi.getMissions(token);
      setMissions(data);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const handleClaim = async (userMissionId: string) => {
    if (!token || claimingId) return;
    
    setClaimingId(userMissionId);
    try {
      await missionsApi.claimReward(token, userMissionId);
      // Reload to update state
      await loadMissions();
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-white/10 rounded-xl" />
        <div className="h-20 bg-white/10 rounded-xl" />
      </div>
    );
  }

  if (!missions) return null;

  const currentMissions = activeTab === 'daily' ? missions.daily : missions.weekly;
  const unclaimedCount = missions.summary.unclaimedRewards;

  if (compact) {
    // Compact view: just show summary
    const totalCompleted = missions.summary.dailyCompleted + missions.summary.weeklyCompleted;
    const totalMissions = missions.summary.dailyTotal + missions.summary.weeklyTotal;
    
    return (
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-fuchsia-400" />
            Misiones
          </h3>
          {unclaimedCount > 0 && (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full animate-pulse">
              {unclaimedCount} para reclamar
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex-1">
            <div className="flex justify-between text-white/60 mb-1">
              <span>Completadas</span>
              <span>{totalCompleted}/{totalMissions}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${totalMissions > 0 ? (totalCompleted / totalMissions) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-fuchsia-400" />
          Misiones
        </h3>
        {unclaimedCount > 0 && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full animate-pulse flex items-center gap-1">
            <Gift className="w-4 h-4" />
            {unclaimedCount} recompensa{unclaimedCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'daily'
              ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Diarias ({missions.summary.dailyCompleted}/{missions.summary.dailyTotal})
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'weekly'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Semanales ({missions.summary.weeklyCompleted}/{missions.summary.weeklyTotal})
        </button>
      </div>

      {/* Missions List */}
      <div className="space-y-3">
        {currentMissions.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay misiones {activeTab === 'daily' ? 'diarias' : 'semanales'} asignadas</p>
          </div>
        ) : (
          currentMissions.map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onClaim={handleClaim}
              isClaiming={claimingId === mission.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
