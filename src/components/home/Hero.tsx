import { Search } from 'lucide-react'
import { SEASONS, type Season } from '@/utils/constants'
import { useSeason } from '@/context/SeasonContext'
import { useSearch } from '@/context/SearchContext'

export function Hero() {
  const { activeSeason, toggleSeason } = useSeason()
  const { openSearch, setSearchQuery } = useSearch()

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    openSearch()
  }

  return (
    <section className="pt-10 sm:pt-14 pb-6 text-center max-w-3xl mx-auto">
      {/* Hero Title */}
      <h1 className="font-display font-bold text-[clamp(34px,5vw,52px)] leading-[1.1] tracking-tight text-[var(--tx)]">
        Everything For Your Farm, <br className="hidden sm:inline" />
        In One Place
      </h1>

      {/* Hero Subtitle */}
      <p className="mt-4 text-base sm:text-lg text-[var(--mu)] leading-relaxed max-w-xl mx-auto">
        Fast, searchable guides for crops, fish, villagers, bundles, and calculators tailored for Stardew Valley 1.6.
      </p>

      {/* Hero Search Box */}
      <div className="mt-8 max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-[var(--mu)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search crops, fish, villagers, bundles..."
            onClick={openSearch}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[48px] pl-12 pr-4 rounded-[8px] border-2 border-[var(--ib)] bg-[var(--card)] font-sans text-base font-semibold text-[var(--tx)] placeholder:text-[var(--mu)] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--po)] focus:ring-offset-2 cursor-pointer"
          />
          <button
            type="submit"
            className="absolute right-2 px-3 py-1.5 rounded-[6px] bg-[var(--pr)] text-white text-xs font-bold hover:opacity-90"
          >
            Find
          </button>
        </form>
      </div>

      {/* Seasonal Filter Chips */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--mu)]">
          Explore By Season
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {SEASONS.map((season) => {
            const isSelected = activeSeason === season.id
            return (
              <button
                key={season.id}
                type="button"
                onClick={() => toggleSeason(season.id as Season)}
                style={{
                  backgroundColor: isSelected ? season.color : undefined,
                  color: isSelected ? season.textColor : undefined,
                  borderColor: isSelected ? season.color : undefined,
                }}
                className={`min-h-[44px] px-5 rounded-full font-sans font-extrabold text-sm transition-all flex items-center gap-2 border-2 ${
                  isSelected
                    ? 'shadow-md scale-105 ring-2 ring-[var(--po)] ring-offset-2'
                    : 'bg-[var(--card)] border-[var(--line)] text-[var(--tx)] hover:border-[var(--po)] hover:scale-[1.02]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isSelected ? season.textColor : season.color }}
                />
                {season.name}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
