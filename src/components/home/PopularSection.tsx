import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ItemSprite } from '@/components/common/ItemSprite'
import { useSeason } from '@/context/SeasonContext'
import type { Season } from '@/utils/constants'

interface EntityItem {
  id: string
  name: string
  category: string
  season: Season | 'all'
  detail: string
  path: string
  stat: string
}

const POPULAR_DATA: Record<Season, EntityItem[]> = {
  spring: [
    {
      id: 'parsnip',
      name: 'Parsnip',
      category: 'Crop',
      season: 'spring',
      detail: 'Fast growth, Spring bundle item',
      path: '/crops/parsnip',
      stat: '4 days • 35g',
    },
    {
      id: 'cauliflower',
      name: 'Cauliflower',
      category: 'Crop',
      season: 'spring',
      detail: 'High yield, can grow giant',
      path: '/crops/cauliflower',
      stat: '12 days • 175g',
    },
    {
      id: 'strawberry',
      name: 'Strawberry',
      category: 'Crop',
      season: 'spring',
      detail: 'Bought at Egg Festival, regrows',
      path: '/crops/strawberry',
      stat: '8 days + 4d regrow • 120g',
    },
    {
      id: 'catfish',
      name: 'Catfish',
      category: 'Fish',
      season: 'spring',
      detail: 'Found in river on rainy days',
      path: '/fish/catfish',
      stat: 'Rainy • River • 200g',
    },
  ],
  summer: [
    {
      id: 'blueberry',
      name: 'Blueberry',
      category: 'Crop',
      season: 'summer',
      detail: 'Produces 3 berries per harvest',
      path: '/crops/blueberry',
      stat: '13 days + 4d regrow • 50g',
    },
    {
      id: 'melon',
      name: 'Melon',
      category: 'Crop',
      season: 'summer',
      detail: 'Summer bundle crop, can grow giant',
      path: '/crops/melon',
      stat: '12 days • 250g',
    },
    {
      id: 'starfruit',
      name: 'Starfruit',
      category: 'Crop',
      season: 'summer',
      detail: 'Highest base sell price in Summer',
      path: '/crops/starfruit',
      stat: '13 days • 750g',
    },
    {
      id: 'sturgeon',
      name: 'Sturgeon',
      category: 'Fish',
      season: 'summer',
      detail: 'Mountain lake fish, roe makes Caviar',
      path: '/fish/sturgeon',
      stat: 'Mountain Lake • 200g',
    },
  ],
  fall: [
    {
      id: 'pumpkin',
      name: 'Pumpkin',
      category: 'Crop',
      season: 'fall',
      detail: 'Fall bundle crop, can grow giant',
      path: '/crops/pumpkin',
      stat: '13 days • 320g',
    },
    {
      id: 'cranberries',
      name: 'Cranberries',
      category: 'Crop',
      season: 'fall',
      detail: 'Multiple berries, multiple harvests',
      path: '/crops/cranberries',
      stat: '7 days + 5d regrow • 75g',
    },
    {
      id: 'grape',
      name: 'Grape',
      category: 'Crop',
      season: 'fall',
      detail: 'Trellis crop with fast regrow',
      path: '/crops/grape',
      stat: '10 days + 3d regrow • 80g',
    },
    {
      id: 'walleye',
      name: 'Walleye',
      category: 'Fish',
      season: 'fall',
      detail: 'Night fishing bundle, rainy river/lake',
      path: '/fish/walleye',
      stat: 'Rainy Night • 105g',
    },
  ],
  winter: [
    {
      id: 'crocus',
      name: 'Crocus',
      category: 'Forage',
      season: 'winter',
      detail: 'Winter forage, used in Winter bundle',
      path: '/forage/crocus',
      stat: 'Forage • 60g',
    },
    {
      id: 'crystal-fruit',
      name: 'Crystal Fruit',
      category: 'Forage',
      season: 'winter',
      detail: 'Sweet winter fruit, great for wine',
      path: '/forage/crystal-fruit',
      stat: 'Forage • 150g',
    },
    {
      id: 'squid',
      name: 'Squid',
      category: 'Fish',
      season: 'winter',
      detail: 'Ocean fish caught at night (6pm-2am)',
      path: '/fish/squid',
      stat: 'Ocean 6pm-2am • 80g',
    },
    {
      id: 'glacierfish',
      name: 'Glacierfish',
      category: 'Fish',
      season: 'winter',
      detail: 'Legendary fish at south tip of Arrowhead',
      path: '/fish/glacierfish',
      stat: 'Legendary • 1000g',
    },
  ],
}

export function PopularSection() {
  const { activeSeason } = useSeason()
  const seasonKey: Season = activeSeason || 'spring'
  const items = POPULAR_DATA[seasonKey]

  const seasonName = seasonKey.charAt(0).toUpperCase() + seasonKey.slice(1)

  return (
    <section className="py-6 pb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-[26px] sm:text-[30px] text-[var(--tx)] flex items-center gap-2">
            <span>Popular in {seasonName}</span>
            <Sparkles className="h-5 w-5 text-[var(--pr)]" />
          </h2>
          <p className="text-sm text-[var(--mu)] mt-0.5">
            Key crops, fish, and forage recommended for this season
          </p>
        </div>

        <Link
          to={`/calendar`}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--lk)] hover:underline"
        >
          <span>View Season Calendar</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--po)] rounded-[10px]"
          >
            <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-[10px] border-2 border-[var(--line)] bg-[var(--card)] transition-all group-hover:border-[var(--po)] group-hover:shadow-md h-full">
              {/* Sprite Image */}
              <ItemSprite size={64} itemId={item.id} label={item.name.slice(0, 3)} alt={item.name} />

              {/* Entity Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-display font-bold text-[20px] text-[var(--tx)] truncate group-hover:text-[var(--lk)] transition-colors">
                    {item.name}
                  </h3>
                  <span className="shrink-0 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--sp2)] text-[var(--mu)]">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-[var(--mu)] truncate mt-0.5">
                  {item.detail}
                </p>
                <div className="mt-2 text-xs font-mono font-bold text-[var(--tx)] bg-[var(--bg)]/70 px-2 py-0.5 rounded inline-block">
                  {item.stat}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
