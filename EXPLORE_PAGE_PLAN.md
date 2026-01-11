# Plan: Página de Explorar - Búsqueda de Creadores por Intereses

## 📋 Resumen
Convertir la página `/explore` en una página funcional donde los usuarios puedan buscar y descubrir creadores basándose en sus intereses, categorías y otros filtros.

---

## 🎯 Objetivos

1. **Búsqueda por Intereses**: Permitir filtrar creadores por uno o múltiples intereses
2. **Búsqueda por Texto**: Buscar creadores por nombre de usuario o nombre para mostrar
3. **Filtros Adicionales**: 
   - Verificados vs No verificados
   - Por categoría de intereses (CONTENT_TYPE, AESTHETIC, THEMES, NICHE)
4. **Recomendaciones Personalizadas**: Si el usuario está autenticado, mostrar creadores basados en sus intereses
5. **Vista de Resultados**: Tarjetas de creadores con información relevante e intereses compartidos

---

## 🏗️ Arquitectura

### Backend (Ya Existe ✅)
Los endpoints necesarios ya están implementados:

1. **`GET /api/interests`** - Obtener todos los intereses disponibles
   - Parámetros opcionales: `category`, `search`
   
2. **`GET /api/interests/by-category`** - Intereses agrupados por categoría

3. **`GET /api/discover/creators`** - Descubrir creadores
   - Parámetros: `interestIds` (comma-separated), `limit`, `offset`
   - Sin filtros devuelve creadores populares
   - Con filtros calcula relevanceScore

4. **`GET /api/discover/recommended`** - Recomendaciones personalizadas (requiere auth)
   - Basado en intereses del usuario
   - Excluye creadores ya seguidos

5. **`GET /api/discover/search`** - Búsqueda combinada
   - Parámetros: `query`, `interestIds`, `limit`, `offset`

### Frontend (A Implementar 🚧)

#### Componentes Nuevos

1. **`ExploreFilters.tsx`**
   - Selector de intereses por categoría
   - Búsqueda por texto
   - Toggle para solo verificados
   - Botón "Limpiar filtros"

2. **`CreatorCard.tsx`** (o usar existente y mejorar)
   - Avatar/Banner del creador
   - Nombre y username
   - Badges de intereses (con highlight para intereses compartidos)
   - Número de suscriptores
   - Badge de verificado
   - Botón "Ver Perfil" o "Seguir"
   - Relevance score (opcional, si aplica)

3. **`CreatorsGrid.tsx`**
   - Grid responsivo de CreatorCards
   - Infinite scroll o paginación
   - Estado de carga
   - Estado vacío ("No se encontraron creadores")

4. **`RecommendedSection.tsx`** (opcional)
   - Sección especial para usuarios autenticados
   - Muestra "Recomendado para ti" basado en sus intereses

---

## 📁 Estructura de Archivos

```
src/
├── app/
│   └── explore/
│       └── page.tsx                    # ← ACTUALIZAR
├── components/
│   ├── explore/
│   │   ├── ExploreFilters.tsx         # ← CREAR
│   │   ├── CreatorsGrid.tsx           # ← CREAR
│   │   ├── CreatorCard.tsx            # ← CREAR
│   │   ├── RecommendedSection.tsx     # ← CREAR (opcional)
│   │   └── index.ts                   # ← CREAR
│   └── interests/
│       ├── InterestSelector.tsx       # ✅ YA EXISTE
│       └── InterestBadges.tsx         # ✅ YA EXISTE
└── lib/
    └── api.ts                          # ✅ YA TIENE discoverApi
```

---

## 🔨 Implementación Paso a Paso

### Fase 1: Componentes Base (2-3 horas)

#### 1.1 CreatorCard Component
```tsx
// src/components/explore/CreatorCard.tsx
interface CreatorCardProps {
  creator: {
    id: string
    user: {
      username: string
      displayName: string
      avatar?: string
    }
    bannerImage?: string
    bio?: string
    isVerified: boolean
    interests: Array<{
      interest: {
        id: string
        name: string
        icon?: string
      }
    }>
    _count?: {
      subscribers: number
    }
    relevanceScore?: number
    sharedInterestsCount?: number
  }
  userInterests?: string[] // IDs de intereses del usuario autenticado
}
```

**Features:**
- Avatar circular con fallback
- Badge de verificado (si aplica)
- Lista de intereses (máximo 5, con "+" indicador)
- Highlight de intereses compartidos con el usuario
- Botón "Ver Perfil" → `/[username]`
- Hover effects y animaciones suaves

#### 1.2 ExploreFilters Component
```tsx
// src/components/explore/ExploreFilters.tsx
interface ExploreFiltersProps {
  onFilterChange: (filters: {
    interestIds: string[]
    query?: string
    verifiedOnly?: boolean
    category?: InterestCategory
  }) => void
  isLoading?: boolean
}
```

