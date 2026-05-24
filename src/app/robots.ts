import type { MetadataRoute } from 'next'

/**
 * robots.txt — restrictive policy for an adult content platform.
 *
 * Design goals:
 *  1. Allow Google/Bing on a curated set of marketing/SEO surfaces only.
 *  2. Block AI training crawlers and archivers wholesale (no consent for
 *     ingestion of NSFW content into LLMs or Wayback snapshots).
 *  3. Default-deny everything else for privacy/admin/account areas.
 *
 * Note: individual creator profiles (`/[username]`) are NOT indexed by default.
 * Rationale: adult platform — we err on the conservative side. A future feature
 * will let each creator opt-in via a "Permitir aparecer en buscadores" toggle
 * in their settings.
 *
 * If both `public/robots.txt` and this file exist, Next.js raises a build
 * error. The static `public/robots.txt` has been removed in favour of this
 * dynamic file (Next.js 15 app router convention).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Major search engines: indexable marketing/SEO surfaces only.
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: [
          '/',
          '/login',
          '/terminos',
          '/privacidad',
          '/cookies',
          '/derechos',
          '/dmca',
          '/blog',
          '/calculadora',
          '/referidos',
          '/pricing',
          '/alternativa-onlyfans',
          '/faq',
          '/contact',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard',
          '/creator/',
          '/settings/',
          '/messages/',
          '/transactions',
          '/payments/',
          '/profile/edit',
          '/rewards/',
          '/ruleta',
          '/verify-email',
          '/reset-password',
          '/forgot-password',
          '/cards/',
          // Individual creator profiles — conservative default for NSFW.
          // Future: creator opt-in toggle will allow indexing per profile.
          '/[username]',
        ],
      },
      // Archivers and AI training crawlers — blocked wholesale.
      {
        userAgent: [
          'ia_archiver',         // Internet Archive Wayback
          'archive.org_bot',
          'CCBot',               // Common Crawl
          'GPTBot',              // OpenAI
          'ClaudeBot',           // Anthropic (courtesy)
          'Google-Extended',     // Google AI training (Bard/Gemini)
          'PerplexityBot',
          'cohere-ai',
          'anthropic-ai',
          'Bytespider',          // ByteDance/TikTok
          'FacebookBot',         // Meta AI training
          'meta-externalagent',
          'Amazonbot',
        ],
        disallow: ['/'],
      },
      // Default policy for unspecified crawlers: deny private/admin surfaces.
      {
        userAgent: '*',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard',
          '/settings/',
          '/creator/',
          '/messages/',
          '/transactions',
          '/payments/',
          '/profile/edit',
        ],
      },
    ],
    sitemap: 'https://appapacho.cl/sitemap.xml',
    host: 'https://appapacho.cl',
  }
}
