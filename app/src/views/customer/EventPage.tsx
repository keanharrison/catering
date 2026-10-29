import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { CheckCircle2Icon, ChevronDownIcon } from '../../components/icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { catalog, type DietaryTag, type Fulfillment } from '@/data'
import { useDemoStore } from '@/state/store'
import {
  formToIntent,
  hasIntakeFormDraft,
  intentToForm,
  loadIntakeFormDraft,
  saveIntakeFormDraft,
  sectionErrors,
  validateForm,
  type IntakeErrors,
  type IntakeField,
  type IntakeForm,
} from './intake'
import { stagePath } from './journey'
import { dietaryOptions } from './planScript'
import { PlanChoice } from './PlanChoice'
import { loadPlanningState, savePlanningState } from './planning'
import { routes } from '@/routes'

const eventTypeItems = catalog.eventTypes.map(({ id, label }) => ({
  label,
  value: id,
}))

const fulfillmentItems: Array<{ label: string; value: Fulfillment }> = [
  { label: 'Pickup', value: 'pickup' },
  { label: 'Delivery', value: 'delivery' },
]

/** The first page opens empty (today's date aside); the sample order's answers are not shown. */
export function blankBasics(): Pick<IntakeForm, 'eventType' | 'guestCount' | 'eventDate' | 'fulfillment' | 'dietary' | 'budget'> {
  return { eventType: '', guestCount: '', eventDate: format(new Date(), 'yyyy-MM-dd'), fulfillment: '', dietary: [], budget: '' }
}

