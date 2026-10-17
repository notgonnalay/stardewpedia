import * as React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'default' | 'hero'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = 'default', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-[8px] border-2 border-[var(--ib)] bg-[var(--card)] px-4 font-sans text-base font-semibold text-[var(--tx)] placeholder:text-[var(--mu)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--po)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          inputSize === 'hero' ? 'h-[48px]' : 'h-[44px]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
