import { useState } from 'react'
import { Band } from '../components/Band'
import { Button } from '../components/Button'
import { Eyebrow } from '../components/Eyebrow'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'
import { Panel } from '../components/Panel'
import { Pill } from '../components/Pill'
import { StatLine } from '../components/StatLine'
import { StepTabs } from '../components/StepTabs'
import { AssumptionTag, PreviewTag } from '../components/Tags'

const stages = [
  { id: 'plan', label: 'Plan' },
  { id: 'recommend', label: 'Recommend' },
  { id: 'review', label: 'Review' },
]

const statuses = [
  {
    id: 'submitted',
    label: 'Submitted',
    description: 'Your request is with the restaurant. It has not been accepted yet.',
  },
  {
    id: 'needs-review',
    label: 'Needs review',
    description: 'Staff are checking details that need a person, such as short notice.',
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    description: 'An authorized acceptance creates the confirmed record.',
  },
]

// Internal reference page: every shared component in one place (build step 1).
export function Gallery() {
  const [stage, setStage] = useState('plan')
  const [status, setStatus] = useState('needs-review')

  return (
    <>
      <Band>
        <Eyebrow marker>Component gallery</Eyebrow>
        <h1 className="type-page-title mt-6">Design system.</h1>
        <p className="mt-8 max-w-xl text-muted">
          Shared components for every screen, built from PRD section 8 and the Fin references.
          Internal reference only.
        </p>
        <div className="mt-8 flex gap-3">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
        </div>
      </Band>

      <Band tone="white">
        <Eyebrow>Stage tabs</Eyebrow>
        <h2 className="type-section-title mt-4">Segmented stage control.</h2>
        <div className="mt-8">
          <StepTabs label="Stages" items={stages} activeId={stage} onChange={setStage} />
        </div>
      </Band>

      <Band>
        <Eyebrow>Product panel</Eyebrow>
        <h2 className="type-section-title mt-4">Status list with orange progress.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Panel tone="deep" className="p-0">
            <StepTabs label="Statuses" variant="list" items={statuses} activeId={status} onChange={setStatus} />
          </Panel>
          <Panel className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="type-section-title">Wedding drop-off, 150 guests</h3>
                <div className="mt-2">
                  <StatLine
                    items={[
                      { label: 'Guests', value: '150' },
                      { label: 'Notice', value: '3 days' },
                    ]}
                  />
                </div>
              </div>
              <Pill tone="review">Needs review</Pill>
            </div>
            <p className="mt-6 text-sm">
              Large order and short notice. Staff review is required before this can be accepted.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <AssumptionTag />
              <PreviewTag />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button size="sm" variant="secondary">Request clarification</Button>
              <Button size="sm">Accept</Button>
            </div>
          </Panel>
        </div>
      </Band>

      <Band tone="white">
        <Eyebrow>Status pills</Eyebrow>
        <div className="mt-6 flex flex-wrap gap-3">
          <Pill>Draft</Pill>
          <Pill tone="confirmed">Confirmed</Pill>
          <Pill tone="review">Needs review</Pill>
          <Pill tone="blocked">Blocked</Pill>
        </div>
      </Band>

      <Band>
        <Eyebrow>Form fields</Eyebrow>
        <h2 className="type-section-title mt-4">Guided form.</h2>
        <Panel className="mt-8 max-w-xl p-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="g-guests">Guests</FieldLabel>
              <Input id="g-guests" type="number" placeholder="40" aria-describedby="g-guests-hint" />
              <FieldDescription id="g-guests-hint">Headcount sets portion sizes.</FieldDescription>
            </Field>
            <Field data-invalid>
              <FieldLabel htmlFor="g-date">Event date</FieldLabel>
              <Input
                id="g-date"
                type="date"
                aria-invalid="true"
                aria-describedby="g-date-error"
              />
              <FieldError id="g-date-error">Choose a date after the lead time.</FieldError>
            </Field>
          </FieldGroup>
        </Panel>
      </Band>
    </>
  )
}
