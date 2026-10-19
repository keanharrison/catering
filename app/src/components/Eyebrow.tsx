import type { ReactNode } from 'react'

type EyebrowProps = {
  children: ReactNode
  marker?: boolean
}

// Small uppercase label; optional orange square marker.
export function Eyebrow({ children, marker = false }: EyebrowProps) {
  return (
    <p className="type-small-label flex items-center gap-2 uppercase">
      {marker && <span aria-hidden className="size-2 bg-accent" />}
      {children}
    </p>
  )
}
