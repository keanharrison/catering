import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../../components/ui/field'
import { Input, Textarea } from '../../components/ui/input'
import { JourneyNav } from '../../components/JourneyNav'
import { Panel } from '../../components/Panel'
import { StageGate } from '../../components/StageGate'
import { catalog } from '../../data'
import { useDemoStore } from '../../state/store'
import {
  clearIntakeFormDraft,
  loadIntakeFormDraft,
  saveIntakeFormDraft,
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
  const session = useDemoStore((state) => state.session)
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)

  const [form, setForm] = useState<IntakeForm>(() => loadIntakeFormDraft(session, intentToForm(order.intent)))
  const [errors, setErrors] = useState<IntakeErrors>({})
  const formRef = useRef<HTMLFormElement>(null)

  function set<K extends IntakeField>(field: K, value: IntakeForm[K]) {
    const next = { ...form, [field]: value }
    setForm(next)
    saveIntakeFormDraft(session, next)
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
    clearIntakeFormDraft(session)
    navigate(stagePath('review'))
  }

  return (
    <Band>
      <Eyebrow marker>Final details</Eyebrow>
      <h1 className="mt-6 text-3xl md:text-5xl">Almost there.</h1>
      <div className="mt-10">
        <JourneyNav active="details" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel className="p-6 md:p-8">
          <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6">
            <FieldGroup>
              <Field data-invalid={Boolean(errors.eventTime) || undefined}>
                <FieldLabel htmlFor="eventTime">
                  {order.intent.fulfillment === 'delivery' ? 'Delivery time' : 'Pickup time'}
                </FieldLabel>
                <Input
                id="eventTime"
                name="eventTime"
                type="time"
                value={form.eventTime}
                aria-invalid={Boolean(errors.eventTime)}
                aria-describedby={errors.eventTime ? 'eventTime-error' : undefined}
                onChange={(e) => set('eventTime', e.target.value)}
              />
                {errors.eventTime && <FieldError id="eventTime-error">{errors.eventTime}</FieldError>}
              </Field>
              <Field data-invalid={Boolean(errors.contactName) || undefined}>
                <FieldLabel htmlFor="contactName">Your name</FieldLabel>
                <Input
                id="contactName"
                name="contactName"
                autoComplete="name"
                value={form.contactName}
                aria-invalid={Boolean(errors.contactName)}
                aria-describedby={errors.contactName ? 'contactName-error' : undefined}
                onChange={(e) => set('contactName', e.target.value)}
              />
                {errors.contactName && <FieldError id="contactName-error">{errors.contactName}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="organization">Company or organization (optional)</FieldLabel>
                <Input
                id="organization"
                name="organization"
                autoComplete="organization"
                value={form.organization}
                onChange={(e) => set('organization', e.target.value)}
              />
              </Field>
              <Field>
                <FieldLabel htmlFor="customRequest">Would you like to request an item that isn't on the menu?</FieldLabel>
                <Textarea
                id="customRequest"
                name="customRequest"
                rows={2}
                aria-describedby="customRequest-hint"
                value={form.customRequest}
                onChange={(e) => set('customRequest', e.target.value)}
              />
                <FieldDescription id="customRequest-hint">Our team will review custom requests.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="notes">Is there anything else we should know about your order?</FieldLabel>
                <Textarea
                id="notes"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
              </Field>
            </FieldGroup>
            <div className="flex justify-between gap-3">
              <Button variant="secondary" onClick={() => navigate(stagePath('supplies'))}>
                Back
              </Button>
              <Button type="submit">Review your request</Button>
            </div>
          </form>
        </Panel>
      </div>
    </Band>
  )
}
