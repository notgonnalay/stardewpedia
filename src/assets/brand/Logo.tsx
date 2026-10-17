import { Link } from 'react-router-dom'
import { Mark } from './Mark'
import { cn } from '@/utils/cn'

interface LogoProps {
  isMobile?: boolean
  className?: string
}

export function Logo({ isMobile = false, className }: LogoProps) {
  const markSize = isMobile ? 30 : 36
  const textSize = isMobile ? 'text-[22px]' : 'text-[26px]'
  const gap = isMobile ? 'gap-2' : 'gap-2.5'

  return (
    <Link
      to="/"
      aria-label="Stardewpedia home"
      className={cn(
        'inline-flex items-center select-none transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--po)] rounded-md',
        gap,
        className
      )}
    >
      <Mark size={markSize} />
      <span
        className={cn(
          'font-display font-bold leading-none tracking-tight text-[var(--lk)]',
          textSize
        )}
      >
        Stardewpedia
      </span>
    </Link>
  )
}
