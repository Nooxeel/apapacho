import { api } from './client'

// ==================== GAMIFICATION TYPES ====================

export interface StreakInfo {
  currentStreak: number
  lastLoginDate: string
  milestones: {
    days: number
    bonus: number
    badge?: string
    achieved: boolean
    isCurrent: boolean
  }[]
  nextMilestone: {
    days: number
    bonus: number
    daysRemaining: number
    progress: number
  } | null
  achievedCount: number
  totalBonusEarned: number
}

export interface UserPointsInfo {
  points: number
  totalEarned: number
  totalSpent: number
  loginStreak: number
  lastLoginDate: string
  streak: {
    current: number
    nextMilestone: {
      days: number
      bonus: number
      daysRemaining: number
    } | null
  }
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  avatar: string | null
  totalAmount?: number
  donationCount?: number
  totalEarned?: number
  currentPoints?: number
  loginStreak?: number
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  updatedAt: string
  period?: string
  creator?: {
    id: string
    username: string
    displayName: string
  }
}

export interface MyRankResponse {
  tipping: {
    rank: number
    totalAmount: number
    donationCount: number
  }
  points: {
    rank: number
    totalEarned: number
    currentPoints: number
  } | null
  streak: {
    rank: number
    currentStreak: number
  } | null
}

// ==================== BADGES & LEVELS TYPES ====================

export type BadgeCategory = 'TIPPING' | 'STREAK' | 'SOCIAL' | 'LOYALTY' | 'MILESTONE' | 'SPENDING' | 'MISSIONS' | 'CREATOR' | 'SPECIAL';
export type BadgeRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  rarity: BadgeRarity
  pointsReward: number
  xpReward?: number
  unlockType?: string
  unlockValue?: number
  isHidden?: boolean
  earned?: boolean
  earnedAt?: string | null
}

export interface UserBadgesResponse {
  badges: Badge[]
  byCategory: Record<BadgeCategory, Badge[]>
  stats: {
    total: number
    earned: number
    percentage: number
  }
  newBadges: string[]
}

export interface FanLevel {
  level: number
  name: string
  minXp: number
  icon: string
  color: string
  perks: string[]
  discountPercent?: number
  bonusXpPercent?: number
  canAccessBeta?: boolean
  prioritySupport?: boolean
}

export interface LevelPerks {
  level: number
  name: string
  discountPercent: number
  bonusXpPercent: number
  perks: string[]
  canAccessBeta: boolean
  prioritySupport: boolean
}

export interface UserLevelResponse {
  currentXp: number
  level: number
  levelName: string
  levelIcon: string
  levelColor: string
  perks: string[]
  discountPercent?: number
  bonusXpPercent?: number
  nextLevel: {
    level: number
    name: string
    xpNeeded: number
  } | null
  progress: {
    current: number
    needed: number
    percentage: number
  } | null
}

export interface PublicUserBadges {
  badges: {
    code: string
    name: string
    icon: string
    rarity: BadgeRarity
    earnedAt: string
  }[]
  level: {
    level: number
    name: string
    icon: string
    color: string
  } | null
  progress: {
    current: number
    needed: number
    percentage: number
  } | null
  totalBadges: number
}

export const gamificationApi = {
  // Points & Streak
  getPoints: (token: string) =>
    api<UserPointsInfo>('/roulette/points', { token }),

  getStreakInfo: (token: string) =>
    api<StreakInfo>('/roulette/streak', { token }),

  // Leaderboards
  getTopTippers: (params?: { limit?: number; days?: number }) =>
    api<LeaderboardResponse>(`/leaderboard/tippers${params ? `?limit=${params.limit || 10}&days=${params.days || 30}` : ''}`),

  getCreatorTopTippers: (creatorId: string, params?: { limit?: number; days?: number }) =>
    api<LeaderboardResponse>(`/leaderboard/tippers/${creatorId}${params ? `?limit=${params.limit || 10}&days=${params.days || 30}` : ''}`),

  getTopPoints: (limit?: number) =>
    api<LeaderboardResponse>(`/leaderboard/points${limit ? `?limit=${limit}` : ''}`),

  getTopStreaks: (limit?: number) =>
    api<LeaderboardResponse>(`/leaderboard/streaks${limit ? `?limit=${limit}` : ''}`),

  getMyRank: (token: string, days?: number) =>
    api<MyRankResponse>(`/leaderboard/my-rank${days ? `?days=${days}` : ''}`, { token }),

  // Badges
  getAllBadges: () =>
    api<{ badges: Badge[] }>('/gamification/badges'),

  getMyBadges: (token: string) =>
    api<UserBadgesResponse>('/gamification/my-badges', { token }),

  checkBadges: (token: string) =>
    api<{ newBadges: Badge[] }>('/gamification/check-badges', { token, method: 'POST' }),

  getUserBadges: (userId: string) =>
    api<PublicUserBadges>(`/gamification/user/${userId}/badges`),

  // Levels
  getAllLevels: () =>
    api<{ levels: FanLevel[] }>('/gamification/levels'),

  getMyLevel: (token: string) =>
    api<UserLevelResponse>('/gamification/my-level', { token }),

  getMyPerks: (token: string) =>
    api<LevelPerks>('/gamification/my-perks', { token }),
}

