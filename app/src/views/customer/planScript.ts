import { catalog, type DietaryTag, type Fulfillment } from '../../data'
import { MAX_GUESTS, type IntakeForm } from './intake'

/** The short guided intake: five questions whose answers fill in the normal request. Scripted, not a language model. */

export type MealSize = 'light' | 'standard' | 'hearty'

export type PlanAnswers = {
  step: number
  eventType: string
  guests: string
  eventDate: string
  fulfillment: Fulfillment | ''
  dietary: DietaryTag[]
  mealSize: MealSize | ''
  preferences: string
}

export type PlanStepId = 'eventType' | 'guests' | 'when' | 'dietary' | 'extras'

export const planSteps: Array<{ id: PlanStepId; title: string; help: string; optional: boolean }> = [
  { id: 'eventType', title: 'What kind of event is it?', help: 'This helps us suggest the right amount and mix of food.', optional: false },
  { id: 'guests', title: 'How many guests?', help: 'An estimate is fine. You can change it later.', optional: false },
  { id: 'when', title: 'When is it, and how will you get the food?', help: 'Pick the event date and choose pickup or delivery.', optional: false },
  { id: 'dietary', title: 'Any dietary needs?', help: 'Tags are guides, not allergy guarantees. Mention any allergy in the last question so the team sees it.', optional: true },
  { id: 'extras', title: 'Anything else we should know?', help: 'Meal size and food preferences go to the team as a note. They do not change quantities.', optional: true },
]

export const dietaryOptions: Array<{ id: DietaryTag; label: string }> = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
]

export const mealSizeOptions: Array<{ id: MealSize; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'standard', label: 'Standard' },
  { id: 'hearty', label: 'Hearty' },
]

export const fulfillmentOptions: Array<{ id: Fulfillment; label: string }> = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'delivery', label: 'Delivery' },
]

export const PREFERENCES_LIMIT = 300

export function emptyAnswers(today: string): PlanAnswers {
  return { step: 0, eventType: '', guests: '', eventDate: today, fulfillment: '', dietary: [], mealSize: '', preferences: '' }
}

/** Reads the first whole number in what the customer typed ("about 40" gives 40). */
export function parseGuestCount(text: string): number | null {
  const match = text.match(/\d[\d,]*/)
  if (!match) return null
  const value = Number(match[0].replace(/,/g, ''))
  return Number.isInteger(value) ? value : null
}

/** A plain message when the step cannot move on yet, otherwise null. */
export function stepError(id: PlanStepId, answers: PlanAnswers, today: string): string | null {
  if (id === 'eventType') return catalog.eventTypes.some((type) => type.id === answers.eventType) ? null : 'Choose an event type.'
  if (id === 'guests') {
    const guests = parseGuestCount(answers.guests)
    if (guests === null || guests < 1) return 'Enter the number of guests, at least 1.'
    if (guests > MAX_GUESTS) return `Enter a number up to ${MAX_GUESTS.toLocaleString('en-US')}.`
    return null
  }
  if (id === 'when') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(answers.eventDate)) return 'Choose a date.'
    if (answers.eventDate < today) return 'Choose today or a future date.'
    if (answers.fulfillment === '') return 'Choose pickup or delivery.'
  }
  return null
}

/** The note the team reads; empty when nothing was said. */
export function composeNotes(answers: PlanAnswers): string {
  const parts: string[] = []
  const size = mealSizeOptions.find((option) => option.id === answers.mealSize)
  if (size) parts.push(`Meal size: ${size.label}.`)
  const preferences = answers.preferences.trim()
  if (preferences) parts.push(`Food preferences: ${preferences}`)
  return parts.join(' ')
}

/** Only fields the customer actually answered, so they never overwrite anything with blanks. */
export function answersToFormPatch(answers: PlanAnswers): Partial<IntakeForm> {
  const patch: Partial<IntakeForm> = {}
  if (answers.eventType) patch.eventType = answers.eventType
  const guests = parseGuestCount(answers.guests)
  if (guests !== null && guests >= 1 && guests <= MAX_GUESTS) patch.guestCount = String(guests)
  if (answers.fulfillment) {
    patch.fulfillment = answers.fulfillment
    patch.eventDate = answers.eventDate
  }
  if (answers.dietary.length) patch.dietary = answers.dietary
  const notes = composeNotes(answers)
  if (notes) patch.notes = notes
  return patch
}
