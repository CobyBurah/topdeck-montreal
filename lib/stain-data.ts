import type { LeadCondition } from '@/types/lead'

export type StainCategory = 'semi_transparent' | 'solid'
export type StainBrand = 'ligna' | 'steina'

export interface StainColor {
  id: string
  nameKey: string
  thumbnail: string
  images: string[]
}

export interface StainBrandConfig {
  id: StainBrand
  nameKey: string
  descriptionKey: string
  colors: StainColor[]
}

export interface StainCategoryConfig {
  id: StainCategory
  nameKey: string
  descriptionKey: string
  brands?: StainBrandConfig[]
  colors?: StainColor[]
}

export const STAIN_CATALOG: StainCategoryConfig[] = [
  {
    id: 'semi_transparent',
    nameKey: 'semiTransparent',
    descriptionKey: 'semiTransparentDescription',
    brands: [
      {
        id: 'ligna',
        nameKey: 'ligna',
        descriptionKey: 'lignaDescription',
        colors: [
          {
            id: 'ligna-golden-pine',
            nameKey: 'goldenPine',
            thumbnail: '/stains/semi-transparent/ligna/golden-pine.jpg',
            images: [
              '/stains/semi-transparent/ligna/golden-pine-1.jpg',
              '/stains/semi-transparent/ligna/golden-pine-2.jpg',
            ],
          },
          {
            id: 'ligna-maple-sugar',
            nameKey: 'mapleSugar',
            thumbnail: '/stains/semi-transparent/ligna/maple-sugar.jpg',
            images: [
              '/stains/semi-transparent/ligna/maple-sugar-1.jpg',
              '/stains/semi-transparent/ligna/maple-sugar-2.jpg',
            ],
          },
          {
            id: 'ligna-camel',
            nameKey: 'camel',
            thumbnail: '/stains/semi-transparent/ligna/camel.jpg',
            images: [
              '/stains/semi-transparent/ligna/camel-1.jpg',
              '/stains/semi-transparent/ligna/camel-2.jpg',
            ],
          },
          {
            id: 'ligna-paprika',
            nameKey: 'paprika',
            thumbnail: '/stains/semi-transparent/ligna/paprika.jpg',
            images: [
              '/stains/semi-transparent/ligna/paprika-1.jpg',
              '/stains/semi-transparent/ligna/paprika-2.jpg',
            ],
          },
        ],
      },
      {
        id: 'steina',
        nameKey: 'steina',
        descriptionKey: 'steinaDescription',
        colors: [
          {
            id: 'steina-light-oak',
            nameKey: 'lightOak',
            thumbnail: '/stains/semi-transparent/steina/light-oak.jpg',
            images: [
              '/stains/semi-transparent/steina/light-oak-1.jpg',
              '/stains/semi-transparent/steina/light-oak-2.jpg',
            ],
          },
          {
            id: 'steina-natural-cedar',
            nameKey: 'naturalCedar',
            thumbnail: '/stains/semi-transparent/steina/natural-cedar.jpg',
            images: [
              '/stains/semi-transparent/steina/natural-cedar-1.jpg',
              '/stains/semi-transparent/steina/natural-cedar-2.jpg',
            ],
          },
          {
            id: 'steina-honey-gold',
            nameKey: 'honeyGold',
            thumbnail: '/stains/semi-transparent/steina/honey-gold.jpg',
            images: [
              '/stains/semi-transparent/steina/honey-gold-1.jpg',
              '/stains/semi-transparent/steina/honey-gold-2.jpg',
            ],
          },
          {
            id: 'steina-redwood',
            nameKey: 'redwood',
            thumbnail: '/stains/semi-transparent/steina/redwood.jpg',
            images: [
              '/stains/semi-transparent/steina/redwood-1.jpg',
              '/stains/semi-transparent/steina/redwood-2.jpg',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'solid',
    nameKey: 'solid',
    descriptionKey: 'solidDescription',
    colors: [
      {
        id: 'solid-sea-gull-gray',
        nameKey: 'seaGullGray',
        thumbnail: '/stains/solid/sea-gull-gray.jpg',
        images: [
          '/stains/solid/sea-gull-gray-1.jpg',
          '/stains/solid/sea-gull-gray-2.jpg',
        ],
      },
      {
        id: 'solid-kendall-charcoal',
        nameKey: 'kendallCharcoal',
        thumbnail: '/stains/solid/kendall-charcoal.jpg',
        images: [
          '/stains/solid/kendall-charcoal-1.jpg',
          '/stains/solid/kendall-charcoal-2.jpg',
        ],
      },
      {
        id: 'solid-tudor-brown',
        nameKey: 'tudorBrown',
        thumbnail: '/stains/solid/tudor-brown.jpg',
        images: [
          '/stains/solid/tudor-brown-1.jpg',
          '/stains/solid/tudor-brown-2.jpg',
        ],
      },
      {
        id: 'solid-cordovan-brown',
        nameKey: 'cordovanBrown',
        thumbnail: '/stains/solid/cordovan-brown.jpg',
        images: [
          '/stains/solid/cordovan-brown-1.jpg',
          '/stains/solid/cordovan-brown-2.jpg',
        ],
      },
      {
        id: 'solid-platinum-gray',
        nameKey: 'platinumGray',
        thumbnail: '/stains/solid/platinum-gray.jpg',
        images: [
          '/stains/solid/platinum-gray-1.jpg',
          '/stains/solid/platinum-gray-2.jpg',
        ],
      },
      {
        id: 'solid-hidden-valley',
        nameKey: 'hiddenValley',
        thumbnail: '/stains/solid/hidden-valley.jpg',
        images: [
          '/stains/solid/hidden-valley-1.jpg',
          '/stains/solid/hidden-valley-2.jpg',
        ],
      },
    ],
  },
]

// Condition priority for resolving multiple leads (higher = more permissive)
const CONDITION_PRIORITY: Record<LeadCondition, number> = {
  unstained_new: 4,
  unstained_grey: 3,
  semi_transparent: 2,
  opaque: 1,
}

export function getMostPermissiveCondition(
  conditions: (LeadCondition | null)[]
): LeadCondition | null {
  const validConditions = conditions.filter(
    (c): c is LeadCondition => c !== null
  )
  if (validConditions.length === 0) return null
  return validConditions.reduce((best, current) =>
    CONDITION_PRIORITY[current] > CONDITION_PRIORITY[best] ? current : best
  )
}

export function getAvailableOptions(condition: LeadCondition): {
  categories: StainCategory[]
  brands: StainBrand[]
} {
  switch (condition) {
    case 'unstained_new':
      return {
        categories: ['semi_transparent', 'solid'],
        brands: ['ligna', 'steina'],
      }
    case 'unstained_grey':
    case 'semi_transparent':
      return {
        categories: ['semi_transparent', 'solid'],
        brands: ['ligna'],
      }
    case 'opaque':
      return {
        categories: ['solid'],
        brands: [],
      }
  }
}

export function getAvailableOptionsFromChoices(choices: string[]): {
  categories: StainCategory[]
  brands: StainBrand[]
} {
  const categories: StainCategory[] = []
  const brands: StainBrand[] = []

  if (choices.includes('steina')) {
    if (!categories.includes('semi_transparent')) categories.push('semi_transparent')
    brands.push('steina')
  }
  if (choices.includes('ligna')) {
    if (!categories.includes('semi_transparent')) categories.push('semi_transparent')
    brands.push('ligna')
  }
  if (choices.includes('solid')) {
    categories.push('solid')
  }

  return { categories, brands }
}

// Resolve a stain color ID back to its color, category, and brand context
export function resolveStainById(
  stainId: string
): { color: StainColor; category: StainCategory; brand: StainBrand | null } | null {
  for (const cat of STAIN_CATALOG) {
    if (cat.brands) {
      for (const brand of cat.brands) {
        const color = brand.colors.find((c) => c.id === stainId)
        if (color) return { color, category: cat.id, brand: brand.id }
      }
    }
    if (cat.colors) {
      const color = cat.colors.find((c) => c.id === stainId)
      if (color) return { color, category: cat.id, brand: null }
    }
  }
  return null
}
