import React from 'react'
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
    32: 'w-8 h-8 text-[9px]',
    48: 'w-12 h-12 text-[10px]',
    64: 'w-16 h-16 text-[11px]',
    96: 'w-24 h-24 text-[13px]',
  }

  const spriteSrc = src || (itemId ? getSpriteUrl(itemId) : undefined)

  if (spriteSrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center shrink-0 rounded-[6px] overflow-hidden bg-[var(--sp2)] border border-[var(--line)] p-1.5 transition-transform hover:scale-105',
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

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center shrink-0 rounded-[6px] border-2 border-dashed border-[var(--ib)] bg-[var(--sp2)] text-[var(--mu)] font-sans font-medium text-center select-none p-1',
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <span className="truncate max-w-full font-mono font-semibold">
        {label || `${size}px`}
      </span>
    </div>
  )
}
