export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: 'Topdeck Montreal',
    description: 'Specialized exterior wood restoration in Montreal. Professional 3-step process: wash, sand & stain for decks, fences, railings, pergolas, and gazebos.',
    url: 'https://www.topdeckmontreal.com',
    telephone: '+1-514-416-1588',
    email: 'info@topdeckmontreal.com',
    image: 'https://www.topdeckmontreal.com/Homepage-Hero.avif',
    priceRange: '$$',
    areaServed: [
      {
        '@type': 'City',
        name: 'Montreal',
        '@id': 'https://www.wikidata.org/wiki/Q340',
      },
      {
        '@type': 'City',
        name: 'Laval',
        '@id': 'https://www.wikidata.org/wiki/Q141532',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'South Shore',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'West Island',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Greater Montreal',
      },
    ],
    serviceType: [
      'Exterior Wood Restoration',
      'Deck Staining',
      'Fence Staining',
      'Railing Staining',
      'Pergola Staining',
      'Gazebo Staining',
      'Pressure Washing',
      'Wood Sanding',
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
