import { useState, useMemo } from 'react'
import { Search, Fish, CloudRain, Sun, Compass } from 'lucide-react'
import { FISH_DATA } from '@/data/fish'
import { EntityCard } from '@/components/common/EntityCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SeasonBadge, type Season } from '@/components/common/SeasonBadge'

export function FishPage() {
  const [search, setSearch] = useState('')
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all')
  const [selectedWeather, setSelectedWeather] = useState<'all' | 'sunny' | 'rain'>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')

  const seasonsList: Season[] = ['spring', 'summer', 'fall', 'winter']

  const filteredFish = useMemo(() => {
    return FISH_DATA.filter((fish) => {
      const matchesSearch =
        fish.name.toLowerCase().includes(search.toLowerCase()) ||
        fish.description.toLowerCase().includes(search.toLowerCase()) ||
        fish.locations.some((loc) => loc.toLowerCase().includes(search.toLowerCase()))

      const matchesSeason =
        selectedSeason === 'all' || fish.seasons.includes(selectedSeason)

      const matchesWeather =
        selectedWeather === 'all' ||
        fish.weather === 'any' ||
        fish.weather === selectedWeather

      const matchesLocation =
        selectedLocation === 'all' ||
        fish.locations.some((loc) => loc.toLowerCase().includes(selectedLocation.toLowerCase()))

      return matchesSearch && matchesSeason && matchesWeather && matchesLocation
    })
  }, [search, selectedSeason, selectedWeather, selectedLocation])

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--mu)] mb-2">
          <span>Encyclopedia</span>
          <span>•</span>
          <span className="text-[var(--tx)] font-semibold">Fish</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--tx)] flex items-center gap-3">
          <Fish className="h-8 w-8 text-[var(--pr)]" />
          <span>Stardew Valley Fish Guide</span>
        </h1>
        <p className="text-[var(--mu)] text-sm sm:text-base mt-2 max-w-2xl">
          Find catch locations, active times, weather requirements, seasonal habits, and difficulty ratings for every fish in Pelican Town.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-[12px] p-4 mb-8 shadow-xs flex flex-col gap-4">
        {/* Search & Season Chips */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mu)]" />
            <Input
              type="text"
              placeholder="Search fish by name, location, or bundle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-[var(--bg)] border-[var(--line)]"
            />
          </div>

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

        {/* Weather & Location Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--line)]/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--mu)]">Weather:</span>
            <Button
              variant={selectedWeather === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedWeather('all')}
              className="h-8 text-xs px-2.5"
            >
              Any Weather
            </Button>
            <Button
              variant={selectedWeather === 'sunny' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedWeather('sunny')}
              className="h-8 text-xs px-2.5 gap-1.5"
            >
              <Sun className="h-3 w-3 text-amber-500" />
              Sunny
            </Button>
            <Button
              variant={selectedWeather === 'rain' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedWeather('rain')}
              className="h-8 text-xs px-2.5 gap-1.5"
            >
              <CloudRain className="h-3 w-3 text-blue-500" />
              Rainy Only
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Compass className="h-3.5 w-3.5 text-[var(--mu)]" />
            <span className="font-bold text-[var(--mu)]">Location:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-8 bg-[var(--bg)] border border-[var(--line)] rounded-[6px] px-2 font-medium text-[var(--tx)] focus:outline-none focus:ring-2 focus:ring-[var(--po)]"
            >
              <option value="all">All Waters</option>
              <option value="River">River</option>
              <option value="Lake">Mountain Lake</option>
              <option value="Ocean">Ocean</option>
              <option value="Forest">Forest Pond</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fish Grid */}
      {filteredFish.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFish.map((fish) => (
            <EntityCard
              key={fish.id}
              id={fish.id}
              title={fish.name}
              to={`/fish/${fish.id}`}
              subtitle={fish.description}
              category={fish.isLegendary ? 'Legendary' : fish.behavior}
              seasons={fish.seasons}
              stats={[
                { label: 'Time:', value: fish.time },
                { label: 'Diff:', value: `${fish.difficulty}`, highlight: fish.difficulty >= 75 },
              ]}
              badgeText={fish.isLegendary ? '★ Legendary' : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--card)] border-2 border-dashed border-[var(--line)] rounded-[12px] p-8">
          <p className="text-[var(--mu)] font-medium text-base">
            No fish found matching your criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('')
              setSelectedSeason('all')
              setSelectedWeather('all')
              setSelectedLocation('all')
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </main>
  )
}
