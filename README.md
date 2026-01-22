# 🌟 Apapacho

> La plataforma más personalizable para creadores de contenido - como OnlyFans pero con el alma de MySpace

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)

## ✨ Características

### Para Creadores
- 🎨 **Personalización Total** - Cambia colores, fondos, fuentes y más
- 🎵 **Música en tu Perfil** - Agrega hasta 3 canciones de YouTube (estilo MySpace!)
- 💰 **Múltiples Fuentes de Ingreso** - Suscripciones, venta de contenido y donaciones
- 📊 **Analytics Detallados** - Conoce a tu audiencia

### Para Fans
- 🔍 **Descubre Creadores** - Explora perfiles únicos y personalizados
- 💳 **Pagos Seguros** - Sistema de pago integrado
- 💬 **Interacción Directa** - Comenta, dona y apoya a tus creadores favoritos

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
open http://localhost:3000
```

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: Zustand
- **Base de Datos**: Prisma (PostgreSQL) - *próximamente*

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── components/
│   ├── ui/                # Componentes UI reutilizables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   └── Badge.tsx
│   ├── layout/            # Componentes de layout
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── landing/           # Secciones de landing page
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── CreatorsShowcase.tsx
│   │   └── CTASection.tsx
│   └── profile/           # Componentes de perfil
│       ├── MusicPlayer.tsx
│       └── ProfileCustomizer.tsx
├── hooks/                 # Custom React hooks
├── lib/                   # Utilidades
│   └── utils.ts
├── stores/                # Zustand stores
│   ├── authStore.ts
│   └── profileStore.ts
└── types/                 # TypeScript types
    └── index.ts
```

## 💸 Modelo de Negocio

| Tipo de Transacción | Comisión |
|---------------------|----------|
| Suscripciones       | 7-10%    |
| Venta de Contenido  | 7-10%    |
| Donaciones/Tips     | 7-10%    |

> 💡 La comisión más baja del mercado. OnlyFans cobra 20%.

## 🎯 Roadmap

- [x] Landing page
- [x] Sistema de componentes UI
- [x] Personalización de perfil (colores, temas)
- [x] Player de música YouTube
- [ ] Sistema de autenticación
- [ ] Perfiles de creadores
- [ ] Sistema de suscripciones
- [ ] Pasarela de pagos
- [ ] Sistema de mensajería
- [ ] Dashboard de analytics

## 📜 Scripts

```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linting con ESLint
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

ISC

---

Hecho con 💜 por el equipo de Apapacho
