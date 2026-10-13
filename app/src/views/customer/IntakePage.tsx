import { useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { Field, inputClass } from '../../components/Field'
import { Panel } from '../../components/Panel'
import { ProgressBar } from '../../components/ProgressBar'
import { StepTabs } from '../../components/StepTabs'
import { catalog, type DietaryTag, type Fulfillment } from '../../data'
import { recommend } from '../../engine'
import { customerRoutes } from '../../routes'
import { useDemoStore } from '../../state/store'
import {
  formToIntent,
  intakeSteps,
  intentToForm,
  stepErrors,
  validateForm,
  type IntakeErrors,
  type IntakeField,
  type IntakeForm,
} from './intake'

const dietaryOptions: Array<{ id: DietaryTag; label: string }> = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'spicy', label: 'Likes it spicy' },
]

const fulfillmentOptions: Array<{ id: Fulfillment; label: string }> = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'delivery', label: 'Delivery' },
]

const stepHelp: Record<string, { title: string; body: string }> = {
  event: {
    title: 'Why we ask',
    body: 'Guest count sets portion sizes, and the date tells us how much notice the kitchen has.',
  },
  preferences: {
    title: 'Why we ask',
    body: 'Dietary needs and budget help us suggest the right menu. A custom request goes to our team to review.',
  },
  contact: {
    title: 'Almost done',
    body: 'We use this to follow up on your request. You will review your suggested menu next.',
  },
}

// Local form state is keyed by `session`, so loading a scenario or resetting starts fresh.
export function IntakePage() {
  const session = useDemoStore((state) => state.session)
  return <IntakeFormView key={session} />
}

function IntakeFormView() {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)

  const [form, setForm] = useState<IntakeForm>(() => intentToForm(order.intent))
  const [stepIndex, setStepIndex] = useState(0)
  const [furthest, setFurthest] = useState(0)
  const [errors, setErrors] = useState<IntakeErrors>({})
  const formRef = useRef<HTMLFormElement>(null)

  const step = intakeSteps[stepIndex]
  const isLast = stepIndex === intakeSteps.length - 1

  function set<K extends IntakeField>(field: K, value: IntakeForm[K]) {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function toggleDietary(tag: DietaryTag) {
    set('dietary', form.dietary.includes(tag) ? form.dietary.filter((t) => t !== tag) : [...form.dietary, tag])
  }

  function goToStep(index: number) {
    if (index <= furthest) {
      setErrors({})
      setStepIndex(index)
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const found = stepErrors(validateForm(form, clock, catalog), step.id)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    if (!isLast) {
      setStepIndex(stepIndex + 1)
      setFurthest(Math.max(furthest, stepIndex + 1))
      return
    }

    const intent = formToIntent(form)
    const changed = JSON.stringify(intent) !== JSON.stringify(order.intent)
    const lines = changed ? recommend(intent).lines.map(({ itemId, units }) => ({ itemId, units })) : undefined
    updateDraft({ intent, lines })
    navigate(customerRoutes.recommendation)
  }

  if (order.status !== 'draft') {
    return (
      <Band>
        <Eyebrow marker>Your request</Eyebrow>
        <h1 className="mt-6 text-5xl">Your request has been sent.</h1>
        <p className="mt-6 max-w-xl text-muted">
          This request is already with our team, so it can no longer be edited here.
        </p>
      </Band>
    )
  }

  const help = stepHelp[step.id]

  return (
    <Band>
      <Eyebrow marker>Event details</Eyebrow>
      <h1 className="mt-6 text-5xl md:text-7xl">Tell us about your event.</h1>

      <div className="mt-10">
        <StepTabs
          label="Intake steps"
          items={intakeSteps.map((s) => ({ id: s.id, label: s.label }))}
          activeId={step.id}
          onChange={(id) => goToStep(intakeSteps.findIndex((s) => s.id === id))}
        />
        <div className="mt-3 flex items-center gap-4">
          <ProgressBar value={stepIndex + 1} max={intakeSteps.length} label="Intake progress" />
          <span className="shrink-0 font-mono text-xs uppercase tracking-eyebrow text-muted">
            Step {stepIndex + 1} of {intakeSteps.length}
          </span>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <Panel corners>
          <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6">
            {step.id === 'event' && (
              <>
                <Field label="Event type" htmlFor="eventType" error={errors.eventType}>
                  <select
                    id="eventType"
                    name="eventType"
                    className={inputClass}
                    value={form.eventType}
                    aria-invalid={Boolean(errors.eventType)}
                    onChange={(e) => set('eventType', e.target.value)}
                  >
                    <option value="">Choose one</option>
                    {catalog.eventTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Number of guests"
                  htmlFor="guestCount"
                  hint="An estimate is fine. You can change it later."
                  error={errors.guestCount}
                >
                  <input
                    id="guestCount"
                    name="guestCount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    className={inputClass}
                    value={form.guestCount}
                    aria-invalid={Boolean(errors.guestCount)}
                    onChange={(e) => set('guestCount', e.target.value)}
                  />
                </Field>
                <Field label="Event date and time" htmlFor="eventAt" error={errors.eventAt}>
                  <input
                    id="eventAt"
                    name="eventAt"
                    type="datetime-local"
                    min={clock}
                    className={inputClass}
                    value={form.eventAt}
                    aria-invalid={Boolean(errors.eventAt)}
                    onChange={(e) => set('eventAt', e.target.value)}
                  />
                </Field>
                <Choices legend="Pickup or delivery">
                  {fulfillmentOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 font-sans text-base">
                      <input
                        type="radio"
                        name="fulfillment"
                        className="accent-accent"
                        checked={form.fulfillment === option.id}
                        onChange={() => set('fulfillment', option.id)}
                      />
                      {option.label}
                    </label>
                  ))}
                </Choices>
              </>
            )}

            {step.id === 'preferences' && (
              <>
                <Choices legend="Dietary needs">
                  {dietaryOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 font-sans text-base">
                      <input
                        type="checkbox"
                        name="dietary"
                        className="accent-accent"
                        checked={form.dietary.includes(option.id)}
                        onChange={() => toggleDietary(option.id)}
                      />
                      {option.label}
                    </label>
                  ))}
                </Choices>
                <Field
                  label="Budget (optional)"
                  htmlFor="budget"
                  hint="Total for food, in dollars."
                  error={errors.budget}
                >
                  <input
                    id="budget"
                    name="budget"
                    inputMode="decimal"
                    placeholder="1,200"
                    className={inputClass}
                    value={form.budget}
                    aria-invalid={Boolean(errors.budget)}
                    onChange={(e) => set('budget', e.target.value)}
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
              </>
            )}

            {step.id === 'contact' && (
              <>
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
              </>
            )}

            <div className="flex justify-between gap-3">
              <Button
                variant="secondary"
                disabled={stepIndex === 0}
                onClick={() => goToStep(stepIndex - 1)}
              >
                Back
              </Button>
              <Button type="submit">{isLast ? 'See my menu' : 'Continue'}</Button>
            </div>
          </form>
        </Panel>

        <Panel tone="deep" className="self-start p-6">
          <Eyebrow>{help.title}</Eyebrow>
          <p className="mt-4 text-sm">{help.body}</p>
        </Panel>
      </div>
    </Band>
  )
}

function Choices({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-sans text-sm">{legend}</legend>
      <div className="flex flex-wrap gap-x-6 gap-y-2">{children}</div>
    </fieldset>
  )
}
