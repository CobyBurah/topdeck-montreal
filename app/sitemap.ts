import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.topdeckmontreal.com'
  const pages = ['', '/services', '/gallery', '/contact']
  const locales = ['en', 'fr']

  return pages.map((page) => ({
    url: `${baseUrl}/en${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: page === '' ? 1.0 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${baseUrl}/${locale}${page}`])
      ),
    },
  }))
}
