import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { Field, inputClass } from '../../components/Field'
import { JourneyNav } from '../../components/JourneyNav'
import { Panel } from '../../components/Panel'
import { StageGate } from '../../components/StageGate'
import { catalog } from '../../data'
import { useDemoStore } from '../../state/store'
import {
  formToIntent,
  intentToForm,
  sectionErrors,
  validateForm,
  type IntakeErrors,
  type IntakeField,
  type IntakeForm,
} from './intake'
import { stagePath } from './journey'

export function DetailsPage() {
  const session = useDemoStore((state) => state.session)
  return (
    <StageGate stage="details">
      <DetailsView key={session} />
    </StageGate>
  )
}

function DetailsView() {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)

  const [form, setForm] = useState<IntakeForm>(() => intentToForm(order.intent))
  const [errors, setErrors] = useState<IntakeErrors>({})
  const formRef = useRef<HTMLFormElement>(null)

  function set<K extends IntakeField>(field: K, value: IntakeForm[K]) {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const found = sectionErrors(validateForm(form, clock, catalog), 'details')
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    updateDraft({ intent: formToIntent(form) })
    navigate(stagePath('review'))
  }

  return (
    <Band>
      <Eyebrow marker>Final details</Eyebrow>
      <h1 className="mt-6 text-4xl md:text-7xl">Almost there.</h1>
      <div className="mt-10">
        <JourneyNav active="details" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <Panel className="p-6 md:p-8">
          <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6">
            <Field
              label={order.intent.fulfillment === 'delivery' ? 'Delivery time' : 'Pickup time'}
              htmlFor="eventTime"
              error={errors.eventTime}
            >
              <input
                id="eventTime"
                name="eventTime"
                type="time"
                className={inputClass}
                value={form.eventTime}
                aria-invalid={Boolean(errors.eventTime)}
                onChange={(e) => set('eventTime', e.target.value)}
              />
            </Field>
            <Field label="Your name" htmlFor="contactName" error={errors.contactName}>
              <input
                id="contactName"
                name="contactName"
                autoComplete="name"
                className={inputClass}
                value={form.contactName}
                aria-invalid={Boolean(errors.contactName)}
                onChange={(e) => set('contactName', e.target.value)}
              />
            </Field>
            <Field label="Company or organization (optional)" htmlFor="organization">
              <input
                id="organization"
                name="organization"
                autoComplete="organization"
                className={inputClass}
                value={form.organization}
                onChange={(e) => set('organization', e.target.value)}
              />
            </Field>
            <Field
              label="Anything not on our menu? (optional)"
              htmlFor="customRequest"
              hint="Our team will review custom requests."
            >
              <textarea
                id="customRequest"
                name="customRequest"
                rows={2}
                className={inputClass}
                value={form.customRequest}
                onChange={(e) => set('customRequest', e.target.value)}
              />
            </Field>
            <Field label="Notes (optional)" htmlFor="notes">
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className={inputClass}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </Field>
            <div className="flex justify-between gap-3">
              <Button variant="secondary" onClick={() => navigate(stagePath('supplies'))}>
                Back
              </Button>
              <Button type="submit">Review your request</Button>
            </div>
          </form>
        </Panel>
        <Panel tone="deep" className="self-start p-6">
          <Eyebrow>Next</Eyebrow>
          <p className="mt-4 text-sm">You will review everything before you send your request.</p>
        </Panel>
      </div>
    </Band>
  )
}
