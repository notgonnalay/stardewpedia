import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Sparkles } from 'lucide-react'
import { useSearch } from '@/context/SearchContext'
import { TOOL_ITEMS, BROWSE_SECTIONS } from '@/utils/constants'
import { CROPS_DATA } from '@/data/crops'
import { FISH_DATA } from '@/data/fish'
import { VILLAGERS_DATA } from '@/data/villagers'

export function SearchDialog() {
  const { isOpen, closeSearch, searchQuery, setSearchQuery } = useSearch()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Dynamically map all crops, fish, and villagers
  const allSearchableEntities = useMemo(() => {
    const crops = CROPS_DATA.map((c) => ({
      name: c.name,
      category: 'Crops',
      season: c.seasons.join(', '),
      path: `/crops/${c.id}`,
    }))

    const fish = FISH_DATA.map((f) => ({
      name: f.name,
      category: 'Fish',
      season: f.seasons.join(', '),
      path: `/fish/${f.id}`,
    }))

    const villagers = VILLAGERS_DATA.map((v) => ({
      name: v.name,
      category: 'Villagers',
      season: v.birthday ? `Birthday: ${v.birthday.season} ${v.birthday.day}` : 'Special Character',
      path: `/villagers`,
    }))

    return [...crops, ...fish, ...villagers]
  }, [])

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()

    const entities = allSearchableEntities.filter(
      (e) =>
        (selectedCategory === 'all' || e.category.toLowerCase() === selectedCategory) &&
        (e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.season.toLowerCase().includes(q))
    )

    const tools = TOOL_ITEMS.filter(
      (t) =>
        (selectedCategory === 'all' || selectedCategory === 'tools') &&
        (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    ).map((t) => ({
      name: t.title,
      category: 'Tools',
      season: t.description,
      path: t.path,
    }))

    const browse = BROWSE_SECTIONS.filter(
      (b) =>
        (selectedCategory === 'all' || selectedCategory === 'browse') &&
        (b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q))
    ).map((b) => ({
      name: b.title,
      category: 'Browse',
      season: b.description,
      path: b.path,
    }))

    return [...entities, ...tools, ...browse]
  }, [searchQuery, selectedCategory, allSearchableEntities])

  if (!isOpen) return null

  const handleSelect = (path: string) => {
    closeSearch()
    navigate(path)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeSearch}
    >
      <div
        className="w-full max-w-xl bg-[var(--card)] border-2 border-[var(--line)] rounded-[12px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--line)] gap-3 bg-[var(--bg)]/50">
          <Search className="h-5 w-5 text-[var(--mu)] shrink-0" />
          <input
            type="text"
            placeholder="Search crops, fish, villagers, tools... (Esc to close)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[var(--tx)] placeholder:text-[var(--mu)] focus:outline-none text-base font-medium"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-[var(--sp2)] rounded text-[var(--mu)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-[var(--sp2)] text-[var(--mu)] rounded border border-[var(--line)]">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--line)] bg-[var(--card)] overflow-x-auto text-xs">
          {['all', 'crops', 'fish', 'villagers', 'tools', 'browse'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-[6px] font-bold capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-[var(--pr)] text-white'
                  : 'bg-[var(--sp2)] text-[var(--mu)] hover:text-[var(--tx)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {searchQuery.trim() === '' ? (
            <div className="py-12 text-center text-sm text-[var(--mu)] flex flex-col items-center gap-2">
              <Sparkles className="h-6 w-6 text-[var(--pr)] opacity-60" />
              <p>Type to search across the entire Stardew Valley encyclopedia.</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2 max-w-sm">
                {['Starfruit', 'Catfish', 'Abigail', 'Ancient Fruit', 'Lava Eel', 'Sebastian'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className="text-xs px-2 py-1 bg-[var(--sp2)] hover:bg-[var(--line)] rounded text-[var(--tx)] font-medium transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--mu)]">
              No results found for "<span className="text-[var(--tx)] font-bold">{searchQuery}</span>".
            </div>
          ) : (
            filteredResults.map((item, idx) => (
              <button
                key={`${item.name}-${idx}`}
                type="button"
                onClick={() => handleSelect(item.path)}
                className="w-full flex items-center justify-between p-3 rounded-[8px] hover:bg-[var(--sp2)] transition-colors text-left group focus:outline-none focus:bg-[var(--sp2)]"
              >
                <div>
                  <div className="font-display font-bold text-sm text-[var(--tx)] group-hover:text-[var(--lk)] transition-colors">
                    {item.name}
                  </div>
                  <div className="text-xs text-[var(--mu)] mt-0.5">
                    {item.season}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--mu)]">
                    {item.category}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--mu)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
