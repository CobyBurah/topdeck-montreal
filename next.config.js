const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/about-us', destination: '/en/services', permanent: true },
      { source: '/services', destination: '/en/services', permanent: true },
      { source: '/gallery', destination: '/en/gallery', permanent: true },
      { source: '/contact', destination: '/en/contact', permanent: true },
      { source: '/fr/about-us', destination: '/fr/services', permanent: true },
      { source: '/fr/fences', destination: '/fr', permanent: true },
      { source: '/blank', destination: '/en', permanent: true },
      { source: '/fr/blank', destination: '/fr', permanent: true },
    ]
  },
  experimental: {
    optimizeCss: true,
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
