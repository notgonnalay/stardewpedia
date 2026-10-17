import { Link } from 'react-router-dom'
import { Trophy, Calendar, ShieldAlert, ScrollText, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BROWSE_SECTIONS } from '@/utils/constants'

const BROWSE_ICONS = {
  '/achievements': Trophy,
  '/festivals': Calendar,
  '/monster-goals': ShieldAlert,
  '/quests': ScrollText,
  '/random-events': Sparkles,
}

export function BrowseSection() {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-[26px] sm:text-[30px] text-[var(--tx)]">
            Browse the Guide
          </h2>
          <p className="text-sm text-[var(--mu)] mt-0.5">
            Comprehensive references for Pelican Town and the Valley
          </p>
        </div>
      </div>

      {/* Desktop & Tablet: Card Grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {BROWSE_SECTIONS.map((section) => {
          const Icon = BROWSE_ICONS[section.path as keyof typeof BROWSE_ICONS] || Sparkles

          return (
            <Link
              key={section.path}
              to={section.path}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--po)] rounded-[10px]"
            >
              <Card className="h-full transition-all group-hover:border-[var(--po)] group-hover:shadow-md flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-[8px] bg-[var(--sp2)] border border-[var(--line)] flex items-center justify-center text-[var(--pr)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--mu)] group-hover:text-[var(--lk)] group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-[20px] group-hover:text-[var(--lk)] transition-colors">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Mobile: Outline Chip Buttons (per designplan 7.0) */}
      <div className="flex sm:hidden flex-wrap gap-2">
        {BROWSE_SECTIONS.map((section) => {
          const Icon = BROWSE_ICONS[section.path as keyof typeof BROWSE_ICONS] || Sparkles

          return (
            <Link
              key={section.path}
              to={section.path}
              className="flex items-center gap-2 min-h-[44px] px-3.5 rounded-[8px] border-2 border-[var(--po)] bg-transparent text-[var(--po)] font-sans font-extrabold text-sm active:bg-[var(--po)]/10"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{section.title}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
