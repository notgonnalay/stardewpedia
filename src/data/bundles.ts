export interface BundleItem {
  id: string
  name: string
  quantity: number
  quality?: 'normal' | 'silver' | 'gold' | 'iridium'
}

export interface BundleRoom {
  id: string
  name: string
  reward: string
  bundles: {
    id: string
    name: string
    slotsRequired: number
    reward: string
    items: BundleItem[]
  }[]
}

export const BUNDLES_DATA: BundleRoom[] = [
  {
    id: 'pantry',
    name: 'Pantry',
    reward: 'Greenhouse Restored',
    bundles: [
      {
        id: 'spring-crops',
        name: 'Spring Crops Bundle',
        slotsRequired: 4,
        reward: 'Speed-Gro (20)',
        items: [
          { id: 'parsnip', name: 'Parsnip', quantity: 1 },
          { id: 'green-bean', name: 'Green Bean', quantity: 1 },
          { id: 'cauliflower', name: 'Cauliflower', quantity: 1 },
          { id: 'potato', name: 'Potato', quantity: 1 },
        ],
      },
      {
        id: 'summer-crops',
        name: 'Summer Crops Bundle',
        slotsRequired: 4,
        reward: 'Quality Sprinkler (1)',
        items: [
          { id: 'tomato', name: 'Tomato', quantity: 1 },
          { id: 'hot-pepper', name: 'Hot Pepper', quantity: 1 },
          { id: 'blueberry', name: 'Blueberry', quantity: 1 },
          { id: 'melon', name: 'Melon', quantity: 1 },
        ],
      },
      {
        id: 'fall-crops',
        name: 'Fall Crops Bundle',
        slotsRequired: 4,
        reward: 'Bee House (1)',
        items: [
          { id: 'corn', name: 'Corn', quantity: 1 },
          { id: 'eggplant', name: 'Eggplant', quantity: 1 },
          { id: 'pumpkin', name: 'Pumpkin', quantity: 1 },
          { id: 'yam', name: 'Yam', quantity: 1 },
        ],
      },
      {
        id: 'quality-crops',
        name: 'Quality Crops Bundle',
        slotsRequired: 3,
        reward: 'Preserves Jar (1)',
        items: [
          { id: 'parsnip', name: 'Parsnip (Gold)', quantity: 5, quality: 'gold' },
          { id: 'melon', name: 'Melon (Gold)', quantity: 5, quality: 'gold' },
          { id: 'pumpkin', name: 'Pumpkin (Gold)', quantity: 5, quality: 'gold' },
          { id: 'corn', name: 'Corn (Gold)', quantity: 5, quality: 'gold' },
        ],
      },
      {
        id: 'animal-bundle',
        name: 'Animal Bundle',
        slotsRequired: 5,
        reward: 'Cheese Press (1)',
        items: [
          { id: 'large-milk', name: 'Large Milk', quantity: 1 },
          { id: 'large-egg-brown', name: 'Large Egg (Brown)', quantity: 1 },
          { id: 'large-egg-white', name: 'Large Egg (White)', quantity: 1 },
          { id: 'large-goat-milk', name: 'Large Goat Milk', quantity: 1 },
          { id: 'wool', name: 'Wool', quantity: 1 },
          { id: 'duck-egg', name: 'Duck Egg', quantity: 1 },
        ],
      },
    ],
  },
  {
    id: 'fish-tank',
    name: 'Fish Tank',
    reward: 'Glittering Boulder Removed (Copper Pan)',
    bundles: [
      {
        id: 'river-fish',
        name: 'River Fish Bundle',
        slotsRequired: 4,
        reward: 'Bait (30)',
        items: [
          { id: 'sunfish', name: 'Sunfish', quantity: 1 },
          { id: 'catfish', name: 'Catfish', quantity: 1 },
          { id: 'shad', name: 'Shad', quantity: 1 },
          { id: 'tiger-trout', name: 'Tiger Trout', quantity: 1 },
        ],
      },
      {
        id: 'lake-fish',
        name: 'Lake Fish Bundle',
        slotsRequired: 4,
        reward: 'Dressed Spinner (1)',
        items: [
          { id: 'largemouth-bass', name: 'Largemouth Bass', quantity: 1 },
          { id: 'carp', name: 'Carp', quantity: 1 },
          { id: 'bullhead', name: 'Bullhead', quantity: 1 },
          { id: 'sturgeon', name: 'Sturgeon', quantity: 1 },
        ],
      },
      {
        id: 'ocean-fish',
        name: 'Ocean Fish Bundle',
        slotsRequired: 4,
        reward: 'Warp Totem: Beach (5)',
        items: [
          { id: 'sardine', name: 'Sardine', quantity: 1 },
          { id: 'tuna', name: 'Tuna', quantity: 1 },
          { id: 'red-snapper', name: 'Red Snapper', quantity: 1 },
          { id: 'tilapia', name: 'Tilapia', quantity: 1 },
        ],
      },
      {
        id: 'night-fishing',
        name: 'Night Fishing Bundle',
        slotsRequired: 3,
        reward: 'Glow Ring (1)',
        items: [
          { id: 'walleye', name: 'Walleye', quantity: 1 },
          { id: 'bream', name: 'Bream', quantity: 1 },
          { id: 'eel', name: 'Eel', quantity: 1 },
        ],
      },
    ],
  },
  {
    id: 'crafts-room',
    name: 'Crafts Room',
    reward: 'Bridge Repair (Quarry Access)',
    bundles: [
      {
        id: 'spring-foraging',
        name: 'Spring Foraging Bundle',
        slotsRequired: 4,
        reward: 'Spring Seeds (30)',
        items: [
          { id: 'wild-horseradish', name: 'Wild Horseradish', quantity: 1 },
          { id: 'daffodil', name: 'Daffodil', quantity: 1 },
          { id: 'leek', name: 'Leek', quantity: 1 },
          { id: 'dandelion', name: 'Dandelion', quantity: 1 },
        ],
      },
      {
        id: 'summer-foraging',
        name: 'Summer Foraging Bundle',
        slotsRequired: 3,
        reward: 'Summer Seeds (30)',
        items: [
          { id: 'spice-berry', name: 'Spice Berry', quantity: 1 },
          { id: 'grape', name: 'Grape', quantity: 1 },
          { id: 'sweet-pea', name: 'Sweet Pea', quantity: 1 },
        ],
      },
      {
        id: 'fall-foraging',
        name: 'Fall Foraging Bundle',
        slotsRequired: 4,
        reward: 'Fall Seeds (30)',
        items: [
          { id: 'common-mushroom', name: 'Common Mushroom', quantity: 1 },
          { id: 'wild-plum', name: 'Wild Plum', quantity: 1 },
          { id: 'hazelnut', name: 'Hazelnut', quantity: 1 },
          { id: 'blackberry', name: 'Blackberry', quantity: 1 },
        ],
      },
      {
        id: 'winter-foraging',
        name: 'Winter Foraging Bundle',
        slotsRequired: 4,
        reward: 'Winter Seeds (30)',
        items: [
          { id: 'winter-root', name: 'Winter Root', quantity: 1 },
          { id: 'crystal-fruit', name: 'Crystal Fruit', quantity: 1 },
          { id: 'snow-yam', name: 'Snow Yam', quantity: 1 },
          { id: 'crocus', name: 'Crocus', quantity: 1 },
        ],
      },
    ],
  },
  {
    id: 'boiler-room',
    name: 'Boiler Room',
    reward: 'Minecarts Repaired (Fast Travel)',
    bundles: [
      {
        id: 'blacksmiths-bundle',
        name: 'Blacksmith\'s Bundle',
        slotsRequired: 3,
        reward: 'Furnace (1)',
        items: [
          { id: 'copper-bar', name: 'Copper Bar', quantity: 1 },
          { id: 'iron-bar', name: 'Iron Bar', quantity: 1 },
          { id: 'gold-bar', name: 'Gold Bar', quantity: 1 },
        ],
      },
      {
        id: 'geologists-bundle',
        name: 'Geologist\'s Bundle',
        slotsRequired: 4,
        reward: 'Omni Geode (5)',
        items: [
          { id: 'quartz', name: 'Quartz', quantity: 1 },
          { id: 'earth-crystal', name: 'Earth Crystal', quantity: 1 },
          { id: 'frozen-tear', name: 'Frozen Tear', quantity: 1 },
          { id: 'fire-quartz', name: 'Fire Quartz', quantity: 1 },
        ],
      },
    ],
  },
]
