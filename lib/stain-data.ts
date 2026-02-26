import type { LeadCondition } from '@/types/lead'

export type StainCategory = 'semi_transparent' | 'solid'
export type StainBrand = 'ligna' | 'steina' | 'bm_semi'
export type StainProductType = 'hybrid_oil' | 'penetrating_oil'

export interface StainColor {
  id: string
  nameKey: string
  thumbnail: string
  images: string[]
  badge?: string
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

export interface ProductTypeConfig {
  id: StainProductType
  nameKey: string
  descriptionKey: string
  pillKey: string
  brands: StainBrand[]
  grouped: boolean
}

export const PRODUCT_TYPES: ProductTypeConfig[] = [
  {
    id: 'hybrid_oil',
    nameKey: 'hybridOil',
    descriptionKey: 'hybridOilDescription',
    pillKey: 'semiTransparent',
    brands: ['ligna'],
    grouped: false,
  },
  {
    id: 'penetrating_oil',
    nameKey: 'penetratingOil',
    descriptionKey: 'penetratingOilDescription',
    pillKey: 'semiTransparent',
    brands: ['steina', 'bm_semi'],
    grouped: true,
  },
]

export const BRAND_GROUP_LABELS: Partial<Record<StainBrand, string>> = {
  steina: 'mostNaturalLook',
  bm_semi: 'moreUniformColour',
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
            badge: 'mostPopular',
            images: [
              '/GalleryImages/3-after-Ligna-GoldenPine.avif',
              '/GalleryImages/5-after-Ligna-GoldenPine.avif',
              '/GalleryImages/11-after-Ligna-GoldenPine.avif',
              '/GalleryImages/16-after-Ligna-GoldenPine.avif',
            ],
          },
          {
            id: 'ligna-maple-sugar',
            nameKey: 'mapleSugar',
            thumbnail: '/stains/semi-transparent/ligna/maple-sugar.jpg',
            images: [
              '/GalleryImages/6-after-Ligna-MapleSugar.avif',
            ],
          },
          {
            id: 'ligna-camel',
            nameKey: 'camel',
            thumbnail: '/stains/semi-transparent/ligna/camel.jpg',
            images: [
              '/GalleryImages/13-after-Ligna-Camel.avif',
            ],
          },
          {
            id: 'ligna-paprika',
            nameKey: 'paprika',
            thumbnail: '/stains/semi-transparent/ligna/paprika.jpg',
            images: [
              '/GalleryImages/17-after-Ligna-Paprika.avif',
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
            thumbnail: '/stains/semi-transparent/steina/light-oak.jpeg',
            images: [
              '/GalleryImages/4-after-Steina-LightOak.avif',
              '/GalleryImages/9-after-Steina-LightOak.avif',
              '/GalleryImages/14-after-Steina-LightOak.avif',
              '/GalleryImages/22-after-Steina-LightOak.avif',
            ],
          },
          {
            id: 'steina-natural-cedar',
            nameKey: 'naturalCedar',
            thumbnail: '/stains/semi-transparent/steina/natural-cedar.jpeg',
            images: [
              '/GalleryImages/12-after-Steina-NaturalCedar.avif',
            ],
          },
        ],
      },
      {
        id: 'bm_semi',
        nameKey: 'bmSemi',
        descriptionKey: 'bmSemiDescription',
        colors: [
          {
            id: 'bm-semi-natural-cedartone',
            nameKey: 'naturalCedartone',
            thumbnail: '/GalleryImages/1-after-BM-Semi-NaturalCedartone(ES-45).avif',
            images: [
              '/GalleryImages/1-after-BM-Semi-NaturalCedartone(ES-45).avif',
              '/GalleryImages/8-after-BM-Semi-NaturalCedartone(ES-45).avif',
              '/GalleryImages/19-after-BM-Semi-NaturalCedartone.avif',
              '/GalleryImages/26-after-BM-Semi-NaturalCedartone.avif',
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
        thumbnail: '/stains/solid/sea-gull-gray.png',
        images: [
          '/GalleryImages/2-after-BM-Solid-SeaGullGray(ES-72).avif',
        ],
      },
      {
        id: 'solid-kendall-charcoal',
        nameKey: 'kendallCharcoal',
        thumbnail: '/stains/solid/kendall-charcoal.png',
        images: [
          '/GalleryImages/7-after-BM-Solid-KendallCharcoal(HC-166).avif',
        ],
      },
      {
        id: 'solid-tudor-brown',
        nameKey: 'tudorBrown',
        thumbnail: '/stains/solid/tudor-brown.png',
        images: [
          '/GalleryImages/21-after-BM-Solid-TudorBrown(HC-185).avif',
          '/GalleryImages/24-after-BM-Solid-TudorBrown(HC-185).avif',
        ],
      },
      {
        id: 'solid-cordovan-brown',
        nameKey: 'cordovanBrown',
        thumbnail: '/stains/solid/cordovan-brown.png',
        images: [
          '/GalleryImages/15-after-BM-Solid-CordovanBrown(ES-62).avif',
        ],
      },
      {
        id: 'solid-platinum-gray',
        nameKey: 'platinumGray',
        thumbnail: '/stains/solid/platinum-gray.png',
        images: [
          '/GalleryImages/18-after-BM-Solid-PlatinumGray(HC-179).avif',
        ],
      },
      {
        id: 'solid-hidden-valley',
        nameKey: 'hiddenValley',
        thumbnail: '/stains/solid/hidden-valley.png',
        images: [
          '/GalleryImages/10-after-BM-HiddenValley(1134).avif',
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
  productTypes: StainProductType[]
} {
  const categories: StainCategory[] = []
  const brands: StainBrand[] = []
  const productTypes: StainProductType[] = []

  if (choices.includes('steina')) {
    brands.push('steina')
  }
  if (choices.includes('ligna')) {
    brands.push('ligna')
  }
  if (choices.includes('bm_semi')) {
    brands.push('bm_semi')
  }

  // Determine product types from available brands
  if (brands.includes('ligna')) {
    productTypes.push('hybrid_oil')
  }
  if (brands.includes('steina') || brands.includes('bm_semi')) {
    productTypes.push('penetrating_oil')
  }

  if (productTypes.length > 0) {
    categories.push('semi_transparent')
  }
  if (choices.includes('solid')) {
    categories.push('solid')
  }

  return { categories, brands, productTypes }
}

// Resolve a product type from a brand
export function getProductTypeForBrand(brand: StainBrand): StainProductType | null {
  for (const pt of PRODUCT_TYPES) {
    if (pt.brands.includes(brand)) return pt.id
  }
  return null
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
