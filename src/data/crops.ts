export interface CropData {
  id: string
  name: string
  seasons: ('spring' | 'summer' | 'fall' | 'winter')[]
  growthDays: number
  regrowDays: number | null
  seedPrice: {
    pierres?: number
    joja?: number
    oasis?: number
    special?: string
  }
  sellPrice: {
    normal: number
    silver: number
    gold: number
    iridium: number
  }
  harvestXp: number
  isTrellis: boolean
  canBeGiant: boolean
  description: string
  bundle?: string
  tips?: string
}

export const CROPS_DATA: CropData[] = [
  // --- Spring Crops ---
  {
    id: 'parsnip',
    name: 'Parsnip',
    seasons: ['spring'],
    growthDays: 4,
    regrowDays: null,
    seedPrice: { pierres: 20, joja: 25 },
    sellPrice: { normal: 35, silver: 43, gold: 52, iridium: 70 },
    harvestXp: 8,
    isTrellis: false,
    canBeGiant: false,
    description: 'A spring tuber closely related to the carrot. It has an earthy taste and is full of nutrients.',
    bundle: 'Spring Crops Bundle',
    tips: 'Ideal starter crop to level up farming quickly during the first week of Spring Year 1.',
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower',
    seasons: ['spring'],
    growthDays: 12,
    regrowDays: null,
    seedPrice: { pierres: 80, joja: 100 },
    sellPrice: { normal: 175, silver: 218, gold: 262, iridium: 350 },
    harvestXp: 23,
    isTrellis: false,
    canBeGiant: true,
    description: 'Valuable, but slow-growing. Despite its pale color, the florets are packed with nutrients.',
    bundle: 'Spring Crops Bundle',
    tips: 'Plant in a 3x3 grid for a chance to grow a Giant Cauliflower.',
  },
  {
    id: 'potato',
    name: 'Potato',
    seasons: ['spring'],
    growthDays: 6,
    regrowDays: null,
    seedPrice: { pierres: 50, joja: 62 },
    sellPrice: { normal: 80, silver: 100, gold: 120, iridium: 160 },
    harvestXp: 14,
    isTrellis: false,
    canBeGiant: false,
    description: 'A widely cultivated, versatile tuber. Has a chance to yield multiple potatoes per harvest.',
    bundle: 'Spring Crops Bundle',
    tips: 'Each harvest has roughly a 20% chance to yield an extra potato.',
  },
  {
    id: 'green-bean',
    name: 'Green Bean',
    seasons: ['spring'],
    growthDays: 10,
    regrowDays: 3,
    seedPrice: { pierres: 60, joja: 75 },
    sellPrice: { normal: 40, silver: 50, gold: 60, iridium: 80 },
    harvestXp: 9,
    isTrellis: true,
    canBeGiant: false,
    description: 'A juicy little bean with a cool, crisp snap. Grows on a trellis that blocks movement.',
    bundle: 'Spring Crops Bundle',
    tips: 'Plan pathways around trellis crops since you cannot walk through them.',
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    seasons: ['spring'],
    growthDays: 8,
    regrowDays: 4,
    seedPrice: { special: 'Egg Festival (100g)' },
    sellPrice: { normal: 120, silver: 150, gold: 180, iridium: 240 },
    harvestXp: 18,
    isTrellis: false,
    canBeGiant: false,
    description: 'A sweet, juicy favorite with a red color. Continues producing after initial harvest.',
    tips: 'Purchase at the Egg Festival on Spring 13. Save seeds with a Seed Maker for Year 2 Spring Day 1 planting.',
  },
  {
    id: 'rhubarb',
    name: 'Rhubarb',
    seasons: ['spring'],
    growthDays: 13,
    regrowDays: null,
    seedPrice: { oasis: 100 },
    sellPrice: { normal: 220, silver: 275, gold: 330, iridium: 440 },
    harvestXp: 26,
    isTrellis: false,
    canBeGiant: false,
    description: 'The stalks are extremely tart, but make a great dessert when sweetened.',
    tips: 'Available from the Oasis shop in the Calico Desert. High profit when turned into wine or jam.',
  },

  // --- Summer Crops ---
  {
    id: 'blueberry',
    name: 'Blueberry',
    seasons: ['summer'],
    growthDays: 13,
    regrowDays: 4,
    seedPrice: { pierres: 80, joja: 100 },
    sellPrice: { normal: 50, silver: 62, gold: 75, iridium: 100 },
    harvestXp: 10,
    isTrellis: false,
    canBeGiant: false,
    description: 'A popular berry reported to have many health benefits. Yields 3 berries per harvest.',
    bundle: 'Summer Crops Bundle',
    tips: 'One of the best Summer cash crops for steady passive income without replanting.',
  },
  {
    id: 'melon',
    name: 'Melon',
    seasons: ['summer'],
    growthDays: 12,
    regrowDays: null,
    seedPrice: { pierres: 80, joja: 100 },
    sellPrice: { normal: 250, silver: 312, gold: 375, iridium: 500 },
    harvestXp: 27,
    isTrellis: false,
    canBeGiant: true,
    description: 'A cool, sweet summer treat. Can grow into a giant crop in a 3x3 grid.',
    bundle: 'Summer Crops Bundle',
    tips: 'Pairs with Quality Crops bundle (needs 5 Gold-star melons).',
  },
  {
    id: 'starfruit',
    name: 'Starfruit',
    seasons: ['summer'],
    growthDays: 13,
    regrowDays: null,
    seedPrice: { oasis: 400 },
    sellPrice: { normal: 750, silver: 937, gold: 1125, iridium: 1500 },
    harvestXp: 43,
    isTrellis: false,
    canBeGiant: false,
    description: 'An extremely juicy fruit that grows in hot, humid climates. Highly lucrative.',
    tips: 'The most profitable crop to turn into Artisan Wine (2,250g base / 3,150g with Artisan profession).',
  },
  {
    id: 'tomato',
    name: 'Tomato',
    seasons: ['summer'],
    growthDays: 11,
    regrowDays: 4,
    seedPrice: { pierres: 50, joja: 62 },
    sellPrice: { normal: 60, silver: 75, gold: 90, iridium: 120 },
    harvestXp: 12,
    isTrellis: false,
    canBeGiant: false,
    description: 'Rich and slightly tangy, the tomato has a wide variety of culinary uses.',
    bundle: 'Summer Crops Bundle',
    tips: 'Regrows throughout Summer without replanting.',
  },
  {
    id: 'corn',
    name: 'Corn',
    seasons: ['summer', 'fall'],
    growthDays: 14,
    regrowDays: 4,
    seedPrice: { pierres: 150, joja: 187 },
    sellPrice: { normal: 50, silver: 62, gold: 75, iridium: 100 },
    harvestXp: 10,
    isTrellis: false,
    canBeGiant: false,
    description: 'One of the most popular grains. Survives across both Summer and Fall seasons.',
    bundle: 'Quality Crops Bundle',
    tips: 'Plant on Summer 1 to get continuous harvests throughout both Summer and Fall (almost 2 months).',
  },

  // --- Fall Crops ---
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    seasons: ['fall'],
    growthDays: 13,
    regrowDays: null,
    seedPrice: { pierres: 100, joja: 125 },
    sellPrice: { normal: 320, silver: 400, gold: 480, iridium: 640 },
    harvestXp: 31,
    isTrellis: false,
    canBeGiant: true,
    description: 'A fall favorite, grown for its crunchy seeds and delicately flavored flesh.',
    bundle: 'Fall Crops Bundle',
    tips: 'Can grow giant in a 3x3 grid. Also loved gift for Abigail and Krobus.',
  },
  {
    id: 'cranberries',
    name: 'Cranberries',
    seasons: ['fall'],
    growthDays: 7,
    regrowDays: 5,
    seedPrice: { pierres: 240, joja: 300 },
    sellPrice: { normal: 75, silver: 93, gold: 112, iridium: 150 },
    harvestXp: 14,
    isTrellis: false,
    canBeGiant: false,
    description: 'These tart red berries are a traditional fall food. Yields 2 berries per harvest.',
    tips: 'Tremendous raw cash generator in Fall due to multiple berries per bush and fast regrowth.',
  },
  {
    id: 'grape',
    name: 'Grape',
    seasons: ['fall'],
    growthDays: 10,
    regrowDays: 3,
    seedPrice: { pierres: 60, joja: 75 },
    sellPrice: { normal: 80, silver: 100, gold: 120, iridium: 160 },
    harvestXp: 13,
    isTrellis: true,
    canBeGiant: false,
    description: 'A sweet cluster of fruit that grows on a trellis. Regrows every 3 days.',
    tips: 'Vincent loved gift. Vincent is very happy to receive grapes in Fall.',
  },
  {
    id: 'sweet-gem-berry',
    name: 'Sweet Gem Berry',
    seasons: ['fall'],
    growthDays: 24,
    regrowDays: null,
    seedPrice: { special: 'Traveling Cart (Rare Seed, 1,000g)' },
    sellPrice: { normal: 3000, silver: 3750, gold: 4500, iridium: 6000 },
    harvestXp: 64,
    isTrellis: false,
    canBeGiant: false,
    description: 'It is by far the sweetest thing you have ever smelled. Not considered a fruit or vegetable.',
    tips: 'Give one to Old Master Cannoli in the Secret Woods to obtain a Stardrop.',
  },

  // --- Special Multi-Season ---
  {
    id: 'ancient-fruit',
    name: 'Ancient Fruit',
    seasons: ['spring', 'summer', 'fall'],
    growthDays: 28,
    regrowDays: 7,
    seedPrice: { special: 'Ancient Seed Artifact / Seed Maker' },
    sellPrice: { normal: 550, silver: 687, gold: 825, iridium: 1100 },
    harvestXp: 38,
    isTrellis: false,
    canBeGiant: false,
    description: 'It has been flourishing through the eons. Grows throughout Spring, Summer, and Fall.',
    bundle: 'The Missing Bundle',
    tips: 'The ultimate crop for Greenhouse automation. Regrows weekly forever without replanting.',
  },
]

export function getCropById(id: string): CropData | undefined {
  return CROPS_DATA.find((crop) => crop.id === id.toLowerCase())
}
