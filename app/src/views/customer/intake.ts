import type { Catalog, DietaryTag, Fulfillment, OrderIntent } from '../../data'

/** Form values as typed (strings), kept separate from the typed order intent. */
export type IntakeForm = {
  contactName: string
  email: string
  phone: string
  organization: string
  deliveryAddress: string
  deliveryCity: string
  deliveryState: string
  deliveryZip: string
  eventType: string
  guestCount: string
  eventDate: string
  eventTime: string
  /** Empty until the customer chooses on the first page. */
  fulfillment: Fulfillment | ''
  dietary: DietaryTag[]
  budget: string
  notes: string
  customRequest: string
}

export type IntakeField = keyof IntakeForm
export type IntakeErrors = Partial<Record<IntakeField, string>>

const FORM_DRAFT_STORAGE_KEY = 'pi2go-customer-form-draft'

type StoredIntakeForm = { session: number; form: IntakeForm }

function isIntakeForm(value: unknown): value is IntakeForm {
  if (!value || typeof value !== 'object') return false
  const form = value as Record<string, unknown>
  const textFields: IntakeField[] = [
    'contactName', 'email', 'phone', 'organization', 'deliveryAddress', 'deliveryCity', 'deliveryState', 'deliveryZip',
    'eventType', 'guestCount', 'eventDate', 'eventTime', 'budget', 'notes', 'customRequest',
  ]
  return (
    textFields.every((field) => typeof form[field] === 'string') &&
    (form.fulfillment === '' || form.fulfillment === 'pickup' || form.fulfillment === 'delivery') &&
    Array.isArray(form.dietary) && form.dietary.every((tag) => ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy'].includes(tag))
  )
}

/** Keep in-progress answers across customer-stage navigation in the current browser tab. */
export function loadIntakeFormDraft(session: number, fallback: IntakeForm): IntakeForm {
  try {
    const stored = sessionStorage.getItem(FORM_DRAFT_STORAGE_KEY)
    if (!stored) return fallback
    const draft = JSON.parse(stored) as Partial<StoredIntakeForm>
    if (draft.session === session && isIntakeForm(draft.form)) return draft.form
    sessionStorage.removeItem(FORM_DRAFT_STORAGE_KEY)
  } catch {
    // Storage may be unavailable in private or restricted browsing contexts.
  }
  return fallback
}

export function saveIntakeFormDraft(session: number, form: IntakeForm): boolean {
  try {
    sessionStorage.setItem(FORM_DRAFT_STORAGE_KEY, JSON.stringify({ session, form } satisfies StoredIntakeForm))
    return true
  } catch {
    // The form still works if this browser blocks session storage.
    return false
  }
}

/** True when this session already has in-progress answers. */
export function hasIntakeFormDraft(session: number): boolean {
  try {
    const stored = sessionStorage.getItem(FORM_DRAFT_STORAGE_KEY)
    return stored !== null && (JSON.parse(stored) as Partial<StoredIntakeForm>).session === session
  } catch {
    return false
  }
}

export function clearIntakeFormDraft(session: number): void {
  try {
    const stored = sessionStorage.getItem(FORM_DRAFT_STORAGE_KEY)
    if (stored && (JSON.parse(stored) as Partial<StoredIntakeForm>).session === session) {
      sessionStorage.removeItem(FORM_DRAFT_STORAGE_KEY)
    }
  } catch {
    // Nothing to clear when storage is unavailable or malformed.
  }
}

/** The two form sections: event basics up front, final details later. */
export type FormSection = 'basics' | 'details'

export const sectionFields: Record<FormSection, IntakeField[]> = {
  basics: ['eventType', 'guestCount', 'eventDate', 'fulfillment', 'dietary', 'budget'],
  details: ['eventTime', 'contactName', 'email', 'phone', 'organization', 'deliveryAddress', 'deliveryCity', 'deliveryState', 'deliveryZip', 'customRequest', 'notes'],
}

export const MAX_GUESTS = 5000
export const INTAKE_LIMITS = {
  contactName: 120,
  email: 254,
  phone: 40,
  organization: 120,
  deliveryAddress: 200,
  deliveryCity: 100,
  deliveryState: 100,
  deliveryZip: 20,
  customRequest: 2000,
  notes: 2000,
} as const
/** Time of day used until the customer picks one in the final details. */
export const DEFAULT_TIME = '12:00'

export function intentToForm(intent: OrderIntent): IntakeForm {
  const [eventDate = '', eventTime = DEFAULT_TIME] = intent.eventAt.split('T')
  return {
    contactName: intent.contactName,
    email: intent.email,
    phone: intent.phone,
    organization: intent.organization,
    deliveryAddress: intent.deliveryAddress,
    deliveryCity: intent.deliveryCity,
    deliveryState: intent.deliveryState,
    deliveryZip: intent.deliveryZip,
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
    email: form.email.trim(),
    phone: form.phone.trim(),
    organization: form.organization.trim(),
    deliveryAddress: form.deliveryAddress.trim(),
    deliveryCity: form.deliveryCity.trim(),
    deliveryState: form.deliveryState.trim(),
    deliveryZip: form.deliveryZip.trim(),
    eventType: form.eventType,
    guestCount: parseGuests(form.guestCount),
    eventAt: `${form.eventDate}T${form.eventTime || DEFAULT_TIME}`,
    fulfillment: form.fulfillment || 'pickup',
    dietary: form.dietary,
    budgetCents: parseBudgetCents(form.budget),
    notes: form.notes.trim(),
    customRequest: form.customRequest.trim(),
  }
}

/** Returns an error message per invalid field. An empty object means the form is valid. */
export function validateForm(form: IntakeForm, now: string, catalog: Catalog): IntakeErrors {
  const errors: IntakeErrors = {}

  for (const [field, limit] of Object.entries(INTAKE_LIMITS) as Array<[keyof typeof INTAKE_LIMITS, number]>) {
    if (form[field].length > limit) errors[field] = `Keep this answer to ${limit} characters or fewer.`
  }

  if (form.eventTime.trim() === '') errors.eventTime = 'Choose a pickup or delivery time.'
  if (form.contactName.trim() === '') errors.contactName = 'Enter a contact name.'
  if (form.email.trim() === '') errors.email = 'Enter an email address.'
  else if (form.email.length <= INTAKE_LIMITS.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (form.phone.trim() === '') errors.phone = 'Enter a phone number.'
  if (form.fulfillment === 'delivery') {
    if (form.deliveryAddress.trim() === '') errors.deliveryAddress = 'Enter the delivery street address.'
    if (form.deliveryCity.trim() === '') errors.deliveryCity = 'Enter the delivery city.'
    if (form.deliveryState.trim() === '') errors.deliveryState = 'Enter the delivery state.'
    if (form.deliveryZip.trim() === '') errors.deliveryZip = 'Enter the delivery ZIP code.'
  }

  if (!catalog.eventTypes.some((e) => e.id === form.eventType)) {
    errors.eventType = 'Choose an event type.'
  }

  if (form.fulfillment !== 'pickup' && form.fulfillment !== 'delivery') {
    errors.fulfillment = 'Choose pickup or delivery.'
  }

  const guests = parseGuests(form.guestCount)
  if (guests === null || !Number.isInteger(guests) || guests < 1) {
    errors.guestCount = 'Enter a whole number of guests, at least 1.'
  } else if (guests > MAX_GUESTS) {
    errors.guestCount = `Enter a number up to ${MAX_GUESTS.toLocaleString('en-US')}.`
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.eventDate) || Number.isNaN(Date.parse(form.eventDate))) {
    errors.eventDate = 'Choose a date.'
  } else if (form.eventDate < now.slice(0, 10)) {
    errors.eventDate = 'Choose today or a future date.'
  }

  if (!/^\d{2}:\d{2}$/.test(form.eventTime)) errors.eventTime = 'Choose a time.'
  else if (
    /^\d{4}-\d{2}-\d{2}$/.test(form.eventDate) &&
    !Number.isNaN(Date.parse(form.eventDate)) &&
    Date.parse(`${form.eventDate}T${form.eventTime}`) <= Date.parse(now)
  ) {
    errors.eventTime = 'Choose a time in the future for your event date.'
  }

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