/** Replays a short ring and lift on the button so a silent autosave is noticeable. */
function flash(element: HTMLElement | null) {
  if (!element?.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  element.animate(
    [
      { boxShadow: '0 0 0 0 color-mix(in srgb, var(--primary) 55%, transparent)', transform: 'scale(1)' },
      { boxShadow: '0 0 0 5px color-mix(in srgb, var(--primary) 22%, transparent)', transform: 'scale(1.03)', offset: 0.35 },
      { boxShadow: '0 0 0 9px transparent', transform: 'scale(1)' },
    ],
    { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  )
}

const errorFieldLabels: Partial<Record<IntakeField, string>> = {
  eventType: 'Event type',
  guestCount: 'Guests',
  eventDate: 'Date',
  fulfillment: 'Pickup or delivery',
  budget: 'Budget',
}

/** Opening New request while a submitted request is active starts a fresh draft, so edits are never silently dropped. */
export function EventPage() {
  const status = useDemoStore((state) => state.order.status)
  const activateDraft = useDemoStore((state) => state.activateDraft)
  useEffect(() => {
    if (status !== 'draft') activateDraft()
  }, [status, activateDraft])
  return status === 'draft' ? <EventEntry /> : null
}

/** A new request starts with a choice; a request already under way goes straight to the form. */
function EventEntry() {
  const navigate = useNavigate()
  const session = useDemoStore((state) => state.session)
  const order = useDemoStore((state) => state.order)
  const [showChoice, setShowChoice] = useState(() =>
    loadPlanningState(session).mode === null && !hasIntakeFormDraft(session) && order.lines.length === 0 && order.intent.eventType === '',
  )
  if (!showChoice) return <EventForm />
  return (
    <PlanChoice
      onAssisted={() => navigate(routes.planRequest)}
      onManual={() => {
        savePlanningState(session, { mode: 'manual', prefilled: false, menuPending: false })
        setShowChoice(false)
      }}
    />
  )
}

function EventForm() {
  const navigate = useNavigate()
  const session = useDemoStore((state) => state.session)
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)
  const [form, setForm] = useState<IntakeForm>(() =>
    loadIntakeFormDraft(session, { ...intentToForm(order.intent), ...blankBasics() }),
  )
  const [errors, setErrors] = useState<IntakeErrors>({})
  const [prefilled] = useState(() => loadPlanningState(session).prefilled)
  const [draftSaved, setDraftSaved] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const draftButtonRef = useRef<HTMLButtonElement>(null)
  const selectedDate = form.eventDate ? parseISO(form.eventDate) : undefined
  const earliestDate = parseISO(clock.slice(0, 10))

  function set<K extends IntakeField>(field: K, value: IntakeForm[K]) {
    const next = { ...form, [field]: value }
    setForm(next)
    setDraftSaved(saveIntakeFormDraft(session, next))
    flash(draftButtonRef.current)
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function saveDraft() {
    setDraftSaved(saveIntakeFormDraft(session, form))
    flash(draftButtonRef.current)
  }

  function toggleDietary(tag: DietaryTag) {
    set(
      'dietary',
      form.dietary.includes(tag)
        ? form.dietary.filter((item) => item !== tag)
        : [...form.dietary, tag],
    )
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = sectionErrors(validateForm(form, clock, catalog), 'basics')
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      formRef.current
        ?.querySelector<HTMLElement>(`#${CSS.escape(firstInvalid)}`)
        ?.focus()
      return
    }

    saveIntakeFormDraft(session, form)
    if (prefilled) savePlanningState(session, { ...loadPlanningState(session), prefilled: false })
    updateDraft({
      intent: {
        ...order.intent,
        ...formToIntent({
          ...intentToForm(order.intent),
          eventType: form.eventType,
          guestCount: form.guestCount,
          eventDate: form.eventDate,
          fulfillment: form.fulfillment,
          dietary: form.dietary,
          budget: form.budget,
        }),
      },
    })
    navigate(stagePath('menu'))
  }

  return (
    <div className="w-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
      <section className="mx-auto w-full max-w-3xl">
        <h1 className="type-page-title mb-8 text-foreground">
          Plan your catering
        </h1>

        {prefilled && (
          <Alert className="mb-6">
            <AlertDescription>Filled in from your answers. Check each field, change anything, then continue.</AlertDescription>
          </Alert>
        )}

        <form ref={formRef} onSubmit={onSubmit} noValidate>
          {Object.values(errors).filter(Boolean).length > 1 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Fix these to continue</AlertTitle>
              <AlertDescription>
                <ul className="list-inside list-disc space-y-1">
                  {(Object.entries(errors) as Array<[IntakeField, string | undefined]>).map(
                    ([field, message]) =>
                      message && (
                        <li key={field}>
                          <a href={`#${field}`}>
                            {errorFieldLabels[field] ?? 'Answer'}: {message}
                          </a>
                        </li>
                      ),
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <FieldSet>
            <FieldLegend className="sr-only">Event details</FieldLegend>
            <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.eventType) || undefined} className="sm:col-span-2">
                <FieldLabel htmlFor="eventType">Event type</FieldLabel>
                <Select
                  items={eventTypeItems}
                  value={form.eventType || null}
                  onValueChange={(value) => set('eventType', String(value ?? ''))}
                  name="eventType"
                  required
                >
                  <SelectTrigger
                    id="eventType"
                    className="w-full text-body data-[size=default]:h-11"
                    aria-required="true"
                    aria-invalid={Boolean(errors.eventType)}
                    aria-describedby={errors.eventType ? 'eventType-error' : undefined}
                  >
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {eventTypeItems.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.eventType && <FieldError id="eventType-error">{errors.eventType}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.guestCount) || undefined}>
                <FieldLabel htmlFor="guestCount">Guests</FieldLabel>
                <Input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  className="h-11 md:text-body"
                  inputMode="numeric"
                  min={1}
                  max={5000}
                  required
                  value={form.guestCount}
                  aria-invalid={Boolean(errors.guestCount)}
                  aria-describedby={errors.guestCount ? 'guestCount-error' : undefined}
                  onChange={(event) => set('guestCount', event.target.value)}
                />
                {errors.guestCount && <FieldError id="guestCount-error">{errors.guestCount}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.eventDate) || undefined}>
                <FieldLabel htmlFor="eventDate">Date</FieldLabel>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        id="eventDate"
                        type="button"
                        variant="outline"
                        data-empty={!selectedDate}
                        aria-required="true"
                        aria-invalid={Boolean(errors.eventDate)}
                        aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
                        className="h-11 w-full justify-between text-left text-body font-normal data-[empty=true]:text-muted-foreground"
                      >
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Please select</span>}
                        <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (!date) return
                        set('eventDate', format(date, 'yyyy-MM-dd'))
                        setDatePickerOpen(false)
                      }}
                      defaultMonth={selectedDate ?? earliestDate}
                      disabled={{ before: earliestDate }}
                    />
                  </PopoverContent>
                </Popover>
                {errors.eventDate && <FieldError id="eventDate-error">{errors.eventDate}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.fulfillment) || undefined}>
                <FieldLabel htmlFor="fulfillment">Pickup or delivery</FieldLabel>
                <Select
                  items={fulfillmentItems}
                  value={form.fulfillment || null}
                  onValueChange={(value) => set('fulfillment', (value ?? '') as Fulfillment | '')}
                  name="fulfillment"
                  required
                >
                  <SelectTrigger
                    id="fulfillment"
                    className="w-full text-body data-[size=default]:h-11"
                    aria-required="true"
                    aria-invalid={Boolean(errors.fulfillment)}
                    aria-describedby={errors.fulfillment ? 'fulfillment-error' : undefined}
                  >
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {fulfillmentItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.fulfillment && <FieldError id="fulfillment-error">{errors.fulfillment}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.budget) || undefined}>
                <FieldLabel htmlFor="budget">Budget (optional)</FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupAddon aria-hidden="true">$</InputGroupAddon>
                  <InputGroupInput
                    id="budget"
                    name="budget"
                    inputMode="decimal"
                    placeholder="800"
                    className="md:text-body"
                    value={form.budget}
                    aria-invalid={Boolean(errors.budget)}
                    aria-describedby={errors.budget ? 'budget-error' : undefined}
                    onChange={(event) => set('budget', event.target.value)}
                  />
                </InputGroup>
                {errors.budget && <FieldError id="budget-error">{errors.budget}</FieldError>}
              </Field>

              <FieldSet className="sm:col-span-2">
                <FieldLegend variant="label">Dietary needs (optional)</FieldLegend>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <label
                      key={option.id}
                      htmlFor={`dietary-${option.id}`}
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-input bg-background px-3.5 text-body transition-colors duration-150 hover:bg-secondary has-data-checked:border-foreground has-data-checked:bg-secondary has-focus-visible:ring-2 has-focus-visible:ring-ring md:min-h-10"
                    >
                      <Checkbox
                        id={`dietary-${option.id}`}
                        name="dietary"
                        value={option.id}
                        checked={form.dietary.includes(option.id)}
                        onCheckedChange={() => toggleDietary(option.id)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </FieldSet>
            </div>
          </FieldSet>

          <div className="mt-8 flex justify-end gap-2">
            <span role="status" aria-live="polite">
              <Button
                ref={draftButtonRef}
                type="button"
                variant="outline"
                onClick={saveDraft}
              >
                {draftSaved && <span data-icon-surface className="inline-flex text-success"><CheckCircle2Icon aria-hidden="true" /></span>}
                {draftSaved ? 'Draft saved' : 'Save draft'}
              </Button>
            </span>
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
