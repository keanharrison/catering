import type { ReactNode } from 'react'

type EyebrowProps = {
  children: ReactNode
  marker?: boolean
}

// Small uppercase mono label; optional orange square marker.
export function Eyebrow({ children, marker = false }: EyebrowProps) {
  return (
    <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide">
      {marker && <span aria-hidden className="size-2 bg-accent" />}
      {children}
    </p>
  )
}
