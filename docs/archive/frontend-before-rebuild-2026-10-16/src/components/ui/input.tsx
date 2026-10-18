import type { ComponentProps } from 'react'
import { cx } from '../../lib/cx'

const inputStyles =
  'h-8 w-full min-w-0 rounded-[10px] border border-neutral-200 bg-transparent px-2.5 py-1 text-base text-neutral-950 outline-none transition-colors placeholder:text-neutral-500 focus-visible:border-neutral-950 focus-visible:ring-3 focus-visible:ring-neutral-950/50 aria-invalid:border-red-600 aria-invalid:ring-3 aria-invalid:ring-red-600/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-100/50 disabled:opacity-50 md:text-sm'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cx(inputStyles, className)}
      {...props}
    />
  )
}

export function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      data-slot="native-select"
      className={cx(inputStyles, 'cursor-pointer', className)}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cx(
        'field-sizing-content min-h-16 w-full min-w-0 rounded-[10px] border border-neutral-200 bg-transparent px-2.5 py-2 text-base text-neutral-950 outline-none transition-colors placeholder:text-neutral-500 focus-visible:border-neutral-950 focus-visible:ring-3 focus-visible:ring-neutral-950/50 aria-invalid:border-red-600 aria-invalid:ring-3 aria-invalid:ring-red-600/20 disabled:cursor-not-allowed disabled:bg-neutral-100/50 disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}
