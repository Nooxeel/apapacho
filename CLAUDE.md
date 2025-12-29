# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Apapacho** is a content creator platform that combines OnlyFans-style monetization with MySpace-style profile customization. This is the **frontend** built with Next.js 15, connecting to a separate Express backend.

## Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### Backend Connection
- Backend runs separately on port 3001
- API base URL configured via `NEXT_PUBLIC_API_URL` environment variable
- Default: `http://localhost:3001/api`
- API client in `src/lib/api.ts` handles all backend communication

### State Management with Zustand

Auth store (`stores/authStore.ts`) uses `persist` middleware with localStorage. **Critical pattern:**

```tsx
const { user, token, hasHydrated } = useAuthStore();

useEffect(() => {
  // MUST wait for hydration before checking auth
  if (!hasHydrated) return;

  if (!token) {
    router.push('/login');
  }
}, [token, hasHydrated]);

// Show loading until hydrated
if (!hasHydrated) {
  return <LoadingSpinner />;
}
```

Skipping `hasHydrated` check causes infinite redirect loops on page load.

### API Client Pattern

The `lib/api.ts` exports namespaced API functions:

```typescript
// Authentication
authApi.login({ email, password })
authApi.register({ email, username, password, displayName, isCreator })
authApi.getMe(token)

// Creators
creatorApi.getByUsername(username)
creatorApi.updateProfile(data, token)
creatorApi.addMusicTrack(data, token)
creatorApi.deleteMusicTrack(trackId, token)

// File Uploads
uploadApi.avatar(file, token)
uploadApi.profile(file, token)
uploadApi.cover(file, token)
uploadApi.content(files, token)
```

All file uploads use multipart/form-data. Other endpoints use JSON.

### Type System

Central types in `types/index.ts`:
- `User` - Base user type (fans and creators)
- `Creator extends User` - Adds `profile`, `stats`, `subscriptionTiers`
- `CreatorProfile` - Full customization config (colors, music, theme)
- `YouTubeTrack` - Music player tracks (max 3 per profile)
- `Post`, `Transaction`, `Subscription` - Content and monetization types

### Page Structure

Key pages and their responsibilities:

- **`/dashboard`** - Fan dashboard with tabs (Favorites, Subscriptions, Payment History)
- **`/creator/edit`** - Full profile editor for creators (theme, music, tiers, uploads)
- **`/creator/posts`** - Content management for creators
- **`/creator/comments`** - Comment approval system (changed to "Libro de visitas")
- **`/[username]`** - Public creator profile with customization applied
- **`/login`** - Combined login/register with creator/fan toggle

### Configuration

Environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (must end with `/api`)

`next.config.js` has `remotePatterns` for:
- YouTube thumbnails (`img.youtube.com`, `i.ytimg.com`)
- Cloudinary (for production deployments)
- Placeholder services and localhost

### Recent Changes

Based on git history, recent work focused on:
1. Renaming "Comentarios" → "Libro de visitas" (guestbook)
2. Fixing CORS by standardizing `API_URL` environment variable usage
3. Using Cloudinary direct URLs instead of localhost for media

### Test Credentials

- **Creator**: test@apapacho.com / test1234 (username: gatitaveve)
- **Fan**: fan@test.com / Test1234! (username: fantest)

## Development Notes

### Backend Required
This frontend requires the `apapacho-backend` Express API running on port 3001. Without it, API calls will fail.

### Image Handling
- Profile/cover images served from backend `/uploads/` or Cloudinary
- YouTube thumbnails handled via Next.js Image with remote patterns
- Avatar fallbacks use ui-avatars.com

### Music Player
Uses YouTube IFrame API to play tracks. Each creator can have up to 3 tracks. YouTube ID extracted from URLs and stored separately.

### Styling Approach
Tailwind CSS with custom color scheme:
- `primary-*` - Fuchsia brand colors
- `accent-*` - Pink/purple accents
- `surface-*` - Dark gray backgrounds

Component library in `components/ui/` provides base UI elements (Button, Card, Input, Avatar, Badge) with consistent variants.

### Deployment

**Frontend**: Vercel
- Set `NEXT_PUBLIC_API_URL` to Railway backend URL

**Backend**: Railway (separate repo)
- PostgreSQL database
- Cloudinary for file storage
- CORS configured for Vercel frontend URL

See `DEPLOYMENT_GUIDE.md` for detailed deployment steps.
