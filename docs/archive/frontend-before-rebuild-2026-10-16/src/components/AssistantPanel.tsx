import { Panel } from './Panel'
import { Pill } from './Pill'

// Collapsed assistant placeholder. Questions are unavailable in the walkthrough; it offers no menu,
// allergy or pricing advice. The staff view uses the same disclosure with staff-specific copy.
type Audience = 'customer' | 'staff'

const copy: Record<Audience, { region: string; heading: string; unavailable: string }> = {
  customer: {
    region: 'Customer assistant preview',
    heading: 'Customer assistant preview',
    unavailable: 'Questions cannot be sent or answered in this walkthrough. Use the menu details and serving guide on this page.',
  },
  staff: {
    region: 'Staff assistant preview',
    heading: 'Staff assistant preview',
    unavailable: 'Questions cannot be sent or answered in this walkthrough.',
  },
}

export function AssistantPanel({ audience = 'customer' }: { audience?: Audience }) {
  const text = copy[audience]
  return (
    <section aria-label={text.region}>
      <Panel className="p-0">
        <details>
          <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-6 py-4 font-sans text-sm">
            <span>{text.heading}</span>
            <Pill>Unavailable in demo</Pill>
          </summary>
          <p className="border-t border-line px-6 py-4 text-sm text-muted">{text.unavailable}</p>
        </details>
      </Panel>
    </section>
  )
}
