// User and Creator Types
export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  fontFamily?: string
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
  visibilitySettings?: {
    tabs?: {
      posts?: boolean
      exclusive?: boolean
      about?: boolean
      collections?: boolean
      tipping?: boolean
    }
    messaging?: 'everyone' | 'subscribers' | 'logged_in' | 'disabled'
  }
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
  creatorId: string
  platform: string // 'instagram', 'twitter', 'onlyfans', 'custom', etc.
  url: string
  label?: string
  icon?: string
  order: number
  isVisible: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SocialPlatform {
  value: string
  label: string
  icon: string
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
export type PostVisibility = 'public' | 'authenticated' | 'subscribers'

export interface Post {
  id: string
  creatorId: string
  title?: string
  description?: string
  content: PostContent[]
  visibility: PostVisibility
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

// Messaging Types
export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'TEXT' | 'PAID_CONTENT'
  mediaUrl?: string
  price?: number
  readAt?: Date | string | null
  deletedAt?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  sender: User
}

export interface Conversation {
  id: string
  participant1Id: string
  participant2Id: string
  lastMessageAt: Date | string
  participant1Unread: number
  participant2Unread: number
  status: 'active' | 'archived' | 'blocked'
  createdAt: Date | string
  updatedAt: Date | string
}

// Post Interaction Types
export interface PostLike {
  id: string
  postId: string
  userId: string
  createdAt: Date | string
}

export interface PostComment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  deletedAt?: Date | string | null
  user: {
    id: string
    username: string
    displayName: string
    avatar: string | null
  }
}

// Interest/Tags Types
export type InterestCategory =
  | 'CONTENT_TYPE'
  | 'AESTHETIC'
  | 'THEMES'
  | 'NICHE'

export interface Interest {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  category: InterestCategory
  isNSFW: boolean
  usageCount: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface UserInterest {
  id: string
  userId: string
  interestId: string
  interest: Interest
  createdAt: Date | string
}

export interface CreatorInterest {
  id: string
  creatorId: string
  interestId: string
  interest: Interest
  createdAt: Date | string
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
