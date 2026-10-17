import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Sparkles } from 'lucide-react'
import { useSearch } from '@/context/SearchContext'
import { NAV_ITEMS, TOOL_ITEMS, BROWSE_SECTIONS } from '@/utils/constants'

// Sample searchable items
const SEARCHABLE_ENTITIES = [
  { name: 'Parsnip', category: 'Crops', season: 'Spring', path: '/crops/parsnip' },
  { name: 'Cauliflower', category: 'Crops', season: 'Spring', path: '/crops/cauliflower' },
  { name: 'Potato', category: 'Crops', season: 'Spring', path: '/crops/potato' },
  { name: 'Blueberry', category: 'Crops', season: 'Summer', path: '/crops/blueberry' },
  { name: 'Pumpkin', category: 'Crops', season: 'Fall', path: '/crops/pumpkin' },
  { name: 'Ancient Fruit', category: 'Crops', season: 'All', path: '/crops/ancient-fruit' },
  { name: 'Catfish', category: 'Fish', season: 'Spring/Fall', path: '/fish/catfish' },
  { name: 'Sturgeon', category: 'Fish', season: 'Summer/Winter', path: '/fish/sturgeon' },
  { name: 'Legend', category: 'Fish', season: 'Spring', path: '/fish/legend' },
  { name: 'Abigail', category: 'Villagers', season: 'Birthday: Fall 13', path: '/villagers/abigail' },
  { name: 'Sebastian', category: 'Villagers', season: 'Birthday: Winter 10', path: '/villagers/sebastian' },
  { name: 'Robin', category: 'Villagers', season: 'Birthday: Fall 21', path: '/villagers/robin' },
]

export function SearchDialog() {
  const { isOpen, closeSearch, searchQuery, setSearchQuery } = useSearch()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()

    const entities = SEARCHABLE_ENTITIES.filter(
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
  }, [searchQuery, selectedCategory])

  if (!isOpen) return null

  const handleSelect = (path: string) => {
    closeSearch()
    navigate(path)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeSearch}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[10px] border-2 border-[var(--line)] bg-[var(--card)] shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b-2 border-[var(--line)] px-4 py-3 bg-[var(--card)]">
          <Search className="h-5 w-5 text-[var(--mu)] shrink-0" />
          <input
            type="text"
            placeholder="Search crops, fish, villagers, tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-base font-semibold text-[var(--tx)] placeholder:text-[var(--mu)] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded text-[var(--mu)] hover:text-[var(--tx)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex text-xs font-mono font-bold px-2 py-1 rounded bg-[var(--sp2)] text-[var(--mu)]">
            ESC
          </span>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--line)] bg-[var(--bg)]/50 overflow-x-auto text-xs font-bold">
          {['all', 'crops', 'fish', 'villagers', 'tools', 'browse'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[var(--pr)] text-white'
                  : 'bg-[var(--card)] text-[var(--mu)] border border-[var(--line)] hover:text-[var(--tx)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {searchQuery.trim() === '' ? (
            <div className="p-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--mu)]">
                Popular Quick Links
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {NAV_ITEMS.slice(0, 4).map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--po)] transition-colors text-left"
                  >
                    <span className="font-bold text-sm text-[var(--tx)]">
                      {item.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--mu)]" />
                  </button>
                ))}
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((item, idx) => (
              <button
                key={`${item.name}-${idx}`}
                onClick={() => handleSelect(item.path)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--sp2)] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--pr)]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-base text-[var(--tx)] group-hover:text-[var(--lk)]">
                      {item.name}
                    </div>
                    <div className="text-xs text-[var(--mu)]">
                      {item.category} • {item.season}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--mu)] group-hover:text-[var(--lk)] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-[var(--mu)]">
              <p className="font-display text-lg">No results found for "{searchQuery}"</p>
              <p className="text-sm mt-1">Try searching for crops, fish, or calculators.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
