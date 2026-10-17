export interface RecipeData {
  id: string
  name: string
  kind: 'cooking' | 'crafting'
  ingredients: { name: string; quantity: number }[]
  buffs?: string
  energy?: number
  health?: number
  source: string
  description: string
}

export const RECIPES_DATA: RecipeData[] = [
  // --- Cooking ---
  {
    id: 'fried-egg',
    name: 'Fried Egg',
    kind: 'cooking',
    ingredients: [{ name: 'Egg', quantity: 1 }],
    energy: 50,
    health: 22,
    source: 'Default starter recipe (Upgraded Farmhouse)',
    description: 'Sunny-side up. A simple staple breakfast.',
  },
  {
    id: 'spicy-eel',
    name: 'Spicy Eel',
    kind: 'cooking',
    ingredients: [
      { name: 'Eel', quantity: 1 },
      { name: 'Hot Pepper', quantity: 1 },
    ],
    buffs: '+1 Speed, +1 Luck (7m)',
    energy: 115,
    health: 51,
    source: 'George (Mail - 7 Hearts)',
    description: 'It\'s really spicy! Be careful. The staple food for Skull Cavern cavern dives.',
  },
  {
    id: 'pumpkin-soup',
    name: 'Pumpkin Soup',
    kind: 'cooking',
    ingredients: [
      { name: 'Pumpkin', quantity: 1 },
      { name: 'Milk', quantity: 1 },
    ],
    buffs: '+2 Defense, +2 Luck (7m 41s)',
    energy: 200,
    health: 90,
    source: 'Robin (Mail - 7 Hearts)',
    description: 'A seasonal favorite that warms your belly.',
  },
  {
    id: 'dish-o-the-sea',
    name: 'Dish O\' The Sea',
    kind: 'cooking',
    ingredients: [
      { name: 'Sardine', quantity: 2 },
      { name: 'Hashbrowns', quantity: 1 },
    ],
    buffs: '+3 Fishing (5m 35s)',
    energy: 150,
    health: 67,
    source: 'Fishing Level 3',
    description: 'This\'ll keep you warm in the cold ocean breeze.',
  },
  {
    id: 'triple-shot-espresso',
    name: 'Triple Shot Espresso',
    kind: 'cooking',
    ingredients: [{ name: 'Coffee', quantity: 3 }],
    buffs: '+1 Speed (4m 12s)',
    energy: 8,
    health: 3,
    source: 'Stardrop Saloon (5,000g purchase)',
    description: 'It\'s more potent than regular coffee! Stacks with food speed buffs.',
  },

  // --- Crafting ---
  {
    id: 'sprinkler',
    name: 'Sprinkler',
    kind: 'crafting',
    ingredients: [
      { name: 'Copper Bar', quantity: 1 },
      { name: 'Iron Bar', quantity: 1 },
    ],
    source: 'Farming Level 2',
    description: 'Waters the 4 adjacent tiles every morning.',
  },
  {
    id: 'quality-sprinkler',
    name: 'Quality Sprinkler',
    kind: 'crafting',
    ingredients: [
      { name: 'Iron Bar', quantity: 1 },
      { name: 'Gold Bar', quantity: 1 },
      { name: 'Refined Quartz', quantity: 1 },
    ],
    source: 'Farming Level 6',
    description: 'Waters the 8 surrounding tiles every morning (3x3 area).',
  },
  {
    id: 'iridium-sprinkler',
    name: 'Iridium Sprinkler',
    kind: 'crafting',
    ingredients: [
      { name: 'Gold Bar', quantity: 1 },
      { name: 'Iridium Bar', quantity: 1 },
      { name: 'Battery Pack', quantity: 1 },
    ],
    source: 'Farming Level 9',
    description: 'Waters the 24 surrounding tiles every morning (5x5 area).',
  },
  {
    id: 'preserves-jar',
    name: 'Preserves Jar',
    kind: 'crafting',
    ingredients: [
      { name: 'Wood', quantity: 50 },
      { name: 'Stone', quantity: 40 },
      { name: 'Coal', quantity: 8 },
    ],
    source: 'Farming Level 4',
    description: 'Turns vegetables into pickles and fruit into jam.',
  },
  {
    id: 'keg',
    name: 'Keg',
    kind: 'crafting',
    ingredients: [
      { name: 'Wood', quantity: 30 },
      { name: 'Copper Bar', quantity: 1 },
      { name: 'Iron Bar', quantity: 1 },
      { name: 'Oak Resin', quantity: 1 },
    ],
    source: 'Farming Level 8',
    description: 'Places vegetables inside to make juice, or fruit to make wine.',
  },
]
