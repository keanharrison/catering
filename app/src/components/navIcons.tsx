import type { SVGProps } from 'react'

// Sidebar icons drawn to match the weight and rounding of the ElevenLabs set: 2px strokes on a 24px grid.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** A rounded house with a short sill line near the base. */
export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10.2 12 3.8l8 6.4V18a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 18z" />
      <path d="M9.5 16.2h5" />
    </svg>
  )
}

/** A rounded chat bubble with a small four-point spark at its top-right corner. */
export function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12.5 4.5H7A3 3 0 0 0 4 7.5v7a3 3 0 0 0 3 3h.5v3.2l3.9-3.2H17a3 3 0 0 0 3-3V11" />
      <path d="M18.5 2.8c.3 1.7 1.2 2.6 2.9 2.9-1.7.3-2.6 1.2-2.9 2.9-.3-1.7-1.2-2.6-2.9-2.9 1.7-.3 2.6-1.2 2.9-2.9z" />
    </svg>
  )
}
