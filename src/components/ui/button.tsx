import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-base font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--po)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--pr)] text-white border-2 border-[var(--pr)] hover:opacity-90 active:scale-[0.98]',
        outline:
          'border-2 border-[var(--po)] text-[var(--po)] bg-transparent hover:bg-[var(--po)]/10 active:scale-[0.98]',
        secondary:
          'bg-[var(--sp2)] text-[var(--tx)] border-2 border-transparent hover:opacity-90',
        ghost:
          'hover:bg-[var(--line)]/30 text-[var(--tx)]',
        link:
          'text-[var(--lk)] underline-offset-4 hover:underline p-0 h-auto font-bold',
      },
      size: {
        default: 'h-[44px] px-[18px]',
        sm: 'h-[36px] px-3 text-sm',
        lg: 'h-[48px] px-6 text-lg',
        icon: 'h-[44px] w-[44px] p-0',
        'icon-sm': 'h-[36px] w-[36px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
