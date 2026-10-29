import { format, parseISO } from 'date-fns'
import { catalog, type DietaryTag, type Fulfillment } from '../../data'
import { MAX_GUESTS, type IntakeForm } from './intake'

/** The guided chat: six questions whose answers fill in the normal request. Scripted, not a language model. */

export type PlanAnswers = {
  /** How many questions are answered; equal to the number of steps once the chat is finished. */
  step: number
  eventType: string
  eventDate: string
  guests: string
  fulfillment: Fulfillment | ''
  dietary: DietaryTag[]
  /** Dollars as typed; empty when the customer skipped the question. */
  budget: string
}

export type PlanStepId = 'eventType' | 'eventDate' | 'guests' | 'fulfillment' | 'dietary' | 'budget'

export const planSteps: Array<{ id: PlanStepId; question: string }> = [
  { id: 'eventType', question: 'What kind of event are you planning?' },
  { id: 'eventDate', question: 'What date is the event?' },
  { id: 'guests', question: 'About how many guests will there be?' },
  { id: 'fulfillment', question: 'Will you pick the food up, or should we deliver it?' },
  { id: 'dietary', question: 'Any dietary needs? Choose all that apply, or none. These are guides, not allergy guarantees.' },
  { id: 'budget', question: 'Do you have a budget in mind? Enter a dollar amount, or skip this one.' },
]

export const dietaryOptions: Array<{ id: DietaryTag; label: string }> = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
]

export const fulfillmentOptions: Array<{ id: Fulfillment; label: string }> = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'delivery', label: 'Delivery' },
]

export function emptyAnswers(): PlanAnswers {
  return { step: 0, eventType: '', eventDate: '', guests: '', fulfillment: '', dietary: [], budget: '' }
}

/** Reads the first whole number in what the customer typed ("about 40" gives 40). */
export function parseGuestCount(text: string): number | null {
  const match = text.match(/\d[\d,]*/)
  if (!match) return null
  const value = Number(match[0].replace(/,/g, ''))
  return Number.isInteger(value) ? value : null
}

/** A dollar amount from "$1,200" or "800"; null when it is not a positive number. */
export function parseBudget(text: string): number | null {
  const value = Number(text.trim().replace(/[$,]/g, ''))
  return text.trim() !== '' && Number.isFinite(value) && value > 0 ? value : null
}

/** A plain message when the answer cannot be accepted yet, otherwise null. `today` is the earliest allowed date (yyyy-MM-dd). */
export function stepError(id: PlanStepId, answers: PlanAnswers, today: string): string | null {
  if (id === 'eventType') return catalog.eventTypes.some((type) => type.id === answers.eventType) ? null : 'Choose an event type.'
  if (id === 'eventDate') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(answers.eventDate)) return 'Choose a date.'
    return answers.eventDate < today ? 'Choose today or a future date.' : null
  }
  if (id === 'guests') {
    const guests = parseGuestCount(answers.guests)
    if (guests === null || guests < 1) return 'Enter the number of guests, at least 1.'
    if (guests > MAX_GUESTS) return `Enter a number up to ${MAX_GUESTS.toLocaleString('en-US')}.`
  }
  if (id === 'fulfillment' && answers.fulfillment === '') return 'Choose pickup or delivery.'
  if (id === 'budget' && answers.budget.trim() !== '' && parseBudget(answers.budget) === null) return 'Enter a dollar amount, or skip this question.'
  return null
}

/** What the customer's reply to a question reads as in the conversation. */
export function answerText(id: PlanStepId, answers: PlanAnswers): string {
  switch (id) {
    case 'eventType': return catalog.eventTypes.find((type) => type.id === answers.eventType)?.label ?? answers.eventType
    case 'eventDate': return answers.eventDate ? format(parseISO(answers.eventDate), 'PPP') : ''
    case 'guests': return `${parseGuestCount(answers.guests) ?? answers.guests} guests`
    case 'fulfillment': return fulfillmentOptions.find((option) => option.id === answers.fulfillment)?.label ?? ''
    case 'dietary': return answers.dietary.length ? dietaryOptions.filter((option) => answers.dietary.includes(option.id)).map((option) => option.label).join(', ') : 'No dietary needs'
    case 'budget': {
      const budget = parseBudget(answers.budget)
      return budget === null ? 'Skipped' : `$${budget.toLocaleString('en-US')}`
    }
  }
}

/** Only fields the customer actually answered, so they never overwrite anything with blanks. */
export function answersToFormPatch(answers: PlanAnswers): Partial<IntakeForm> {
  const patch: Partial<IntakeForm> = {}
  if (answers.eventType) patch.eventType = answers.eventType
  if (answers.eventDate) patch.eventDate = answers.eventDate
  const guests = parseGuestCount(answers.guests)
  if (guests !== null && guests >= 1 && guests <= MAX_GUESTS) patch.guestCount = String(guests)
  if (answers.fulfillment) patch.fulfillment = answers.fulfillment
  if (answers.dietary.length) patch.dietary = answers.dietary
  const budget = parseBudget(answers.budget)
  if (budget !== null) patch.budget = String(budget)
  return patch
}

/** The chat's answers from a form someone already started, so switching to AI keeps what they typed. The chat resumes at the first question still open. */
export function formToAnswers(form: IntakeForm): PlanAnswers {
  const guests = parseGuestCount(form.guestCount)
  const hasGuests = guests !== null && guests >= 1 && guests <= MAX_GUESTS
  const fulfillment = form.fulfillment === 'pickup' || form.fulfillment === 'delivery' ? form.fulfillment : ''
  // The date field starts on today, so it only counts as answered once something after it is.
  const dated = form.eventDate !== '' && (hasGuests || fulfillment !== '')
  const answers: PlanAnswers = {
    step: 0,
    eventType: catalog.eventTypes.some((type) => type.id === form.eventType) ? form.eventType : '',
    eventDate: dated ? form.eventDate : '',
    guests: hasGuests ? String(guests) : '',
    fulfillment,
    dietary: form.dietary,
    budget: parseBudget(form.budget) !== null ? form.budget : '',
  }
  const leading = [answers.eventType !== '', answers.eventDate !== '', answers.guests !== '', answers.fulfillment !== '']
  const open = leading.indexOf(false)
  answers.step = open === -1 ? 4 : open
  return answers
}
