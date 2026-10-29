import type { ComponentType, SVGProps } from 'react'
import type { Tone } from './destinationIcons'

/** Heading row for a feature card: a small tinted icon tile, a bold title, and a hairline divider beneath. */
export function FeatureCardHeader({ icon: Icon, tone, title }: { icon: ComponentType<SVGProps<SVGSVGElement>>; tone: Tone; title: string }) {
  return (
    <div className="px-5 pt-5">
      <div className="flex items-center gap-3">
        <span data-icon-surface data-tone={tone} className="soft-tile">
          <Icon aria-hidden="true" style={{ width: 18, height: 18 }} />
        </span>
        <h2 className="text-heading font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
      </div>
      <div aria-hidden="true" className="mt-4 h-px bg-border/70" />
    </div>
  )
}