**Features:**
- Input de búsqueda con debounce (500ms)
- Selector de intereses (multi-select)
- Checkbox "Solo verificados"
- Selector de categoría (dropdown o tabs)
- Contador de filtros activos
- Botón "Limpiar filtros"

#### 1.3 CreatorsGrid Component
```tsx
// src/components/explore/CreatorsGrid.tsx
interface CreatorsGridProps {
  creators: Creator[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  userInterests?: string[]
}
```

**Features:**
- Grid responsivo (1 col mobile, 2 cols tablet, 3-4 cols desktop)
- Loading skeleton mientras carga
- "Load More" button o infinite scroll
- Empty state si no hay resultados
- Error state si falla la carga

### Fase 2: Lógica de la Página (2-3 horas)

#### 2.1 Estado y Hooks
```tsx
// src/app/explore/page.tsx
const [filters, setFilters] = useState({
  interestIds: [] as string[],
  query: '',
  verifiedOnly: false,
  category: undefined
})

const [creators, setCreators] = useState<any[]>([])
const [isLoading, setIsLoading] = useState(false)
const [hasMore, setHasMore] = useState(true)
const [offset, setOffset] = useState(0)
const [userInterests, setUserInterests] = useState<string[]>([])
```

#### 2.2 Fetching Data
```tsx
// Cargar intereses del usuario (si está autenticado)
useEffect(() => {
  if (token) {
    interestsApi.getMyInterests(token)
      .then(data => setUserInterests(data.map(i => i.id)))
  }
}, [token])

// Buscar creadores cuando cambien los filtros
useEffect(() => {
  loadCreators(true) // reset = true para nueva búsqueda
}, [filters])

const loadCreators = async (reset = false) => {
  setIsLoading(true)
  
  const params = {
    interestIds: filters.interestIds.join(','),
    query: filters.query || undefined,
    limit: 12,
    offset: reset ? 0 : offset
  }

  try {
    const data = await discoverApi.discoverCreators(params)
    
    if (reset) {
      setCreators(data)
      setOffset(12)
    } else {
      setCreators(prev => [...prev, ...data])
      setOffset(prev => prev + 12)
    }
    
    setHasMore(data.length === 12)
  } catch (error) {
    console.error('Error loading creators:', error)
  } finally {
    setIsLoading(false)
  }
}
```

### Fase 3: UX Enhancements (1-2 horas)

#### 3.1 Sección de Recomendaciones
Para usuarios autenticados, mostrar una sección especial arriba:
```tsx
{token && (
  <RecommendedSection
    token={token}
    userInterests={userInterests}
  />
)}
```

#### 3.2 Filtros Rápidos
Chips clicables para categorías populares:
```tsx
<div className="flex gap-2 mb-6">
  <button onClick={() => addInterest('fotografia')}>
    📸 Fotografía
  </button>
  <button onClick={() => addInterest('fitness')}>
    💪 Fitness
  </button>
  {/* etc */}
</div>
```

#### 3.3 Estadísticas
Mostrar contador de resultados:
```tsx
<p className="text-white/60 mb-4">
  {creators.length} creadores encontrados
  {filters.interestIds.length > 0 && 
    ` con intereses en ${getInterestNames(filters.interestIds)}`
  }
</p>
```

---

## 🎨 Diseño UI/UX

### Layout General
```
┌─────────────────────────────────────────┐
│           Navbar                         │
├─────────────────────────────────────────┤
│                                          │
│  Explora Creadores                       │
│  Descubre contenido basado en tus...    │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │   Filtros                         │  │
│  │   [Buscar...] [Intereses] [✓Ver] │  │
│  └──────────────────────────────────┘  │
│                                          │
│  ┌─────────────────────────────────────┐│
│  │ Recomendados para ti (si auth)      ││
│  │ [Creator] [Creator] [Creator]...    ││
│  └─────────────────────────────────────┘│
│                                          │
│  📊 45 creadores encontrados             │
│                                          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │     │ │     │ │     │ │     │       │
│  │  C  │ │  R  │ │  E  │ │  A  │       │
│  │     │ │     │ │     │ │     │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│                                          │
│  [Cargar más]                            │
│                                          │
├─────────────────────────────────────────┤
│           Footer                         │
└─────────────────────────────────────────┘
```

### CreatorCard Mockup
```
┌─────────────────────────┐
│  ┌─────────────────┐    │
│  │  Banner/Img     │    │
│  └─────────────────┘    │
│       ┌───┐             │
│       │ A │             │ Avatar superpuesto
│       └───┘             │
│                         │
│  @username ✓            │ Verificado badge
│  Display Name           │
│                         │
│  Bio breve...           │
│                         │
│  🎨 Arte 📸 Foto        │ Intereses (highlight shared)
│                         │
│  👥 1.2K suscriptores   │
│                         │
│  [Ver Perfil] [❤️]      │ Botones de acción
└─────────────────────────┘
```

