import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-sans font-extrabold transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-[var(--pr)] text-white',
        secondary: 'bg-[var(--sp2)] text-[var(--tx)]',
        outline: 'border-2 border-[var(--line)] text-[var(--tx)]',
        spring: 'bg-[#3F7A32] text-white',
        summer: 'bg-[#F2C94C] text-[#17323A]',
        fall: 'bg-[#B5541C] text-white',
        winter: 'bg-[#4A5FA8] text-white',
      },
      size: {
        default: 'min-h-[44px] px-4 text-sm',
        sm: 'min-h-[32px] px-3 text-xs',
        pill: 'h-auto py-1 px-2.5 text-xs font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
