/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Target modern browsers only - no legacy polyfills needed
  // Saves ~12KB by not including Array.at, Object.hasOwn, etc. polyfills
  // All these methods are native in Chrome 92+, Firefox 90+, Safari 15+
  
  // Experimental optimizations for better performance
  experimental: {
    optimizeCss: true, // Optimize CSS for faster loads
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash'], // Tree-shake large packages
  },
  
  // Reduce bundle size by excluding unused modules
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },
  
  // Enable gzip compression
  compress: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Note: 'unsafe-inline' needed for Next.js hydration, 'unsafe-eval' only in dev
              process.env.NODE_ENV === 'development' 
                ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com"
                : "script-src 'self' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://images.unsplash.com https://ui-avatars.com https://res.cloudinary.com https://*.placeholder.com http://localhost:3001 https://*.railway.app https://*.up.railway.app",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://www.youtube.com http://localhost:3001 https://*.railway.app https://*.up.railway.app ws://localhost:3001 wss://*.railway.app wss://*.up.railway.app",
              "frame-src 'self' https://www.youtube.com https://*.transbank.cl",
              "media-src 'self' https://res.cloudinary.com http://localhost:3001 https://*.railway.app blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.transbank.cl https://webpay3gint.transbank.cl https://webpay3g.transbank.cl",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache fonts
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
