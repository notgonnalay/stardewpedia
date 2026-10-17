import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Search, Moon, Sun, Menu, X, ChevronDown } from 'lucide-react'
import { Logo } from '@/assets/brand/Logo'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { useSearch } from '@/context/SearchContext'
import { NAV_ITEMS, BROWSE_SECTIONS } from '@/utils/constants'

// Core primary items shown directly on the desktop navbar
const PRIMARY_NAV = [
  { label: 'Crops', path: '/crops' },
  { label: 'Fish', path: '/fish' },
  { label: 'Villagers', path: '/villagers' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Tools', path: '/tools' },
]

// Secondary items accessible via the "More" dropdown
const MORE_NAV = [
  { label: 'Festivals', path: '/festivals', desc: 'Seasonal dates & events' },
  { label: 'Quests', path: '/quests', desc: 'Story & help-wanted orders' },
  { label: 'Achievements', path: '/achievements', desc: 'In-game milestones' },
  { label: 'Monster Goals', path: '/monster-goals', desc: "Adventurer's guild targets" },
  { label: 'Random Events', path: '/random-events', desc: 'Night visits & rare occurrences' },
]

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { openSearch } = useSearch()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-[var(--line)] bg-[var(--card)] transition-colors shadow-xs">
        <div className="mx-auto flex h-[72px] max-w-[1100px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo (with guaranteed spacing) */}
          <div className="flex items-center shrink-0 mr-4 lg:mr-6">
            {/* Desktop Logo */}
            <div className="hidden sm:block">
              <Logo isMobile={false} />
            </div>
            {/* Mobile Logo */}
            <div className="sm:hidden">
              <Logo isMobile={true} />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1 xl:gap-3 flex-1 justify-center max-w-2xl px-2"
          >
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-[8px] font-sans font-extrabold text-sm xl:text-base whitespace-nowrap transition-colors hover:text-[var(--lk)] hover:bg-[var(--sp2)]/40 ${
                    isActive
                      ? 'text-[var(--lk)] underline underline-offset-8 decoration-2 decoration-[var(--po)] font-black'
                      : 'text-[var(--tx)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* "More" Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-[8px] font-sans font-extrabold text-sm xl:text-base whitespace-nowrap transition-colors hover:text-[var(--lk)] hover:bg-[var(--sp2)]/40 ${
                  moreDropdownOpen ? 'text-[var(--lk)] bg-[var(--sp2)]/50' : 'text-[var(--tx)]'
                }`}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
              >
                <span>More</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-150 ${
                    moreDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Panel */}
              {moreDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 rounded-[10px] border-2 border-[var(--line)] bg-[var(--card)] p-2 shadow-xl animate-in fade-in slide-in-from-top-1 z-50">
                  <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--mu)]">
                    Additional Guides
                  </div>
                  <div className="space-y-0.5">
                    {MORE_NAV.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex flex-col px-3 py-2 rounded-[6px] transition-colors ${
                            isActive
                              ? 'bg-[var(--sp2)] text-[var(--lk)] font-bold'
                              : 'text-[var(--tx)] hover:bg-[var(--sp2)]/50'
                          }`
                        }
                      >
                        <span className="font-extrabold text-sm">{subItem.label}</span>
                        <span className="text-xs text-[var(--mu)]">{subItem.desc}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Action Buttons (shrink-0 prevents crushing) */}
          <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
            {/* Search Trigger Button */}
            <Button
              variant="outline"
              size="default"
              onClick={openSearch}
              aria-label="Open search"
              className="hidden sm:inline-flex items-center gap-2 h-[44px] px-3 border-2 border-[var(--ib)] text-[var(--tx)] hover:border-[var(--po)]"
            >
              <Search className="h-4 w-4 text-[var(--mu)]" />
              <span className="hidden xl:inline text-sm font-semibold text-[var(--mu)]">
                Search...
              </span>
              <kbd className="hidden xl:inline-block rounded bg-[var(--sp2)] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[var(--mu)]">
                ⌘K
              </kbd>
            </Button>

            {/* Mobile Search Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={openSearch}
              aria-label="Search"
              className="sm:hidden h-[44px] w-[44px]"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Dark / Light Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="h-[44px] w-[44px]"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-[#F2C94C]" />
              ) : (
                <Moon className="h-5 w-5 text-[var(--po)]" />
              )}
            </Button>

            {/* Mobile Menu Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden h-[44px] w-[44px]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[72px] z-30 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-h-[calc(100dvh-72px-56px)] overflow-y-auto bg-[var(--card)] border-b-2 border-[var(--line)] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--mu)] px-2 mb-2">
              Main Guides
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center h-[44px] px-4 rounded-[8px] font-sans font-extrabold text-base transition-colors ${
                      isActive
                        ? 'bg-[var(--pr)] text-white'
                        : 'text-[var(--tx)] hover:bg-[var(--sp2)]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="text-xs font-bold uppercase tracking-wider text-[var(--mu)] px-2 mt-4 mb-2">
              Explore More
            </div>
            <div className="grid grid-cols-1 gap-1">
              {BROWSE_SECTIONS.map((section) => (
                <NavLink
                  key={section.path}
                  to={section.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-[8px] hover:bg-[var(--sp2)] transition-colors text-left"
                >
                  <span className="font-extrabold text-sm text-[var(--tx)]">
                    {section.title}
                  </span>
                  <span className="text-xs text-[var(--mu)]">View</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
