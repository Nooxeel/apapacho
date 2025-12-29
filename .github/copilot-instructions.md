# Apapacho - Content Creator Platform (Frontend)

## Project Overview
Platform for content creators similar to OnlyFans/Arsmate with MySpace-style customization.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand (con persistencia localStorage)
- **Icons**: Lucide React

## Backend
El backend está en un proyecto separado: `apapacho-backend`
- API URL: `http://localhost:3001/api`

## Key Features
- Creator profile customization (colors, backgrounds, music)
- YouTube music integration (up to 3 songs per profile)
- Subscription system
- Content sales (photos/videos)
- Donations/tips system
- Commission-based revenue model
- Fan dashboard with favorites, subscriptions, payment history

## Project Structure
```
src/
├── app/           # Next.js App Router pages
│   ├── dashboard/ # Fan dashboard (favoritos, suscripciones, pagos, comentarios)
│   ├── creator/   # Creator pages (edit profile, manage comments)
│   ├── login/     # Auth page
│   ├── creators/  # All creators listing
│   ├── explore/   # Explore page (coming soon)
│   ├── pricing/   # Pricing page
│   └── [username] # Public creator profiles
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions & API client
├── types/         # TypeScript type definitions
├── stores/        # Zustand state stores
└── styles/        # Global styles
```

## IMPORTANTE: Hidratación de Zustand

El store de auth usa `persist` middleware. SIEMPRE verificar `hasHydrated` antes de redirigir por falta de autenticación:

```tsx
const { token, hasHydrated } = useAuthStore();

useEffect(() => {
  if (!hasHydrated) return; // Esperar hidratación
  if (!token) router.push('/login');
}, [token, hasHydrated]);
```

## Development Commands
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Test Users
- **Creador**: test@apapacho.com / test1234 (username: gatitaveve)
- **Fan**: fan@test.com / Test1234! (username: fantest)

## Documentation
Ver `DEVELOPMENT.md` y `PROJECT_STATUS.md` para documentación completa.
