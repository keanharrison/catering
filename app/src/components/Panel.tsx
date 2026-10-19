import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { CornerSquares } from './CornerSquares'

type PanelProps = {
  children: ReactNode
  corners?: boolean
  tone?: 'white' | 'deep'
  className?: string
}

// Shared low-contrast card surface for the customer flow and its order summaries.
export function Panel({ children, corners = false, tone = 'white', className }: PanelProps) {
  return (
    <div
      className={cx(
        'relative rounded-[8px] border border-line shadow-xs',
        tone === 'white' ? 'bg-panel' : 'bg-ivory-deep',
        corners && 'p-5',
        className,
      )}
    >
      {corners && <CornerSquares />}
      {children}
    </div>
  )
}
