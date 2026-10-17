/**
 * Sprite asset path lookup table.
 * All image assets are stored in the public/sprites directory to keep them
 * strictly separated from React application code.
 */
export const SPRITE_MAP: Record<string, string> = {
  // Crops
  parsnip: '/sprites/crops/parsnip.svg',
  cauliflower: '/sprites/crops/cauliflower.svg',
  strawberry: '/sprites/crops/strawberry.svg',
  blueberry: '/sprites/crops/blueberry.svg',
  melon: '/sprites/crops/melon.svg',
  starfruit: '/sprites/crops/starfruit.svg',
  pumpkin: '/sprites/crops/pumpkin.svg',
  cranberries: '/sprites/crops/cranberries.svg',
  grape: '/sprites/crops/grape.svg',

  // Fish
  catfish: '/sprites/fish/catfish.svg',
  sturgeon: '/sprites/fish/sturgeon.svg',
  walleye: '/sprites/fish/walleye.svg',
  squid: '/sprites/fish/squid.svg',
  glacierfish: '/sprites/fish/glacierfish.svg',

  // Forage
  crocus: '/sprites/forage/crocus.svg',
  'crystal-fruit': '/sprites/forage/crystal-fruit.svg',
}

/**
 * Returns the public sprite URL for a given item ID, or undefined if no asset exists.
 */
export function getSpriteUrl(id: string): string | undefined {
  return SPRITE_MAP[id.toLowerCase()]
}