---

## 🔍 Casos de Uso

### 1. Usuario No Autenticado
- Ve todos los creadores populares por defecto
- Puede filtrar por intereses sin personalización
- Puede buscar por texto
- No ve sección de recomendaciones

### 2. Usuario Autenticado (Fan)
- Ve recomendaciones basadas en sus intereses
- Intereses compartidos se destacan en las tarjetas
- Puede agregar creadores a favoritos
- Puede seguir directamente desde la tarjeta

### 3. Usuario Creador
- Puede explorar otros creadores
- Útil para networking
- Ve su propia tarjeta marcada especialmente (opcional)

---

## ✅ Checklist de Implementación

### Backend
- [x] Endpoint `/api/interests` funcionando
- [x] Endpoint `/api/interests/by-category` funcionando
- [x] Endpoint `/api/discover/creators` funcionando
- [x] Endpoint `/api/discover/recommended` funcionando
- [x] Endpoint `/api/discover/search` funcionando

### Frontend - Componentes
- [ ] `CreatorCard.tsx` - Tarjeta individual de creador
- [ ] `ExploreFilters.tsx` - Barra de filtros y búsqueda
- [ ] `CreatorsGrid.tsx` - Grid con loading/empty states
- [ ] `RecommendedSection.tsx` - Sección de recomendaciones (opcional)
- [ ] `index.ts` - Exports de componentes

### Frontend - Página Principal
- [ ] Implementar estado y hooks
- [ ] Conectar con API (discoverApi)
- [ ] Implementar lógica de filtrado
- [ ] Implementar paginación/load more
- [ ] Manejar estados: loading, error, empty
- [ ] Agregar sección de recomendaciones (auth)
- [ ] Responsive design (mobile, tablet, desktop)

### Testing Manual
- [ ] Búsqueda por texto funciona
- [ ] Filtro por intereses funciona
- [ ] Filtro por categoría funciona
- [ ] Checkbox "solo verificados" funciona
- [ ] Limpiar filtros funciona
- [ ] Paginación/Load more funciona
- [ ] Recomendaciones personalizadas (auth) funcionan
- [ ] Intereses compartidos se destacan correctamente
- [ ] Links a perfiles funcionan
- [ ] Responsive en mobile/tablet/desktop

---

## 🚀 Orden de Ejecución Sugerido

### Sprint 1: Componentes Base (Día 1)
1. Crear `CreatorCard.tsx` con props básicos
2. Crear `CreatorsGrid.tsx` con loading/empty states
3. Testear componentes con datos mockeados

### Sprint 2: Filtros y Búsqueda (Día 2)
4. Crear `ExploreFilters.tsx`
5. Implementar selector de intereses
6. Implementar búsqueda con debounce
7. Implementar checkbox verificados

### Sprint 3: Integración (Día 3)
8. Actualizar `page.tsx` con estado y hooks
9. Conectar con API endpoints
10. Implementar lógica de filtrado
11. Implementar paginación

### Sprint 4: Personalización (Día 4)
12. Crear `RecommendedSection.tsx`
13. Cargar intereses del usuario
14. Destacar intereses compartidos
15. Pulir UX y responsive

---

## 📊 Métricas de Éxito

- ✅ Usuario puede buscar creadores por nombre
- ✅ Usuario puede filtrar por uno o múltiples intereses
- ✅ Usuario ve resultados relevantes ordenados por relevancia
- ✅ Usuario autenticado ve recomendaciones personalizadas
- ✅ Página es responsive en todos los dispositivos
- ✅ Loading states son claros y no confunden
- ✅ Filtros se pueden limpiar fácilmente

---

## 🎯 Próximos Pasos (Post-MVP)

1. **Búsqueda Avanzada**
   - Filtro por rango de precio de suscripción
   - Filtro por tipo de contenido (fotos/videos)
   - Ordenar por: popularidad, nuevos, alfabético

2. **Infinite Scroll**
   - Implementar con Intersection Observer
   - Mejor UX que botón "Load More"

3. **Guardar Búsquedas**
   - Permitir guardar combinaciones de filtros
   - "Alertas" cuando nuevos creadores coinciden

4. **Analytics**
   - Trackear qué intereses se buscan más
   - Qué creadores se visualizan más desde explore

---

## 🔗 Referencias

- Diseño inspirado en: Instagram Explore, OnlyFans Discover, Patreon Explore
- Sistema de intereses: Ya implementado en profile edit
- API endpoints: `/Users/zippy/Desktop/apapacho-backend/src/routes/discover.ts`
- Tipos: `/Users/zippy/Desktop/apapacho/src/types/index.ts` (Interest, Creator)

---

**Tiempo estimado total:** 8-12 horas
**Prioridad:** Alta
**Complejidad:** Media