// ==================== MISSIONS API ====================

export interface UserMission {
  id: string
  missionId: string
  code: string
  name: string
  description: string
  icon: string
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ACHIEVEMENT'
  category: 'ENGAGEMENT' | 'TIPPING' | 'SOCIAL' | 'DISCOVERY' | 'MESSAGING' | 'SPENDING' | 'CONTENT' | 'CREATOR_ENGAGEMENT' | 'GROWTH' | 'CREATOR_GROWTH' | 'MILESTONE' | 'CREATOR_MILESTONE'
  actionType: string
  targetCount: number
  progress: number
  completed: boolean
  claimed: boolean
  pointsReward: number
  xpReward: number
  expiresAt: string
  forCreators?: boolean
}

export interface MissionsResponse {
  daily: UserMission[]
  weekly: UserMission[]
  monthly: UserMission[]
  achievements: UserMission[]
  creatorDaily: UserMission[]
  creatorWeekly: UserMission[]
  creatorMonthly: UserMission[]
  creatorAchievements: UserMission[]
  summary: {
    dailyCompleted: number
    dailyTotal: number
    weeklyCompleted: number
    weeklyTotal: number
    monthlyCompleted: number
    monthlyTotal: number
    achievementsCompleted: number
    achievementsTotal: number
    creatorDailyCompleted: number
    creatorDailyTotal: number
    creatorWeeklyCompleted: number
    creatorWeeklyTotal: number
    creatorMonthlyCompleted: number
    creatorMonthlyTotal: number
    creatorAchievementsCompleted: number
    creatorAchievementsTotal: number
    unclaimedRewards: number
  }
}

export interface ClaimRewardResponse {
  success: boolean
  reward: {
    points: number
    xp: number
  }
  message: string
}

export const missionsApi = {
  // Get user's current missions
  getMissions: (token: string) =>
    api<MissionsResponse>('/missions', { token }),

  // Claim a completed mission's reward
  claimReward: (token: string, userMissionId: string) =>
    api<ClaimRewardResponse>(`/missions/${userMissionId}/claim`, { token, method: 'POST' }),

  // Track mission progress (called internally after actions)
  trackProgress: (token: string, actionType: string, count?: number) =>
    api<{ success: boolean; missionsUpdated: number; completedMissions: string[] }>(
      '/missions/track',
      { token, method: 'POST', body: { actionType, count: count || 1 } }
    ),
}

// ==================== REFERRALS API ====================

export interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  pendingReferrals: number
  totalEarned: number
  thisMonthEarned: number
}

export interface ReferralInfo {
  id: string
  referredUser: {
    username: string
    displayName: string
    avatar: string | null
    createdAt: string
  }
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  commissionRate: number
  commissionEndDate: string
  totalEarned: number
  convertedAt: string | null
  createdAt: string
}

export interface ReferralData {
  referralCode: string
  referralLink: string
  stats: ReferralStats
  referrals: ReferralInfo[]
}

export interface ReferralCommission {
  id: string
  amount: number
  sourceType: string
  referredUser: {
    username: string
    displayName: string
  }
  createdAt: string
}

export const referralsApi = {
  // Get user's referral info and stats
  getReferrals: (token: string) =>
    api<ReferralData>('/referrals', { token }),

  // Apply a referral code
  applyCode: (code: string, token: string) =>
    api<{ success: boolean; message: string; referral: { id: string; referrerUsername: string; commissionEndDate: string } }>('/referrals/apply', {
      method: 'POST',
      body: { code },
      token
    }),

  // Regenerate referral code
  regenerateCode: (token: string) =>
    api<{ success: boolean; referralCode: string; referralLink: string }>('/referrals/regenerate', {
      method: 'POST',
      token
    }),

  // Get commission history
  getCommissions: (page: number, limit: number, token: string) =>
    api<{ commissions: ReferralCommission[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/referrals/commissions?page=${page}&limit=${limit}`, { token }),

  // Validate referral code (public)
  validateCode: (code: string) =>
    api<{ valid: boolean; referrer?: { username: string; displayName: string; avatar: string | null } }>(`/referrals/validate/${code}`),
}
