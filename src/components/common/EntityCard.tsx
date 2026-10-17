import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { ItemSprite } from '@/components/common/ItemSprite'
import { SeasonBadge, type Season } from '@/components/common/SeasonBadge'
import { cn } from '@/utils/cn'

interface StatPill {
  label?: string
  value: string
  highlight?: boolean
}

interface EntityCardProps {
  id: string
  title: string
  to: string
  category?: string
  seasons?: Season[]
  stats: StatPill[]
  subtitle?: string
  badgeText?: string
  className?: string
}

export function EntityCard({
  id,
  title,
  to,
  category,
  seasons,
  stats,
  subtitle,
  badgeText,
  className,
}: EntityCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group block rounded-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--po)] focus-visible:ring-offset-2',
        className
      )}
    >
      <Card className="h-full border-2 border-[var(--line)] bg-[var(--card)] transition-all duration-200 group-hover:border-[var(--po)] group-hover:shadow-md overflow-hidden flex flex-col justify-between">
        <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
          {/* Top row: Sprite + Header */}
          <div className="flex items-start gap-3.5">
            <ItemSprite
              size={64}
              itemId={id}
              label={title.slice(0, 3)}
              alt={title}
              className="shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="font-display font-bold text-lg sm:text-xl text-[var(--tx)] truncate group-hover:text-[var(--lk)] transition-colors">
                  {title}
                </h3>
                {category && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--sp2)] text-[var(--mu)] shrink-0">
                    {category}
                  </span>
                )}
                {badgeText && (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                    {badgeText}
                  </span>
                )}
              </div>

              {subtitle && (
                <p className="text-xs text-[var(--mu)] line-clamp-2 mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Bottom row: Seasons + Stats */}
          <div className="pt-2 border-t border-[var(--line)]/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Seasonal Badges */}
            {seasons && seasons.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {seasons.map((season) => (
                  <SeasonBadge key={season} season={season} size="sm" />
                ))}
              </div>
            )}

            {/* Key Stat Blocks */}
            <div className="flex items-center gap-1.5 ml-auto flex-wrap">
              {stats.map((stat, i) => (
                <span
                  key={i}
                  className={cn(
                    'font-mono font-bold px-2 py-0.5 rounded text-xs',
                    stat.highlight
                      ? 'bg-[var(--pr)] text-white'
                      : 'bg-[var(--sp2)] text-[var(--tx)]'
                  )}
                >
                  {stat.label && <span className="text-[var(--mu)] mr-1 font-sans font-normal">{stat.label}</span>}
                  {stat.value}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
