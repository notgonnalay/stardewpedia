import { Flower2, Sun, Flame, Snowflake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface SeasonBadgeProps {
  season: Season
  className?: string
  size?: 'sm' | 'md'
}

export function SeasonBadge({ season, className, size = 'md' }: SeasonBadgeProps) {
  const config = {
    spring: {
      label: 'Spring',
      icon: Flower2,
      style: 'bg-[#EAF3E7] text-[#2F6325] border-[#BDDCB5] dark:bg-[#1E331B] dark:text-[#A7E29C] dark:border-[#2F5229]',
    },
    summer: {
      label: 'Summer',
      icon: Sun,
      style: 'bg-[#FEF7D9] text-[#7A5B05] border-[#EAD37A] dark:bg-[#382E0E] dark:text-[#F3DA73] dark:border-[#5C4A12]',
    },
    fall: {
      label: 'Fall',
      icon: Flame,
      style: 'bg-[#FDF0E7] text-[#8C3A0A] border-[#E8BFA4] dark:bg-[#3A1E11] dark:text-[#F5AC82] dark:border-[#5E3019]',
    },
    winter: {
      label: 'Winter',
      icon: Snowflake,
      style: 'bg-[#EEF3FD] text-[#28418A] border-[#B7CBF2] dark:bg-[#172545] dark:text-[#A6C0FA] dark:border-[#283E73]',
    },
  }[season]

  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-bold inline-flex items-center gap-1 uppercase tracking-wider select-none shrink-0 border',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-0.5',
        config.style,
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      <span>{config.label}</span>
    </Badge>
  )
}
