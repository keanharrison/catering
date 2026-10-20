import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { CheckCircle2Icon, ChevronDownIcon } from '../../components/icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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

const dietaryOptions: Array<{ id: DietaryTag; label: string }> = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
]

const eventTypeItems = catalog.eventTypes.map(({ id, label }) => ({
  label,
  value: id,
}))

const errorFieldLabels: Partial<Record<IntakeField, string>> = {
  eventType: 'Event type',
  guestCount: 'Guests',
  eventDate: 'Date',
  budget: 'Budget',
}

/** Opening New request while a submitted request is active starts a fresh draft, so edits are never silently dropped. */
export function EventPage() {
  const status = useDemoStore((state) => state.order.status)
  const activateDraft = useDemoStore((state) => state.activateDraft)
  useEffect(() => {
    if (status !== 'draft') activateDraft()
  }, [status, activateDraft])
  return status === 'draft' ? <EventForm /> : null
}

function EventForm() {
  const navigate = useNavigate()
  const session = useDemoStore((state) => state.session)
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)
  const [form, setForm] = useState<IntakeForm>(() =>
    loadIntakeFormDraft(session, { ...intentToForm(order.intent), dietary: [] }),
  )
  const [errors, setErrors] = useState<IntakeErrors>({})
  const [draftSaved, setDraftSaved] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const selectedDate = form.eventDate ? parseISO(form.eventDate) : undefined
  const earliestDate = parseISO(clock.slice(0, 10))

  function set<K extends IntakeField>(field: K, value: IntakeForm[K]) {
    const next = { ...form, [field]: value }
    setForm(next)
    setDraftSaved(saveIntakeFormDraft(session, next))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function saveDraft() {
    setDraftSaved(saveIntakeFormDraft(session, form))
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
        <h1 className="type-page-title mb-6 text-foreground">
          Plan your catering
        </h1>

        <Card className="w-full">
          <form ref={formRef} onSubmit={onSubmit} noValidate>
            <CardContent>
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
              <FieldGroup className="gap-6">
            <FieldSet>
              <FieldLegend className="sr-only">Event details</FieldLegend>
              <FieldGroup>
                <Field data-invalid={Boolean(errors.eventType) || undefined}>
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
                      className="w-full data-[size=default]:h-11"
                      aria-required="true"
                      aria-invalid={Boolean(errors.eventType)}
                      aria-describedby={errors.eventType ? 'eventType-error' : undefined}
                    >
                      <SelectValue placeholder="Choose one" />
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
                    className="h-11"
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
                          className="h-11 w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                        >
                          {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
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
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend variant="label">Pickup or delivery</FieldLegend>
              <RadioGroup
                name="fulfillment"
                className="gap-0"
                value={form.fulfillment}
                onValueChange={(value) => set('fulfillment', value as Fulfillment)}
              >
                <Field orientation="horizontal" className="min-h-9">
                  <RadioGroupItem id="pickup" value="pickup" className="after:-inset-x-4 after:-inset-y-4" />
                  <FieldLabel htmlFor="pickup">Pickup</FieldLabel>
                </Field>
                <Field orientation="horizontal" className="min-h-9">
                  <RadioGroupItem id="delivery" value="delivery" className="after:-inset-x-4 after:-inset-y-4" />
                  <FieldLabel htmlFor="delivery">Delivery</FieldLabel>
                </Field>
              </RadioGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend variant="label">Dietary needs (optional)</FieldLegend>
              <FieldGroup className="gap-0">
                {dietaryOptions.map((option) => (
                  <Field key={option.id} orientation="horizontal" className="min-h-9">
                    <Checkbox
                      id={`dietary-${option.id}`}
                      name="dietary"
                      value={option.id}
                      checked={form.dietary.includes(option.id)}
                      onCheckedChange={() => toggleDietary(option.id)}
                      className="after:-inset-x-4 after:-inset-y-4"
                    />
                    <FieldLabel htmlFor={`dietary-${option.id}`}>{option.label}</FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>

            <Field data-invalid={Boolean(errors.budget) || undefined}>
              <FieldLabel htmlFor="budget">Budget (optional)</FieldLabel>
              <InputGroup>
                <InputGroupAddon aria-hidden="true">$</InputGroupAddon>
                <InputGroupInput
                  id="budget"
                  name="budget"
                  inputMode="decimal"
                  placeholder="1,200"
                  value={form.budget}
                  aria-invalid={Boolean(errors.budget)}
                  aria-describedby={errors.budget ? 'budget-error' : undefined}
                  onChange={(event) => set('budget', event.target.value)}
                />
              </InputGroup>
              {errors.budget && <FieldError id="budget-error">{errors.budget}</FieldError>}
            </Field>

              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <span role="status" aria-live="polite">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 px-4"
                  onClick={saveDraft}
                >
                  {draftSaved && <CheckCircle2Icon aria-hidden="true" />}
                  {draftSaved ? 'Draft saved' : 'Save draft'}
                </Button>
              </span>
              <Button type="submit" className="min-h-11 px-4">
                Continue
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>
    </div>
  )
}
