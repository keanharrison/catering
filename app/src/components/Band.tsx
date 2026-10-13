import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

type BandProps = {
  children: ReactNode
  tone?: 'ivory' | 'white'
  className?: string
}

// Full-width section band with a centered max-width column (Fin rhythm).
export function Band({ children, tone = 'ivory', className }: BandProps) {
  return (
    <section className={cx(tone === 'ivory' ? 'bg-ivory' : 'bg-panel')}>
      <div className={cx('mx-auto max-w-6xl px-6 py-16 md:py-24', className)}>{children}</div>
    </section>
  )
}
