// User and Creator Types
export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  isCreator: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Creator extends User {
  isCreator: true
  profile: CreatorProfile
  stats: CreatorStats
  subscriptionTiers: SubscriptionTier[]
}

export interface CreatorProfile {
  id: string
  creatorId: string
  coverImage?: string
  backgroundColor: string
  backgroundGradient?: string
  backgroundImage?: string
  accentColor: string
  textColor: string
  fontFamily: string
  musicTracks: YouTubeTrack[]
  socialLinks: SocialLink[]
  customCSS?: string
  theme: ProfileTheme
}

export interface ProfileTheme {
  preset: 'dark' | 'light' | 'neon' | 'vintage' | 'custom'
  primaryColor: string
  secondaryColor: string
  glowEnabled: boolean
  particlesEnabled: boolean
}

export interface YouTubeTrack {
  id: string
  youtubeUrl: string
  youtubeId: string
  title: string
  artist?: string
  thumbnail: string
  order: number
}

export interface SocialLink {
  id: string
  platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'twitch' | 'discord' | 'other'
  url: string
  label?: string
}

export interface CreatorStats {
  totalSubscribers: number
  totalPosts: number
  totalLikes: number
  totalViews: number
  monthlyEarnings: number
}

// Subscription Types
export interface SubscriptionTier {
  id: string
  creatorId: string
  name: string
  description: string
  price: number
  currency: string
  benefits: string[]
  isActive: boolean
  order: number
}

export interface Subscription {
  id: string
  userId: string
  creatorId: string
  tierId: string
  status: 'active' | 'cancelled' | 'expired' | 'paused'
  startDate: Date
  endDate?: Date
  autoRenew: boolean
}

// Content Types
export interface Post {
  id: string
  creatorId: string
  title?: string
  description?: string
  content: PostContent[]
  visibility: 'public' | 'subscribers' | 'tier'
  requiredTierId?: string
  price?: number
  likes: number
  comments: number
  views: number
  createdAt: Date
  updatedAt: Date
}

export interface PostContent {
  id: string
  type: 'image' | 'video' | 'text' | 'audio'
  url?: string
  text?: string
  thumbnail?: string
  duration?: number
  isBlurred: boolean
  order: number
}

// Transaction Types
export interface Transaction {
  id: string
  type: 'subscription' | 'content_purchase' | 'donation' | 'tip'
  fromUserId: string
  toCreatorId: string
  amount: number
  platformFee: number
  creatorEarnings: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface Donation {
  id: string
  fromUserId: string
  toCreatorId: string
  amount: number
  message?: string
  isAnonymous: boolean
  createdAt: Date
}

// Platform Configuration
export interface PlatformConfig {
  commissionRate: number // e.g., 0.15 for 15%
  minSubscriptionPrice: number
  maxSubscriptionPrice: number
  minDonation: number
  maxDonation: number
  supportedCurrencies: string[]
  maxMusicTracks: number
  maxPostImages: number
  maxVideoLength: number // in seconds
}
