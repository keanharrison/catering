import { addDays, format, parseISO } from 'date-fns'
import { catalog, type OrderLine } from '../../data'
import { MAX_GUESTS, formToIntent, type IntakeForm } from './intake'
import { recommend } from '../../engine'

/**
 * The New Request assistant: up to eight questions, one at a time, then a proposed order built from the existing menu.
 * Scripted and rule-based; it fills in the same form the customer can edit by hand.
 */

export type QuestionId = 'eventType' | 'eventDate' | 'guests' | 'fulfillment' | 'dietary' | 'budget' | 'entree' | 'supplies'
export type EntreePref = 'chicken' | 'pork' | 'plant' | 'mix'
export type SupplyPref = 'full' | 'basic' | 'none'

export type AssistantState = {
  open: boolean
  /** The questions this customer still needs to answer, fixed when they begin so the progress count holds still. */
  plan: QuestionId[] | null
  index: number
  entree: EntreePref | ''
  supplies: SupplyPref | ''
  /** The proposed order, once built; the customer edits it here before continuing. */
  lines: OrderLine[] | null
}

export const emptyAssistant: AssistantState = { open: false, plan: null, index: 0, entree: '', supplies: '', lines: null }

export const entreeOptions: Array<{ id: EntreePref; label: string }> = [
  { id: 'chicken', label: 'Chicken' },
  { id: 'pork', label: 'Pork' },
  { id: 'plant', label: 'Plant-based' },
  { id: 'mix', label: 'A mix' },
]

export const supplyOptions: Array<{ id: SupplyPref; label: string }> = [
  { id: 'full', label: 'Plates, cutlery and cups' },
  { id: 'basic', label: 'Plates and cutlery' },
  { id: 'none', label: 'No supplies' },
]

/** Entrees each preference draws from. "A mix" keeps the menu's own defaults. */
const entreeIds: Record<EntreePref, string[] | null> = {
  chicken: ['jerk-chicken', 'curry-chicken'],
  pork: ['slow-roasted-pork'],
  plant: ['curry-tofu', 'creole-beans'],
  mix: null,
}

const supplyIds: Record<Exclude<SupplyPref, 'none'>, string> = {
  full: 'supplies-plates-cutlery-cups',
  basic: 'supplies-plates-cutlery',
}

export const parseGuests = (text: string): number | null => {
  const match = text.match(/\d[\d,]*/)
  const value = match ? Number(match[0].replace(/,/g, '')) : NaN
  return Number.isInteger(value) && value >= 1 && value <= MAX_GUESTS ? value : null
}

export function parseBudgetAmount(text: string): number | null {
  const value = Number(text.trim().replace(/[$,]/g, ''))
  return text.trim() !== '' && Number.isFinite(value) && value > 0 ? value : null
}

/** Questions the form has not already answered, in order. `defaultDate` is the date the form starts with, which does not count as an answer. */
export function questionsToAsk(form: IntakeForm, defaultDate: string): QuestionId[] {
  const questions: QuestionId[] = []
  if (!form.eventType) questions.push('eventType')
  if (!form.eventDate || form.eventDate === defaultDate) questions.push('eventDate')
  if (parseGuests(form.guestCount) === null) questions.push('guests')
  if (!form.fulfillment) questions.push('fulfillment')
  if (form.dietary.length === 0) questions.push('dietary')
  if (!form.budget.trim()) questions.push('budget')
  questions.push('entree', 'supplies')
  return questions
}

export const questionText: Record<QuestionId, string> = {
  eventType: 'What kind of event is it?',
  eventDate: 'What date is the event?',
  guests: 'About how many guests?',
  fulfillment: 'Pickup or delivery?',
  dietary: 'Any dietary needs? Choose all that apply.',
  budget: 'Do you have a food budget in mind?',
  entree: 'Which entree do you lean toward?',
  supplies: 'Do you need plates and cutlery?',
}

/** Quick date choices counted from the earliest date the form allows. */
export function quickDates(earliest: string): Array<{ label: string; value: string }> {
  const start = parseISO(earliest)
  return [
    { label: 'Tomorrow', value: format(addDays(start, 1), 'yyyy-MM-dd') },
    { label: 'In a week', value: format(addDays(start, 7), 'yyyy-MM-dd') },
    { label: 'In two weeks', value: format(addDays(start, 14), 'yyyy-MM-dd') },
  ]
}

/** Items and quantities from the existing menu and portion rules, shaped by the entree and supply answers. Empty until there is a guest count. */
export function proposeOrder(form: IntakeForm, entree: EntreePref | '', supplies: SupplyPref | ''): OrderLine[] {
  const guests = parseGuests(form.guestCount)
  if (guests === null) return []
  const chosen = entree ? entreeIds[entree] : null
  const rules = chosen ? { ...catalog, recommendationDefaults: { ...catalog.recommendationDefaults, defaultEntreeIds: chosen } } : catalog
  const intent = { ...formToIntent(form), guestCount: guests }
  const lines: OrderLine[] = recommend(intent, rules).lines.map(({ itemId, units }) => ({ itemId, units }))
  if (supplies && supplies !== 'none') lines.push({ itemId: supplyIds[supplies], units: guests })
  return lines
}

const KEY = 'x-assistant'

export function loadAssistant(session: number): AssistantState {
  try {
    const stored = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as { session?: number; value?: Partial<AssistantState> } | null
    if (stored?.session === session && stored.value) return { ...emptyAssistant, ...stored.value }
  } catch {
    // Storage can be unavailable; the assistant still works for this visit.
  }
  return emptyAssistant
}

export function saveAssistant(session: number, value: AssistantState) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ session, value }))
  } catch {
    // See above.
  }
}
