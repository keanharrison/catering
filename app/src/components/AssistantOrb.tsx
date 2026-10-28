import type { CSSProperties } from 'react'

/** Decorative: the assistant's name always sits beside it. */
export function AssistantOrb({ size = 28 }: { size?: number }) {
  return <span aria-hidden="true" className="assistant-orb" style={{ '--orb-size': `${size}px` } as CSSProperties} />
}
