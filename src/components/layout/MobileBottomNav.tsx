import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, CalendarDays, Calculator, Menu } from 'lucide-react'
import { useSearch } from '@/context/SearchContext'
import { cn } from '@/utils/cn'

interface MobileBottomNavProps {
  onMenuClick?: () => void
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const { openSearch } = useSearch()
  const location = useLocation()

  const tabs = [
    { label: 'Home', path: '/', icon: Home, isAction: false },
    { label: 'Search', path: '#search', icon: Search, isAction: true, onClick: openSearch },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays, isAction: false },
    { label: 'Tools', path: '/tools', icon: Calculator, isAction: false },
    { label: 'Menu', path: '/menu', icon: Menu, isAction: false, onClick: onMenuClick },
  ]

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t-2 border-[var(--line)] bg-[var(--card)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-[56px] w-full items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path) && tab.path !== '#search'

          if (tab.isAction) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={tab.onClick}
                className="relative flex flex-col items-center justify-center gap-[2px] text-[var(--mu)] hover:text-[var(--tx)] transition-colors focus:outline-none"
              >
                <Icon className="h-6 w-6 stroke-[2.2]" />
                <span className="font-sans text-[12px] leading-tight font-medium">
                  {tab.label}
                </span>
              </button>
            )
          }

          return (
            <NavLink
              key={tab.label}
              to={tab.path}
              className={({ isActive: linkActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center gap-[2px] transition-colors focus:outline-none',
                  linkActive || isActive
                    ? 'text-[var(--lk)] font-extrabold'
                    : 'text-[var(--mu)] font-medium hover:text-[var(--tx)]'
                )
              }
            >
              {({ isActive: linkActive }) => (
                <>
                  {(linkActive || isActive) && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--po)]"
                    />
                  )}
                  <Icon className="h-6 w-6 stroke-[2.2]" />
                  <span className="font-sans text-[12px] leading-tight">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
