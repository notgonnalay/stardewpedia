import { useState, useMemo } from 'react'
import { Search, Sprout, ArrowUpDown, Filter } from 'lucide-react'
import { CROPS_DATA } from '@/data/crops'
import { EntityCard } from '@/components/common/EntityCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SeasonBadge, type Season } from '@/components/common/SeasonBadge'

export function CropsPage() {
  const [search, setSearch] = useState('')
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all')
  const [filterRegrow, setFilterRegrow] = useState<boolean | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'growth' | 'price'>('name')

  const seasonsList: Season[] = ['spring', 'summer', 'fall', 'winter']

  const filteredCrops = useMemo(() => {
    return CROPS_DATA.filter((crop) => {
      const matchesSearch =
        crop.name.toLowerCase().includes(search.toLowerCase()) ||
        crop.description.toLowerCase().includes(search.toLowerCase())

      const matchesSeason =
        selectedSeason === 'all' || crop.seasons.includes(selectedSeason)

      const matchesRegrow =
        filterRegrow === null || (filterRegrow ? crop.regrowDays !== null : crop.regrowDays === null)

      return matchesSearch && matchesSeason && matchesRegrow
    }).sort((a, b) => {
      if (sortBy === 'growth') {
        return a.growthDays - b.growthDays
      }
      if (sortBy === 'price') {
        return b.sellPrice.normal - a.sellPrice.normal
      }
      return a.name.localeCompare(b.name)
    })
  }, [search, selectedSeason, filterRegrow, sortBy])

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--mu)] mb-2">
          <span>Encyclopedia</span>
          <span>•</span>
          <span className="text-[var(--tx)] font-semibold">Crops</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--tx)] flex items-center gap-3">
          <Sprout className="h-8 w-8 text-[var(--pr)]" />
          <span>Stardew Valley Crops Directory</span>
        </h1>
        <p className="text-[var(--mu)] text-sm sm:text-base mt-2 max-w-2xl">
          Browse all crops across Spring, Summer, and Fall. Compare growth times, regrow rates, seed prices, and harvest profits.
        </p>
      </div>

      {/* Controls Bar: Search + Filters */}
      <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-[12px] p-4 mb-8 shadow-xs flex flex-col gap-4">
        {/* Search & Season Chips */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mu)]" />
            <Input
              type="text"
              placeholder="Search crops by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-[var(--bg)] border-[var(--line)]"
            />
          </div>

          {/* Season Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <Button
              variant={selectedSeason === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeason('all')}
              className="h-10 px-4 font-bold text-xs"
            >
              All Seasons
            </Button>
            {seasonsList.map((season) => (
              <button
                key={season}
                type="button"
                onClick={() => setSelectedSeason(season)}
                className={`transition-all rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--po)] ${
                  selectedSeason === season ? 'ring-2 ring-[var(--po)] scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <SeasonBadge season={season} size="md" />
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Extra filters & sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--line)]/60 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-[var(--mu)]" />
            <span className="font-bold text-[var(--mu)]">Type:</span>
            <Button
              variant={filterRegrow === null ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterRegrow(null)}
              className="h-8 text-xs px-2.5"
            >
              All
            </Button>
            <Button
              variant={filterRegrow === true ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterRegrow(true)}
              className="h-8 text-xs px-2.5"
            >
              Regrowing Only
            </Button>
            <Button
              variant={filterRegrow === false ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterRegrow(false)}
              className="h-8 text-xs px-2.5"
            >
              Single Harvest
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="h-3.5 w-3.5 text-[var(--mu)]" />
            <span className="font-bold text-[var(--mu)]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 bg-[var(--bg)] border border-[var(--line)] rounded-[6px] px-2 font-medium text-[var(--tx)] focus:outline-none focus:ring-2 focus:ring-[var(--po)]"
            >
              <option value="name">Name (A-Z)</option>
              <option value="growth">Fastest Growth</option>
              <option value="price">Highest Sell Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop) => (
            <EntityCard
              key={crop.id}
              id={crop.id}
              title={crop.name}
              to={`/crops/${crop.id}`}
              subtitle={crop.description}
              category={crop.regrowDays ? 'Regrowing' : 'Single'}
              seasons={crop.seasons}
              stats={[
                { label: 'Growth:', value: `${crop.growthDays}d` },
                { label: 'Sell:', value: `${crop.sellPrice.normal}g`, highlight: true },
              ]}
              badgeText={crop.canBeGiant ? 'Giant Crop' : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--card)] border-2 border-dashed border-[var(--line)] rounded-[12px] p-8">
          <p className="text-[var(--mu)] font-medium text-base">
            No crops found matching "{search}".
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('')
              setSelectedSeason('all')
              setFilterRegrow(null)
            }}
            className="mt-4"
          >
            Reset All Filters
          </Button>
        </div>
      )}
    </main>
  )
}
