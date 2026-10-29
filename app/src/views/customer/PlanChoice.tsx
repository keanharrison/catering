import type { ComponentType, SVGProps } from 'react'
import { destinationIcons } from '../../components/destinationIcons'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'

function Option({ icon: Icon, tone, title, description, action, primary, onChoose }: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  tone: 'violet' | 'slate'
  title: string
  description: string
  action: string
  primary: boolean
  onChoose: () => void
}) {
  return (
    <Card className="p-5 sm:p-6">
      <span data-icon-surface data-tone={tone} className="floating-tile">
        <Icon aria-hidden="true" style={{ width: 20, height: 20 }} />
      </span>
      <h2 className="mt-5 text-heading font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
      <p className="mt-1 text-ui text-muted-foreground">{description}</p>
      <Button variant={primary ? 'default' : 'outline'} className="mt-6 w-full" onClick={onChoose}>{action}</Button>
    </Card>
  )
}

/** The first thing a new request shows: a required choice between the guided chat and the form. */
export function PlanChoice({ onAssisted, onManual }: { onAssisted: () => void; onManual: () => void }) {
  return (
    <div className="w-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
      <section className="mx-auto w-full max-w-3xl">
        <h1 className="type-page-title mb-2">Plan your catering</h1>
        <p className="mb-8 text-body text-muted-foreground">Choose how you’d like to start.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Option
            icon={destinationIcons.chat}
            tone="violet"
            title="Plan with AI"
            description="Answer six quick questions in a chat and we’ll fill in the request for you. You can change anything afterward."
            action="Plan with AI"
            primary
            onChoose={onAssisted}
          />
          <Option
            icon={destinationIcons.drafts}
            tone="slate"
            title="Enter details myself"
            description="Go straight to the form and pick your own menu and quantities."
            action="Enter details myself"
            primary={false}
            onChoose={onManual}
          />
        </div>
      </section>
    </div>
  )
}
