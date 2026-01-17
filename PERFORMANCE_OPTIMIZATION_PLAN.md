# Plan de Optimización de Performance - Apapacho

## 📊 Estado Actual (PageSpeed Insights - Mobile)
- **Performance**: 82/100
- **Accessibility**: 88/100  
- **Best Practices**: 100/100 ✅
- **SEO**: 92/100

### Core Web Vitals
| Métrica | Actual | Objetivo | Estado |
|---------|--------|----------|--------|
| FCP | 1.5s | <1.8s | ✅ Bueno |
| LCP | 4.2s | <2.5s | ⚠️ Mejorar |
| TBT | 10ms | <200ms | ✅ Excelente |
| CLS | 0 | <0.1 | ✅ Perfecto |
| Speed Index | 4.6s | <3.4s | ⚠️ Mejorar |

---

## 🎯 Plan de Optimización (82 → 100)

### 1. Performance: 82 → 95+ ⚡

#### A. Render Blocking Resources (-150ms estimado)
**Problema**: Múltiples fuentes de Google Fonts cargando de forma bloqueante

**Soluciones**:
1. ✅ Reducir fuentes de 7 a 3 esenciales (Inter, Poppins, Cinzel)
2. ✅ Usar `font-display: swap` (ya implementado)
3. ✅ Preload de fuentes críticas en layout.tsx
4. ⚡ Optimizar pesos de fuentes (solo cargar necesarios)

**Archivos a modificar**:
- `/src/app/layout.tsx` - Reducir imports de fuentes
- `/src/lib/fonts.ts` - Actualizar lista de fuentes disponibles

**Impacto**: +8-10 puntos en Performance

---

#### B. Legacy JavaScript (-12 KiB estimado)
**Problema**: Módulos antiguos que no usan sintaxis moderna

**Soluciones**:
1. ⚡ Configurar `browserslist` en package.json
2. ⚡ Habilitar transpilación selectiva en next.config.js
3. ⚡ Actualizar dependencias antiguas

**Archivos a modificar**:
- `/package.json` - Agregar browserslist
- `/next.config.js` - Configurar swcMinify y target

**Impacto**: +2-3 puntos en Performance

---

#### C. Optimización de Imágenes (-20 KiB estimado)
**Problema**: Algunas imágenes sin formato moderno (WebP/AVIF)

**Soluciones**:
1. ✅ Next.js Image con lazy loading (implementado)
2. ⚡ Forzar formato WebP en next.config.js
3. ⚡ Comprimir imágenes en `/public/images/`
4. ⚡ Usar placeholder blur para imágenes grandes

**Archivos a modificar**:
- `/next.config.js` - Configurar formatos de imagen
- `/src/components/ui/OptimizedImage.tsx` - Agregar blur placeholder

**Impacto**: +2-4 puntos en Performance

---

#### D. LCP Optimization (4.2s → <2.5s)
**Problema**: Largest Contentful Paint demasiado lento

**Soluciones**:
1. ⚡ Preload de imágenes hero/banner
2. ⚡ Server-side rendering para contenido crítico
3. ⚡ Priorizar recursos above-the-fold
4. ⚡ Reducir JavaScript de landing page

**Archivos a modificar**:
- `/src/app/page.tsx` - Optimizar landing page
- `/src/components/landing/*` - Lazy load componentes below-fold

**Impacto**: +5-8 puntos en Performance

---

### 2. Accessibility: 88 → 95+ ♿

#### A. Botones sin nombre accesible
**Problema**: Botones con íconos sin aria-label

**Soluciones**:
1. ⚡ Agregar aria-label a todos los botones de íconos
2. ⚡ Usar <button> en lugar de <div> clickeable
3. ⚡ Agregar títulos descriptivos

**Archivos a buscar**:
```bash
grep -r "onClick.*<.*>" src/components/
```

**Impacto**: +3-5 puntos en Accessibility

---

#### B. Enlaces sin nombre discernible
**Problema**: Links con solo íconos o imágenes

**Soluciones**:
1. ⚡ Agregar aria-label a enlaces de íconos
2. ⚡ Usar alt text descriptivo en imágenes dentro de links
3. ⚡ Evitar links vacíos

**Impacto**: +2-3 puntos en Accessibility

---

#### C. Headings no secuenciales
**Problema**: Saltos en jerarquía de encabezados (h1 → h3)

**Soluciones**:
1. ⚡ Auditoría de todos los componentes
2. ⚡ Usar h2, h3, h4 secuencialmente
3. ⚡ Documentar jerarquía en componentes

**Impacto**: +2 puntos en Accessibility

---

### 3. SEO: 92 → 100 🔍

#### A. robots.txt inválido
**Problema**: Error en archivo robots.txt

**Soluciones**:
1. ⚡ Verificar sintaxis de `/public/robots.txt`
2. ⚡ Probar con Google Search Console
3. ⚡ Agregar sitemap.xml

**Archivos a crear/modificar**:
- `/public/robots.txt`
- `/public/sitemap.xml` (o dinámico en `/app/sitemap.ts`)

**Impacto**: +8 puntos en SEO

---

## 📋 Checklist de Implementación

### Fase 1: Quick Wins (1-2 horas) 🚀
- [ ] Reducir fuentes de Google (7 → 3)
- [ ] Agregar preload de fuentes críticas
- [ ] Configurar browserslist en package.json
- [ ] Arreglar robots.txt
- [ ] Agregar aria-labels a botones principales

### Fase 2: Optimizaciones Medias (2-3 horas) ⚡
- [ ] Configurar WebP/AVIF en next.config.js
- [ ] Comprimir imágenes de /public/
- [ ] Auditoría de headings (h1-h6)
- [ ] Lazy load componentes landing page
- [ ] Crear sitemap.xml

### Fase 3: Optimizaciones Avanzadas (3-4 horas) 🎯
- [ ] Preload imágenes hero
- [ ] SSR para contenido crítico
- [ ] Code splitting agresivo
- [ ] Auditoría completa de accesibilidad
- [ ] Testing en dispositivos móviles reales

---

## 🎯 Resultados Esperados

| Métrica | Actual | Objetivo | Mejora |
|---------|--------|----------|--------|
| Performance | 82 | 95+ | +13 pts |
| Accessibility | 88 | 95+ | +7 pts |
| Best Practices | 100 | 100 | ✅ |
| SEO | 92 | 100 | +8 pts |
| **LCP** | 4.2s | <2.5s | -1.7s |
| **Speed Index** | 4.6s | <3.4s | -1.2s |

---

## 🛠️ Comandos Útiles

### Análisis local
```bash
# Lighthouse CLI
npx lighthouse https://localhost:3000 --view

# Bundle analyzer
npm run build
npm run analyze

# Performance profiling
npx next-env -p 3000 --experimental-debug
```

### Testing
```bash
# Build optimizado
npm run build

# Preview producción
npm run start

# Verificar tamaño de bundles
du -sh .next/static/chunks/*
```

---

## 📚 Referencias
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
