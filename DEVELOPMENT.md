# Apapacho Frontend - Guía de Desarrollo

## Resumen del Proyecto
Plataforma de creadores de contenido estilo OnlyFans con personalización MySpace. Este es el **frontend** construido con Next.js 15.

## Stack Tecnológico
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Estado**: Zustand (con persistencia en localStorage)
- **Iconos**: Lucide React

## Estructura del Proyecto
```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Layout principal
│   ├── globals.css        # Estilos globales
│   ├── [username]/        # Perfil público de creador
│   │   └── page.tsx
│   ├── creator/
│   │   └── edit/
│   │       └── page.tsx   # Editor de perfil (creadores)
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard de fans
│   ├── login/
│   │   └── page.tsx       # Login/Registro
│   └── terminos/
│       └── page.tsx       # Términos y condiciones
├── components/
│   ├── landing/           # Componentes de landing
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── CreatorsShowcase.tsx
│   │   └── CTASection.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── profile/           # Componentes de perfil
│   │   ├── CreatorProfileEditor.tsx
│   │   ├── ProfileCustomizer.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── Comments.tsx
│   │   └── FavoriteButton.tsx
│   └── ui/                # Componentes UI reutilizables
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Avatar.tsx
│       └── Badge.tsx
├── stores/
│   ├── authStore.ts       # Estado de autenticación
│   └── profileStore.ts    # Estado del perfil
├── lib/
│   ├── api.ts             # Cliente API
│   └── utils.ts           # Utilidades (cn, etc)
└── types/
    └── index.ts           # Tipos TypeScript
```

## Estado de Autenticación (Zustand)

El store de auth (`stores/authStore.ts`) maneja:
- `user`: Usuario actual (User | Creator | null)
- `token`: JWT token
- `isAuthenticated`: Boolean de autenticación
- `hasHydrated`: **IMPORTANTE** - Indica si el store ya cargó de localStorage

### Uso correcto en componentes protegidos:
```tsx
const { user, token, hasHydrated } = useAuthStore();

useEffect(() => {
  // SIEMPRE esperar hidratación antes de verificar auth
  if (!hasHydrated) return;
  
  if (!token) {
    router.push('/login');
    return;
  }
  // ... cargar datos
}, [token, hasHydrated]);

// Mostrar loading mientras hidrata
if (!hasHydrated || !user) {
  return <LoadingSpinner />;
}
```

## Páginas Principales

### `/dashboard` - Dashboard de Fans
- **Tabs**: Favoritos, Suscripciones, Historial de Pagos
- **Funcionalidades**:
  - Ver creadores favoritos
  - Ver suscripciones activas
  - Ver historial de pagos (donaciones + suscripciones)
  - Subir avatar
  - Cerrar sesión

### `/creator/edit` - Editor de Perfil (Creadores)
- Personalización de colores (fondo, acento, texto)
- Subir imagen de perfil y cover
- Agregar música de YouTube (máx 3 tracks)
- Editar bio y links sociales
- Gestionar tiers de suscripción

### `/[username]` - Perfil Público
- Muestra perfil personalizado del creador
- Reproductor de música
- Botón de favoritos
- Sistema de comentarios
- Tiers de suscripción

### `/login` - Autenticación
- Login y registro en la misma página
- Toggle para crear cuenta como creador o fan
- Acepta términos y condiciones (registro)
- Redirige a `/dashboard` (fans) o `/creator/edit` (creadores)

## API Client (`lib/api.ts`)

```typescript
// Autenticación
authApi.login({ email, password })
authApi.register({ email, username, password, displayName, isCreator })
authApi.getMe(token)

// Creadores
creatorApi.getByUsername(username)
creatorApi.getById(id)
creatorApi.getAll({ limit, offset })
creatorApi.updateProfile(data, token)
creatorApi.addMusicTrack(data, token)
creatorApi.removeMusicTrack(trackId, token)

// Favoritos
favoritesApi.getMyFavorites(token)
favoritesApi.add(creatorId, token)
favoritesApi.remove(creatorId, token)
favoritesApi.check(creatorId, token)
```

## Conexión con Backend
- **URL Base**: `http://localhost:3001/api`
- Definida en `lib/api.ts` y componentes
- El backend debe estar corriendo en puerto 3001

## Comandos de Desarrollo
```bash
npm run dev      # Servidor de desarrollo (puerto 3000)
npm run build    # Build de producción
npm run lint     # Ejecutar ESLint
```

## Usuarios de Prueba
| Email | Password | Tipo | Username |
|-------|----------|------|----------|
| test@apapacho.com | test1234 | Creador | gatitaveve |
| fan@test.com | Test1234! | Fan | fantest |

## Notas Importantes

1. **Hidratación de Zustand**: Siempre verificar `hasHydrated` antes de redirigir por falta de auth.

2. **Imágenes**: Las imágenes de perfil se sirven desde `/images/{userId}/` en el frontend (carpeta public) o desde el backend en `/uploads/`.

3. **Tipos**: Los tipos están en `types/index.ts`. User y Creator comparten estructura base.

4. **Estilos**: Usa Tailwind con colores personalizados:
   - `primary-*`: Fucsia (color principal)
   - `accent-*`: Rosa/púrpura
   - `surface-*`: Grises oscuros para fondos

5. **Componentes UI**: Todos los componentes base están en `components/ui/` con variantes predefinidas.
