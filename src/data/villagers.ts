export interface VillagerData {
  id: string
  name: string
  birthday: {
    season: 'spring' | 'summer' | 'fall' | 'winter'
    day: number
  }
  isMarriageable: boolean
  gender: 'female' | 'male' | 'other'
  address: string
  lovedGifts: string[]
  bio: string
  bestGiftTip?: string
}

export const VILLAGERS_DATA: VillagerData[] = [
  // --- Bachelorettes ---
  {
    id: 'abigail',
    name: 'Abigail',
    birthday: { season: 'fall', day: 13 },
    isMarriageable: true,
    gender: 'female',
    address: 'Pierre\'s General Store',
    lovedGifts: ['Amethyst', 'Banana Pudding', 'Blackberry Cobbler', 'Chocolate Cake', 'Pufferfish', 'Pumpkin', 'Spicy Eel'],
    bio: 'Abigail lives at the general store with her parents. She plays the flute, plays video games, and explores the graveyard.',
    bestGiftTip: 'Amethyst is easy to mine in the early levels of the Mines and makes an easy loved gift.',
  },
  {
    id: 'haley',
    name: 'Haley',
    birthday: { season: 'spring', day: 14 },
    isMarriageable: true,
    gender: 'female',
    address: '2 Willow Lane',
    lovedGifts: ['Coconut', 'Fruit Salad', 'Pink Cake', 'Sunflower'],
    bio: 'Being wealthy and popular in high school has made Haley a bit conceited. She loves photography and fashion.',
    bestGiftTip: 'Grow Sunflowers in Summer or Fall, or pick up Coconuts once the Calico Desert is unlocked.',
  },
  {
    id: 'leah',
    name: 'Leah',
    birthday: { season: 'winter', day: 23 },
    isMarriageable: true,
    gender: 'female',
    address: 'Cottage in Cindersap Forest',
    lovedGifts: ['Goat Cheese', 'Poppyseed Muffin', 'Salad', 'Stir Fry', 'Truffle', 'Vegetable Medley', 'Wine'],
    bio: 'Leah lives alone in a small cottage just outside Pelican Town. She loves spending time outdoors sculpting and foraging.',
    bestGiftTip: 'You can buy Salads directly from Gus at the Stardrop Saloon for 220g for an instant loved gift.',
  },
  {
    id: 'maru',
    name: 'Maru',
    birthday: { season: 'summer', day: 10 },
    isMarriageable: true,
    gender: 'female',
    address: '24 Mountain Road (Carpenter\'s Shop)',
    lovedGifts: ['Battery Pack', 'Cauliflower', 'Cheese Cauliflower', 'Diamond', 'Gold Bar', 'Iridium Bar', 'Miner\'s Treat', 'Pepper Poppers', 'Radioactive Bar', 'Rhubarb Pie', 'Strawberry'],
    bio: 'Growing up with a carpenter for a mother and a scientist for a father, Maru acquired a passion for creating gadgets.',
    bestGiftTip: 'Strawberries from the Spring Egg Festival are loved and easy to stockpile.',
  },
  {
    id: 'penny',
    name: 'Penny',
    birthday: { season: 'fall', day: 2 },
    isMarriageable: true,
    gender: 'female',
    address: 'Trailer (east of town)',
    lovedGifts: ['Diamond', 'Emerald', 'Melon', 'Poppy', 'Poppyseed Muffin', 'Red Plate', 'Roots Platter', 'Sandfish', 'Tom Kha Soup'],
    bio: 'Penny lives with her mother Pam in a small trailer. She spends her days tutoring Jas and Vincent at the museum.',
    bestGiftTip: 'Grow Melons in Summer or Poppies to easily win her heart.',
  },
  {
    id: 'emily',
    name: 'Emily',
    birthday: { season: 'spring', day: 27 },
    isMarriageable: true,
    gender: 'female',
    address: '2 Willow Lane',
    lovedGifts: ['Amethyst', 'Aquamarine', 'Cloth', 'Emerald', 'Jade', 'Ruby', 'Survival Burger', 'Topaz', 'Wool'],
    bio: 'Emily works nights at Gus\'s saloon. She loves tailoring her own colorful clothes and believes in spiritual crystals.',
    bestGiftTip: 'Any standard gemstone (Ruby, Emerald, Jade, Topaz, Amethyst) from the mines is a loved gift.',
  },

  // --- Bachelors ---
  {
    id: 'sebastian',
    name: 'Sebastian',
    birthday: { season: 'winter', day: 10 },
    isMarriageable: true,
    gender: 'male',
    address: '24 Mountain Road (Basement)',
    lovedGifts: ['Frozen Tear', 'Obsidian', 'Pumpkin Soup', 'Sashimi', 'Void Egg'],
    bio: 'A rebellious loner living in his parents\' basement. He works as a freelance programmer and loves tabletop RPGs.',
    bestGiftTip: 'Frozen Tears found frequently on Mine floors 40-79 are easily his most accessible loved gift.',
  },
  {
    id: 'shane',
    name: 'Shane',
    birthday: { season: 'spring', day: 20 },
    isMarriageable: true,
    gender: 'male',
    address: 'Marnie\'s Ranch',
    lovedGifts: ['Beer', 'Hot Pepper', 'Pepper Poppers', 'Pizza'],
    bio: 'Shane rents a room from his aunt Marnie and works stocking shelves at JojaMart. He cares deeply for blue chickens.',
    bestGiftTip: 'Buy him a Beer or Pizza at the Saloon on any evening, or grow Hot Peppers in Summer.',
  },
  {
    id: 'sam',
    name: 'Sam',
    birthday: { season: 'summer', day: 17 },
    isMarriageable: true,
    gender: 'male',
    address: '1 Willow Lane',
    lovedGifts: ['Cactus Fruit', 'Maple Bar', 'Pizza', 'Tigerseye'],
    bio: 'An outgoing, friendly young man who plays guitar and skateboards. He is in a band with Sebastian and Abigail.',
    bestGiftTip: 'Buy Pizzas at the Saloon or forage Cactus Fruit in the Calico Desert.',
  },
  {
    id: 'alex',
    name: 'Alex',
    birthday: { season: 'summer', day: 13 },
    isMarriageable: true,
    gender: 'male',
    address: '1 River Road',
    lovedGifts: ['Complete Breakfast', 'Salmon Dinner'],
    bio: 'Alex is passionate about gridball and works out at the beach during sunny days. He lives with his grandparents.',
    bestGiftTip: 'Both of his loved gifts require cooking recipes, but he likes all Eggs (except Void Eggs).',
  },
  {
    id: 'elliott',
    name: 'Elliott',
    birthday: { season: 'fall', day: 5 },
    isMarriageable: true,
    gender: 'male',
    address: 'Cabin on the Beach',
    lovedGifts: ['Crab Cakes', 'Duck Feather', 'Lobster', 'Pomegranate', 'Squid Ink', 'Tom Kha Soup'],
    bio: 'Elliott is an eccentric novelist living in a cozy beach shack. He speaks poetically and appreciates fine art.',
    bestGiftTip: 'Duck Feathers from your Coop or Pomegranates from Fall fruit trees are great gifts.',
  },
  {
    id: 'harvey',
    name: 'Harvey',
    birthday: { season: 'winter', day: 14 },
    isMarriageable: true,
    gender: 'male',
    address: 'Medical Clinic',
    lovedGifts: ['Coffee', 'Pickles', 'Super Meal', 'Truffle Oil', 'Wine'],
    bio: 'The town doctor. He spends his free time building model airplanes and listening to shortwave radio.',
    bestGiftTip: 'Buy Coffee at the Saloon for 300g or make Pickles in a Preserves Jar for an easy loved gift.',
  },

  // --- Townspeople ---
  {
    id: 'linus',
    name: 'Linus',
    birthday: { season: 'winter', day: 3 },
    isMarriageable: false,
    gender: 'male',
    address: 'Tent in the Mountains',
    lovedGifts: ['Blueberry Tart', 'Cactus Fruit', 'Coconut', 'Dish O\' The Sea', 'Yam'],
    bio: 'A kind-hearted forager living in harmony with nature in a tent near the Mountain lake.',
    bestGiftTip: 'He likes almost all wild forage items you pick up from the ground!',
  },
  {
    id: 'robin',
    name: 'Robin',
    birthday: { season: 'fall', day: 21 },
    isMarriageable: false,
    gender: 'female',
    address: 'Carpenter\'s Shop',
    lovedGifts: ['Goat Cheese', 'Peach', 'Spaghetti'],
    bio: 'The local carpenter who builds and upgrades your farm buildings. Married to Demetrius.',
    bestGiftTip: 'Buy Spaghetti at the Stardrop Saloon for 240g for a quick loved gift.',
  },
  {
    id: 'willy',
    name: 'Willy',
    birthday: { season: 'summer', day: 24 },
    isMarriageable: false,
    gender: 'male',
    address: 'Fish Shop on the Docks',
    lovedGifts: ['Catfish', 'Diamond', 'Iridium Bar', 'Mead', 'Octopus', 'Pumpkin', 'Sea Cucumber', 'Sturgeon'],
    bio: 'An expert fisherman who runs the Bait and Tackle shop on the beach and gives you your first fishing rod.',
    bestGiftTip: 'Catfish and Sturgeon are loved gifts that can be caught locally.',
  },
  {
    id: 'krobus',
    name: 'Krobus',
    birthday: { season: 'winter', day: 1 },
    isMarriageable: false,
    gender: 'other',
    address: 'The Sewers',
    lovedGifts: ['Diamond', 'Iridium Bar', 'Monster Essence', 'Pumpkin', 'Void Egg', 'Void Mayonnaise', 'Wild Horseradish'],
    bio: 'A friendly shadow person living in the sewers. Can move into your farm as your roommate!',
    bestGiftTip: 'Wild Horseradish in Spring or Void Eggs from Void Chickens are easy loved gifts.',
  },
]

export function getVillagerById(id: string): VillagerData | undefined {
  return VILLAGERS_DATA.find((v) => v.id === id.toLowerCase())
}
