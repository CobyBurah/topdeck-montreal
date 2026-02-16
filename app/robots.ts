import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/employee-portal/', '/client-portal/'],
      },
      {
        userAgent: 'PetalBot',
        disallow: '/',
      },
      {
        userAgent: 'AhrefsBot',
        crawlDelay: 10,
      },
      {
        userAgent: 'dotbot',
        crawlDelay: 10,
      },
    ],
    sitemap: 'https://www.topdeckmontreal.com/sitemap.xml',
  }
}
