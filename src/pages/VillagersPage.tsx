import { useState, useMemo } from 'react'
import { Search, Heart, User, Gift, Home } from 'lucide-react'
import { VILLAGERS_DATA } from '@/data/villagers'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SeasonBadge } from '@/components/common/SeasonBadge'

export function VillagersPage() {
  const [search, setSearch] = useState('')
  const [filterMarriage, setFilterMarriage] = useState<boolean | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<string>('all')

  const filteredVillagers = useMemo(() => {
    return VILLAGERS_DATA.filter((villager) => {
      const matchesSearch =
        villager.name.toLowerCase().includes(search.toLowerCase()) ||
        villager.lovedGifts.some((g) => g.toLowerCase().includes(search.toLowerCase())) ||
        villager.address.toLowerCase().includes(search.toLowerCase())

      const matchesMarriage =
        filterMarriage === null || villager.isMarriageable === filterMarriage

      const matchesSeason =
        selectedSeason === 'all' || villager.birthday?.season === selectedSeason

      return matchesSearch && matchesMarriage && matchesSeason
    })
  }, [search, filterMarriage, selectedSeason])

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--mu)] mb-2">
          <span>Encyclopedia</span>
          <span>•</span>
          <span className="text-[var(--tx)] font-semibold">Villagers & Gifts</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--tx)] flex items-center gap-3">
          <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
          <span>Pelican Town Villagers & Gift Guide</span>
        </h1>
        <p className="text-[var(--mu)] text-sm sm:text-base mt-2 max-w-2xl">
          Discover loved gifts, birthdays, marriage candidates, and home addresses for all residents of Stardew Valley.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-[12px] p-4 mb-8 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mu)]" />
            <Input
              type="text"
              placeholder="Search by villager name, address, or favorite gift (e.g. Amethyst)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-[var(--bg)] border-[var(--line)]"
            />
          </div>

          {/* Marriage Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--mu)]">Romance:</span>
            <Button
              variant={filterMarriage === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMarriage(null)}
              className="h-10 text-xs px-3 font-bold"
            >
              All Residents
            </Button>
            <Button
              variant={filterMarriage === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMarriage(true)}
              className="h-10 text-xs px-3 font-bold gap-1.5"
            >
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              Bachelors & Bachelorettes
            </Button>
          </div>
        </div>

        {/* Birthday Season Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--line)]/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--mu)]">Birthday Season:</span>
            {['all', 'spring', 'summer', 'fall', 'winter'].map((season) => (
              <Button
                key={season}
                variant={selectedSeason === season ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedSeason(season)}
                className="h-8 text-xs px-2.5 capitalize"
              >
                {season === 'all' ? 'All Seasons' : season}
              </Button>
            ))}
          </div>
          <div className="text-[var(--mu)] font-mono ml-auto">
            Showing {filteredVillagers.length} residents
          </div>
        </div>
      </div>

      {/* Villagers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVillagers.map((villager) => (
          <Card
            key={villager.id}
            className="border-2 border-[var(--line)] bg-[var(--card)] hover:border-[var(--po)] transition-all shadow-xs flex flex-col justify-between"
          >
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[var(--sp2)] border border-[var(--line)] flex items-center justify-center font-display font-bold text-lg text-[var(--tx)]">
                      {villager.name.slice(0, 1)}
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-xl text-[var(--tx)]">
                        {villager.name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--mu)] mt-0.5">
                        <Home className="h-3 w-3" />
                        <span className="truncate">{villager.address}</span>
                      </div>
                    </div>
                  </div>

                  {villager.isMarriageable ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      <Heart className="h-2.5 w-2.5 fill-current" />
                      Romanceable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--sp2)] text-[var(--mu)]">
                      <User className="h-2.5 w-2.5" />
                      Townsperson
                    </span>
                  )}
                </div>

                {/* Bio text */}
                <p className="text-xs text-[var(--mu)] leading-relaxed mt-2 line-clamp-2">
                  {villager.bio}
                </p>

                {/* Birthday pill */}
                {villager.birthday ? (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--mu)]">Birthday:</span>
                    <div className="inline-flex items-center gap-1.5">
                      <SeasonBadge season={villager.birthday.season} size="sm" />
                      <span className="text-xs font-mono font-bold text-[var(--tx)] bg-[var(--sp2)] px-1.5 py-0.5 rounded">
                        Day {villager.birthday.day}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--mu)]">
                    <span className="font-bold">Status:</span> Special Character (No Birthday)
                  </div>
                )}

                {/* Loved Gifts List */}
                <div className="mt-4 pt-3 border-t border-[var(--line)]/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--tx)] mb-2">
                    <Gift className="h-3.5 w-3.5 text-amber-500" />
                    <span>Loved Gifts:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {villager.lovedGifts.map((gift) => (
                      <span
                        key={gift}
                        className="text-[11px] font-medium bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 rounded text-[var(--tx)]"
                      >
                        {gift}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Best Gift Tip */}
              {villager.bestGiftTip && (
                <div className="mt-2 text-[11px] text-[var(--mu)] bg-[var(--sp2)]/70 p-2.5 rounded-[6px] border-l-2 border-[var(--pr)]">
                  <strong className="text-[var(--tx)]">Quick Tip:</strong> {villager.bestGiftTip}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
