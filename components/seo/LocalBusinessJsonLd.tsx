export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: 'Topdeck Montreal',
    url: 'https://www.topdeckmontreal.com',
    telephone: '+1-514-416-1588',
    email: 'info@topdeckmontreal.com',
    image: 'https://www.topdeckmontreal.com/Homepage-Hero.avif',
    priceRange: '$$',
    areaServed: {
      '@type': 'City',
      name: 'Montreal',
      '@id': 'https://www.wikidata.org/wiki/Q340',
    },
    serviceType: [
      'Deck Staining',
      'Fence Staining',
      'Pressure Washing',
      'Wood Restoration',
      'Railing Staining',
    ],
    sameAs: [
      'https://www.instagram.com/topdeckmontreal/',
      'https://www.facebook.com/topdeckmontreal',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
