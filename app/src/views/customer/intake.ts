import type { Catalog, DietaryTag, Fulfillment, OrderIntent } from '../../data'

/** Form values as typed (strings), kept separate from the typed order intent. */
export type IntakeForm = {
  contactName: string
  organization: string
  eventType: string
  guestCount: string
  eventDate: string
  eventTime: string
  fulfillment: Fulfillment
  dietary: DietaryTag[]
  budget: string
  notes: string
  customRequest: string
}

export type IntakeField = keyof IntakeForm
export type IntakeErrors = Partial<Record<IntakeField, string>>

/** The two form sections: event basics up front, final details later. */
export type FormSection = 'basics' | 'details'

export const sectionFields: Record<FormSection, IntakeField[]> = {
  basics: ['eventType', 'guestCount', 'eventDate', 'fulfillment', 'dietary', 'budget'],
  details: ['eventTime', 'contactName', 'organization', 'notes', 'customRequest'],
}

export const MAX_GUESTS = 5000
/** Time of day used until the customer picks one in the final details. */
export const DEFAULT_TIME = '12:00'

export function intentToForm(intent: OrderIntent): IntakeForm {
  const [eventDate = '', eventTime = DEFAULT_TIME] = intent.eventAt.split('T')
  return {
    contactName: intent.contactName,
    organization: intent.organization,
    eventType: intent.eventType,
    guestCount: intent.guestCount === null ? '' : String(intent.guestCount),
    eventDate,
    eventTime,
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
    eventAt: `${form.eventDate}T${form.eventTime || DEFAULT_TIME}`,
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

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.eventDate) || Number.isNaN(Date.parse(form.eventDate))) {
    errors.eventDate = 'Choose a date.'
  } else if (Date.parse(`${form.eventDate}T${form.eventTime || DEFAULT_TIME}`) <= Date.parse(now)) {
    errors.eventDate = 'Choose a date and time in the future.'
  }

  if (!/^\d{2}:\d{2}$/.test(form.eventTime)) errors.eventTime = 'Choose a time.'

  if (form.budget.trim() !== '') {
    const budget = parseBudgetCents(form.budget)
    if (budget === null || budget <= 0) errors.budget = 'Enter a dollar amount, or leave this blank.'
  }

  return errors
}

export function sectionErrors(errors: IntakeErrors, section: FormSection): IntakeErrors {
  const fields = sectionFields[section]
  return Object.fromEntries(Object.entries(errors).filter(([field]) => fields.includes(field as IntakeField)))
}
