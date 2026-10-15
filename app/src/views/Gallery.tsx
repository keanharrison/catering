import { useState } from 'react'
import { Band } from '../components/Band'
import { Button } from '../components/Button'
import { Eyebrow } from '../components/Eyebrow'
import { Field, inputClass } from '../components/Field'
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
        <h1 className="mt-6 text-4xl md:text-7xl">Design system.</h1>
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
        <h2 className="mt-4 text-4xl">Segmented stage control.</h2>
        <div className="mt-8">
          <StepTabs label="Stages" items={stages} activeId={stage} onChange={setStage} />
        </div>
      </Band>

      <Band>
        <Eyebrow>Product panel</Eyebrow>
        <h2 className="mt-4 text-4xl">Status list with orange progress.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Panel tone="deep" className="p-0">
            <StepTabs label="Statuses" variant="list" items={statuses} activeId={status} onChange={setStatus} />
          </Panel>
          <Panel className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-sans text-xl">Wedding drop-off, 150 guests</h3>
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
        <h2 className="mt-4 text-4xl">Guided form.</h2>
        <Panel className="mt-8 max-w-xl p-6">
          <div className="grid gap-5">
            <Field label="Guests" htmlFor="g-guests" hint="Headcount sets portion sizes.">
              <input id="g-guests" type="number" className={inputClass} placeholder="40" />
            </Field>
            <Field label="Event date" htmlFor="g-date" error="Choose a date after the lead time.">
              <input id="g-date" type="date" className={inputClass} />
            </Field>
          </div>
        </Panel>
      </Band>
    </>
  )
}
