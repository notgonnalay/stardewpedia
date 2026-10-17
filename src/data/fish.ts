export interface FishData {
  id: string
  name: string
  locations: string[]
  seasons: ('spring' | 'summer' | 'fall' | 'winter')[]
  weather: 'any' | 'sunny' | 'rain'
  time: string
  difficulty: number
  behavior: 'mixed' | 'dart' | 'smooth' | 'sinker' | 'floater'
  basePrice: number
  isLegendary: boolean
  bundle?: string
  description: string
  tips?: string
}

export const FISH_DATA: FishData[] = [
  {
    id: 'catfish',
    name: 'Catfish',
    locations: ['River (Town/Forest)', 'Secret Woods Pond', 'Witch\'s Swamp'],
    seasons: ['spring', 'fall', 'summer'],
    weather: 'rain',
    time: '6:00 AM – 12:00 AM',
    difficulty: 75,
    behavior: 'mixed',
    basePrice: 200,
    isLegendary: false,
    bundle: 'River Fish Bundle',
    description: 'An uncommon fish that only comes out when it rains in Pelican Town.',
    tips: 'Use Trap Bobber to slow down bar decay against its fast darting patterns.',
  },
  {
    id: 'sturgeon',
    name: 'Sturgeon',
    locations: ['Mountain Lake'],
    seasons: ['summer', 'winter'],
    weather: 'any',
    time: '6:00 AM – 7:00 PM',
    difficulty: 78,
    behavior: 'mixed',
    basePrice: 200,
    isLegendary: false,
    bundle: 'Lake Fish Bundle',
    description: 'An ancient fish that has remained unchanged for millions of years. Its roe makes Caviar.',
    tips: 'Put Sturgeon in a Fish Pond to harvest Sturgeon Roe, which preserves into Caviar (500g).',
  },
  {
    id: 'walleye',
    name: 'Walleye',
    locations: ['River', 'Mountain Lake', 'Cindersap Forest Pond'],
    seasons: ['fall', 'winter'],
    weather: 'rain',
    time: '12:00 PM – 2:00 AM',
    difficulty: 65,
    behavior: 'smooth',
    basePrice: 105,
    isLegendary: false,
    bundle: 'Night Fishing Bundle',
    description: 'A freshwater fish caught at night during rainy autumn weather.',
    tips: 'Key requirement for the Night Fishing Bundle in the Community Center Fish Tank.',
  },
  {
    id: 'squid',
    name: 'Squid',
    locations: ['Ocean'],
    seasons: ['winter'],
    weather: 'any',
    time: '6:00 PM – 2:00 AM',
    difficulty: 75,
    behavior: 'sinker',
    basePrice: 80,
    isLegendary: false,
    description: 'A deep sea creature that can grow to an enormous size. Active late at night in winter.',
    tips: 'Provides Squid Ink, needed for Squid Ink Ravioli and various tailoring items.',
  },
  {
    id: 'glacierfish',
    name: 'Glacierfish',
    locations: ['Cindersap Forest (Arrowhead Island tip)'],
    seasons: ['winter'],
    weather: 'any',
    time: '6:00 AM – 8:00 PM',
    difficulty: 100,
    behavior: 'mixed',
    basePrice: 1000,
    isLegendary: true,
    description: 'One of the five legendary fish. Builds a nest on the underside of glaciers.',
    tips: 'Requires Fishing Level 6+. Stand at the southern tip of Arrowhead Island and cast into deep water.',
  },
  {
    id: 'largemouth-bass',
    name: 'Largemouth Bass',
    locations: ['Mountain Lake', 'Wilderness Farm'],
    seasons: ['spring', 'summer', 'fall', 'winter'],
    weather: 'any',
    time: '6:00 AM – 7:00 PM',
    difficulty: 50,
    behavior: 'mixed',
    basePrice: 100,
    isLegendary: false,
    bundle: 'Lake Fish Bundle',
    description: 'A popular freshwater fish that inhabits lakes. Available year-round.',
    tips: 'Reliable source of food and loved gift ingredient (Crispy Bass) for Kent.',
  },
  {
    id: 'pufferfish',
    name: 'Pufferfish',
    locations: ['Ocean'],
    seasons: ['summer'],
    weather: 'sunny',
    time: '12:00 PM – 4:00 PM',
    difficulty: 80,
    behavior: 'floater',
    basePrice: 200,
    isLegendary: false,
    bundle: 'Specialty Fish Bundle',
    description: 'Inflates when threatened. Caught during early sunny afternoons in Summer.',
    tips: 'Floater behavior stays near the top of the bar; loved gift for Abigail.',
  },
  {
    id: 'red-snapper',
    name: 'Red Snapper',
    locations: ['Ocean'],
    seasons: ['summer', 'fall'],
    weather: 'rain',
    time: '6:00 AM – 7:00 PM',
    difficulty: 40,
    behavior: 'mixed',
    basePrice: 50,
    isLegendary: false,
    bundle: 'Ocean Fish Bundle',
    description: 'A popular fish with a nice red tint. Bites when it rains at the beach.',
    tips: 'Easy catch needed for the Ocean Fish Bundle.',
  },
]

export function getFishById(id: string): FishData | undefined {
  return FISH_DATA.find((fish) => fish.id === id.toLowerCase())
}
