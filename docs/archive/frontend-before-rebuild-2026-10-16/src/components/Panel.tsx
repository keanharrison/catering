import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { CornerSquares } from './CornerSquares'

type PanelProps = {
  children: ReactNode
  corners?: boolean
  tone?: 'white' | 'deep'
  className?: string
}

// Hairline-bordered, low-radius panel. Product UI sits inside panels.
export function Panel({ children, corners = false, tone = 'white', className }: PanelProps) {
  return (
    <div
      className={cx(
        'relative rounded-sm border border-line',
        tone === 'white' ? 'bg-panel' : 'bg-ivory-deep',
        corners && 'p-8',
        className,
      )}
    >
      {corners && <CornerSquares />}
      {children}
    </div>
  )
}
