import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'sm'
}

// Compact, low-radius. Primary is solid charcoal; secondary is outlined.
export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        'rounded-md border font-sans transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        size === 'md' ? 'min-h-11 px-4 py-2 text-base' : 'min-h-9 px-3 py-1.5 text-sm',
        variant === 'primary'
          ? 'border-charcoal bg-charcoal text-white hover:bg-black'
          : 'border-charcoal bg-transparent text-charcoal hover:bg-ivory-deep',
        className,
      )}
    />
  )
}
