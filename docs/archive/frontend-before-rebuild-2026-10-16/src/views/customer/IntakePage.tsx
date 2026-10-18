import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Button } from '../../components/Button'
import { Choices } from '../../components/Choices'
import { Eyebrow } from '../../components/Eyebrow'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../../components/ui/field'
import { Input, NativeSelect } from '../../components/ui/input'
import { JourneyNav } from '../../components/JourneyNav'
import { Panel } from '../../components/Panel'
import { StageGate } from '../../components/StageGate'
import { catalog, type DietaryTag, type Fulfillment } from '../../data'
import { stagePath } from './journey'
import { useDemoStore } from '../../state/store'
import {
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

const dietaryOptions: Array<{ id: DietaryTag; label: string }> = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
]

const fulfillmentOptions: Array<{ id: Fulfillment; label: string }> = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'delivery', label: 'Delivery' },
]

// Local form state is keyed by `session`, so loading a scenario or resetting starts fresh.
export function IntakePage() {
  const session = useDemoStore((state) => state.session)
  return (
    <StageGate stage="event">
      <IntakeFormView key={session} />
    </StageGate>
  )
}

function IntakeFormView() {
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

  function toggleDietary(tag: DietaryTag) {
    set('dietary', form.dietary.includes(tag) ? form.dietary.filter((t) => t !== tag) : [...form.dietary, tag])
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const found = sectionErrors(validateForm(form, clock, catalog), 'basics')
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    // Keep contact and time answers already given; only the basics change here.
    updateDraft({ intent: { ...order.intent, ...formToIntent({ ...intentToForm(order.intent), ...pickBasics(form) }) } })
    navigate(stagePath('menu'))
  }

  return (
    <Band>
      <Eyebrow marker>Event details</Eyebrow>
      <h1 className="mt-6 text-3xl md:text-5xl">Tell us about your event.</h1>
      <div className="mt-10">
        <JourneyNav active="event" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel className="p-6 md:p-8">
          <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6">
            <FieldGroup>
              <Field data-invalid={Boolean(errors.eventType) || undefined}>
                <FieldLabel htmlFor="eventType">Event type</FieldLabel>
                <NativeSelect
                id="eventType"
                name="eventType"
                value={form.eventType}
                aria-invalid={Boolean(errors.eventType)}
                aria-describedby={errors.eventType ? 'eventType-error' : undefined}
                onChange={(e) => set('eventType', e.target.value)}
              >
                <option value="">Choose one</option>
                {catalog.eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
                </NativeSelect>
                {errors.eventType && <FieldError id="eventType-error">{errors.eventType}</FieldError>}
              </Field>
              <Field data-invalid={Boolean(errors.guestCount) || undefined}>
                <FieldLabel htmlFor="guestCount">Number of guests</FieldLabel>
                <Input
                id="guestCount"
                name="guestCount"
                type="number"
                inputMode="numeric"
                min={1}
                value={form.guestCount}
                aria-invalid={Boolean(errors.guestCount)}
                aria-describedby={errors.guestCount ? 'guestCount-error' : 'guestCount-hint'}
                onChange={(e) => set('guestCount', e.target.value)}
              />
                {errors.guestCount ? (
                  <FieldError id="guestCount-error">{errors.guestCount}</FieldError>
                ) : (
                  <FieldDescription id="guestCount-hint">An estimate is fine. You can change it later.</FieldDescription>
                )}
              </Field>
              <Field data-invalid={Boolean(errors.eventDate) || undefined}>
                <FieldLabel htmlFor="eventDate">Event date</FieldLabel>
                <Input
                id="eventDate"
                name="eventDate"
                type="date"
                min={clock.slice(0, 10)}
                value={form.eventDate}
                aria-invalid={Boolean(errors.eventDate)}
                aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
                onChange={(e) => set('eventDate', e.target.value)}
              />
                {errors.eventDate && <FieldError id="eventDate-error">{errors.eventDate}</FieldError>}
              </Field>
            <Choices legend="Pickup or delivery">
              {fulfillmentOptions.map((option) => (
                <label key={option.id} className="flex min-h-11 items-center gap-2 text-base">
                  <input
                    type="radio"
                    name="fulfillment"
                    className="accent-neutral-950"
                    checked={form.fulfillment === option.id}
                    onChange={() => set('fulfillment', option.id)}
                  />
                  {option.label}
                </label>
              ))}
            </Choices>
            <Choices legend="Dietary needs (optional)">
              {dietaryOptions.map((option) => (
                <label key={option.id} className="flex min-h-11 items-center gap-2 text-base">
                  <input
                    type="checkbox"
                    name="dietary"
                    className="accent-neutral-950"
                    checked={form.dietary.includes(option.id)}
                    onChange={() => toggleDietary(option.id)}
                  />
                  {option.label}
                </label>
              ))}
            </Choices>
              <Field data-invalid={Boolean(errors.budget) || undefined}>
                <FieldLabel htmlFor="budget">Budget (optional)</FieldLabel>
                <Input
                id="budget"
                name="budget"
                inputMode="decimal"
                placeholder="1,200"
                value={form.budget}
                aria-invalid={Boolean(errors.budget)}
                aria-describedby={errors.budget ? 'budget-error' : 'budget-hint'}
                onChange={(e) => set('budget', e.target.value)}
              />
                {errors.budget ? (
                  <FieldError id="budget-error">{errors.budget}</FieldError>
                ) : (
                  <FieldDescription id="budget-hint">Total for food, in dollars.</FieldDescription>
                )}
              </Field>
            </FieldGroup>
            <div className="flex justify-end">
              <Button type="submit">Choose your menu</Button>
            </div>
          </form>
        </Panel>

        <Panel tone="deep" className="self-start p-6">
          <Eyebrow>Why we ask</Eyebrow>
          <p className="mt-4 text-sm">
            Guest count shows how much food your event needs, and the date tells us how much notice the kitchen
            has. You will pick your own menu next. Pickup or delivery time comes at the end.
          </p>
        </Panel>
      </div>
    </Band>
  )
}

function pickBasics(form: IntakeForm): Partial<IntakeForm> {
  return {
    eventType: form.eventType,
    guestCount: form.guestCount,
    eventDate: form.eventDate,
    fulfillment: form.fulfillment,
    dietary: form.dietary,
    budget: form.budget,
  }
}
