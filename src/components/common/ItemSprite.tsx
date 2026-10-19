import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'
import { getSpriteUrl } from '@/utils/sprites'

interface ItemSpriteProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 32 | 48 | 64 | 96
  label?: string
  itemId?: string
  src?: string
  alt?: string
}

export function ItemSprite({
  size = 64,
  label,
  itemId,
  src,
  alt = 'Sprite',
  className,
  ...props
}: ItemSpriteProps) {
  const sizeClasses = {
    32: 'w-8 h-8 text-[11px]',
    48: 'w-12 h-12 text-[14px]',
    64: 'w-16 h-16 text-[18px]',
    96: 'w-24 h-24 text-[24px]',
  }

  const spriteSrc = src || (itemId ? getSpriteUrl(itemId) : undefined)

  if (spriteSrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center shrink-0 rounded-[8px] overflow-hidden bg-[var(--sp2)] border border-[var(--line)] p-1.5 transition-transform hover:scale-105',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <img
          src={spriteSrc}
          alt={alt}
          className="w-full h-full object-contain pixelated select-none"
          loading="lazy"
        />
      </div>
    )
  }

  // Graceful artistic fallback badge when sprite image is not present
  const displayLetter = label ? label.charAt(0).toUpperCase() : '?'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center shrink-0 rounded-[8px] border-2 border-[var(--line)] bg-gradient-to-br from-[var(--sp2)] to-[var(--bg)] text-[var(--tx)] font-display font-bold select-none p-1 shadow-2xs relative group',
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <span className="text-[var(--pr)] drop-shadow-xs">
        {displayLetter}
      </span>
      <Sparkles className="absolute top-1 right-1 h-2.5 w-2.5 text-[var(--po)] opacity-50" />
    </div>
  )
}
