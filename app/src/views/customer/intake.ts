import type { Catalog, DietaryTag, Fulfillment, OrderIntent } from '../../data'

/** Form values as typed (strings), kept separate from the typed order intent. */
export type IntakeForm = {
  contactName: string
  organization: string
  eventType: string
  guestCount: string
  eventAt: string
  fulfillment: Fulfillment
  dietary: DietaryTag[]
  budget: string
  notes: string
  customRequest: string
}

export type IntakeField = keyof IntakeForm
export type IntakeErrors = Partial<Record<IntakeField, string>>

export type StepId = 'event' | 'preferences' | 'contact'

export const intakeSteps: Array<{ id: StepId; label: string; fields: IntakeField[] }> = [
  { id: 'event', label: 'Event', fields: ['eventType', 'guestCount', 'eventAt', 'fulfillment'] },
  { id: 'preferences', label: 'Preferences', fields: ['dietary', 'budget', 'customRequest', 'notes'] },
  { id: 'contact', label: 'Contact', fields: ['contactName', 'organization'] },
]

export const MAX_GUESTS = 5000

export function intentToForm(intent: OrderIntent): IntakeForm {
  return {
    contactName: intent.contactName,
    organization: intent.organization,
    eventType: intent.eventType,
    guestCount: intent.guestCount === null ? '' : String(intent.guestCount),
    eventAt: intent.eventAt,
    fulfillment: intent.fulfillment,
    dietary: intent.dietary,
    budget: intent.budgetCents === null ? '' : String(intent.budgetCents / 100),
    notes: intent.notes,
    customRequest: intent.customRequest,
  }
}

function parseGuests(text: string): number | null {
  const value = Number(text.trim())
  return text.trim() === '' || !Number.isFinite(value) ? null : value
}

function parseBudgetCents(text: string): number | null {
  const value = Number(text.trim().replace(/[$,]/g, ''))
  return text.trim() === '' || !Number.isFinite(value) ? null : Math.round(value * 100)
}

/** Converts valid form values to an order intent. Run validateForm first. */
export function formToIntent(form: IntakeForm): OrderIntent {
  return {
    contactName: form.contactName.trim(),
    organization: form.organization.trim(),
    eventType: form.eventType,
    guestCount: parseGuests(form.guestCount),
    eventAt: form.eventAt,
    fulfillment: form.fulfillment,
    dietary: form.dietary,
    budgetCents: parseBudgetCents(form.budget),
    notes: form.notes.trim(),
    customRequest: form.customRequest.trim(),
  }
}

/** Returns an error message per invalid field. An empty object means the form is valid. */
export function validateForm(form: IntakeForm, now: string, catalog: Catalog): IntakeErrors {
  const errors: IntakeErrors = {}

  if (form.contactName.trim() === '') errors.contactName = 'Enter a contact name.'

  if (!catalog.eventTypes.some((e) => e.id === form.eventType)) {
    errors.eventType = 'Choose an event type.'
  }

  const guests = parseGuests(form.guestCount)
  if (guests === null || !Number.isInteger(guests) || guests < 1) {
    errors.guestCount = 'Enter a whole number of guests, at least 1.'
  } else if (guests > MAX_GUESTS) {
    errors.guestCount = `Enter a number up to ${MAX_GUESTS.toLocaleString('en-US')}.`
  }

  const eventTime = Date.parse(form.eventAt)
  if (form.eventAt === '' || Number.isNaN(eventTime)) {
    errors.eventAt = 'Choose a date and time.'
  } else if (eventTime <= Date.parse(now)) {
    errors.eventAt = 'Choose a date and time in the future.'
  }

  if (form.budget.trim() !== '') {
    const budget = parseBudgetCents(form.budget)
    if (budget === null || budget <= 0) errors.budget = 'Enter a dollar amount, or leave this blank.'
  }

  return errors
}

export function stepErrors(errors: IntakeErrors, step: StepId): IntakeErrors {
  const fields = intakeSteps.find((s) => s.id === step)?.fields ?? []
  return Object.fromEntries(Object.entries(errors).filter(([field]) => fields.includes(field as IntakeField)))
}
