export const GAME_VERSION = '1.6.x'
export const APP_NAME = 'Stardewpedia'
export const APP_TAGLINE = 'Everything For Your Farm, In One Place'
export const APP_DISCLAIMER = 'Unofficial fan site, not affiliated with or endorsed by ConcernedApe.'

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

export interface SeasonInfo {
  id: Season
  name: string
  color: string
  textColor: string
}

export const SEASONS: SeasonInfo[] = [
  { id: 'spring', name: 'Spring', color: '#3F7A32', textColor: '#FFFFFF' },
  { id: 'summer', name: 'Summer', color: '#F2C94C', textColor: '#17323A' },
  { id: 'fall', name: 'Fall', color: '#B5541C', textColor: '#FFFFFF' },
  { id: 'winter', name: 'Winter', color: '#4A5FA8', textColor: '#FFFFFF' },
]

export const NAV_ITEMS = [
  { label: 'Crops', path: '/crops' },
  { label: 'Fish', path: '/fish' },
  { label: 'Villagers', path: '/villagers' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Festivals', path: '/festivals' },
  { label: 'Quests', path: '/quests' },
  { label: 'Achievements', path: '/achievements' },
  { label: 'Tools', path: '/tools' },
] as const

export const TOOL_ITEMS = [
  {
    id: 'crop-calculator',
    title: 'Crop Profit Calculator',
    description: 'Best crops for the days you have left.',
    path: '/tools/crop-calculator',
  },
  {
    id: 'gift-finder',
    title: 'Gift Finder',
    description: 'Loved and hated gifts by villager.',
    path: '/tools/gift-finder',
  },
  {
    id: 'bundle-tracker',
    title: 'Bundle Tracker',
    description: 'Check off items, keep your progress.',
    path: '/tools/bundle-tracker',
  },
] as const

export const BROWSE_SECTIONS = [
  {
    title: 'Achievements',
    description: 'Every in-game achievement and how to earn it.',
    path: '/achievements',
  },
  {
    title: 'Festivals',
    description: 'Dates, shops and event guides for each season.',
    path: '/festivals',
  },
  {
    title: 'Monster Eradication Goals',
    description: "Adventurer's Guild targets by monster and location.",
    path: '/monster-goals',
  },
  {
    title: 'Quests',
    description: 'Story quests, special orders and help-wanted requests.',
    path: '/quests',
  },
  {
    title: 'Random Events',
    description: 'Night events and other surprises on the farm.',
    path: '/random-events',
  },
] as const
