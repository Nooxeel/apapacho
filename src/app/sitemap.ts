import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Fetch creators from API for dynamic sitemap
async function getCreators(): Promise<{ username: string; updatedAt: string }[]> {
  try {
    const response = await fetch(`${API_URL}/creators`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.map((creator: any) => ({
      username: creator.user?.username || creator.username,
      updatedAt: creator.updatedAt || new Date().toISOString()
    }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://appapacho.cl'
  
  // Static pages with SEO priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog/como-ganar-dinero-contenido-adulto-chile`,
      lastModified: new Date('2026-01-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/alternativas-onlyfans-latinoamerica`,
      lastModified: new Date('2026-01-10'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // Dynamic creator profile pages
  const creators = await getCreators()
  const creatorPages: MetadataRoute.Sitemap = creators.map((creator) => ({
    url: `${baseUrl}/${creator.username}`,
    lastModified: new Date(creator.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...creatorPages]
}
