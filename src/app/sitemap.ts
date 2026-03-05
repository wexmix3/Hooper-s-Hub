import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://courtbook-nyc.vercel.app'

  // Static pages
  const static_pages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/runs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/manhattan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/brooklyn`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/queens`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/bronx`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/staten-island`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/venue-signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  // Dynamic court pages
  let courtPages: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: courts } = await supabase
      .from('courts')
      .select('id, updated_at')
      .order('created_at', { ascending: false })

    courtPages = (courts ?? []).map((court: { id: string; updated_at: string }) => ({
      url: `${baseUrl}/courts/${court.id}`,
      lastModified: new Date(court.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {
    // DB not available at build time — skip dynamic pages
  }

  return [...static_pages, ...courtPages]
}
