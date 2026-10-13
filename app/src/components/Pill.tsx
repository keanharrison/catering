import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

type PillProps = {
  children: ReactNode
  tone?: 'neutral' | 'confirmed' | 'review' | 'blocked'
}

const tones = {
  neutral: 'bg-ivory-deep text-muted',
  confirmed: 'bg-status-confirmed/10 text-status-confirmed',
  review: 'bg-status-review/15 text-status-review',
  blocked: 'bg-status-blocked/10 text-status-blocked',
}

// Status pill, used only inside product UI (like Fin's "Enabled" tag).
export function Pill({ children, tone = 'neutral' }: PillProps) {
  return (
    <span className={cx('inline-block rounded-sm px-2 py-0.5 font-sans text-xs', tones[tone])}>
      {children}
    </span>
  )
}
