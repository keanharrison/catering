import { describe, expect, it } from 'vitest'
import { catalog } from '../../data'
import { parseBudgetAmount, parseGuests, proposeOrder, questionsToAsk, quickDates } from './assistant'
import { intentToForm, type IntakeForm } from './intake'

const emptyIntent = {
  contactName: '', email: '', phone: '', organization: '', deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryZip: '',
  eventType: '', guestCount: null, eventAt: '', fulfillment: 'pickup' as const, dietary: [], budgetCents: null, notes: '', customRequest: '',
}
const blank: IntakeForm = { ...intentToForm(emptyIntent), eventDate: '2026-10-29', fulfillment: '' }
const form = (patch: Partial<IntakeForm>): IntakeForm => ({ ...blank, ...patch })

describe('assistant questions', () => {
  it('asks all eight on an empty form', () => {
    expect(questionsToAsk(blank, '2026-10-29')).toEqual(['eventType', 'eventDate', 'guests', 'fulfillment', 'dietary', 'budget', 'entree', 'supplies'])
  })

  it('skips whatever the form already answers', () => {
    const answered = form({ eventType: 'wedding', guestCount: '40', fulfillment: 'delivery', eventDate: '2026-11-07', dietary: ['vegan'], budget: '800' })
    expect(questionsToAsk(answered, '2026-10-29')).toEqual(['entree', 'supplies'])
    expect(questionsToAsk(form({ eventType: 'wedding' }), '2026-10-29')[0]).toBe('eventDate') // the starting date is not an answer
  })

  it('reads numbers the way people type them', () => {
    expect([parseGuests('about 40'), parseGuests('1,200'), parseGuests('0'), parseGuests('9999'), parseGuests('lots')]).toEqual([40, 1200, null, null, null])
    expect([parseBudgetAmount('$1,200'), parseBudgetAmount('0'), parseBudgetAmount('x')]).toEqual([1200, null, null])
  })

  it('offers quick dates counted from the earliest allowed day', () => {
    expect(quickDates('2026-10-13').map((d) => d.value)).toEqual(['2026-10-14', '2026-10-20', '2026-10-27'])
  })
})

describe('proposed order', () => {
  const known = (id: string) => catalog.menu.some((item) => item.id === id)

  it('is empty until there is a guest count', () => {
    expect(proposeOrder(blank, 'mix', 'none')).toEqual([])
  })

  it('uses only menu items, in their own units, and covers every guest with entrees', () => {
    const lines = proposeOrder(form({ guestCount: '40', eventType: 'wedding', fulfillment: 'pickup' }), 'mix', 'none')
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.every((line) => known(line.itemId) && line.units > 0)).toBe(true)
    const entreeServings = lines.filter((line) => catalog.menu.find((i) => i.id === line.itemId)?.category === 'entree').reduce((sum, line) => sum + line.units, 0)
    expect(entreeServings).toBe(40)
  })

  it('follows the entree preference and the supplies answer', () => {
    const base = form({ guestCount: '30', eventType: 'wedding', fulfillment: 'pickup' })
    const pork = proposeOrder(base, 'pork', 'none')
    expect(pork.some((line) => line.itemId === 'slow-roasted-pork')).toBe(true)
    expect(pork.some((line) => line.itemId === 'jerk-chicken')).toBe(false)
    expect(proposeOrder(base, 'plant', 'none').some((line) => line.itemId === 'curry-tofu')).toBe(true)
    const withSupplies = proposeOrder(base, 'mix', 'full')
    expect(withSupplies.at(-1)).toEqual({ itemId: 'supplies-plates-cutlery-cups', units: 30 })
    expect(proposeOrder(base, 'mix', 'none').some((line) => line.itemId.startsWith('supplies'))).toBe(false)
  })
})
