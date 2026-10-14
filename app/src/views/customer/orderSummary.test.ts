import { describe, expect, it } from 'vitest'
import { catalog } from '../../data'
import { recommend, setQuantity } from '../../engine'
import { createOrder } from '../../state/orderMachine'
import { menuEntries, supplyEntries } from './menuView'
import { buildOrderSummary } from './orderSummary'

const routine = catalog.scenarios[0]
const unusual = catalog.scenarios[1]

function withSuggestion(scenario: (typeof catalog.scenarios)[number]) {
  const order = createOrder(scenario)
  return { ...order, lines: recommend(order.intent).lines.map(({ itemId, units }) => ({ itemId, units })) }
}

describe('order summary', () => {
  it('starts empty: the customer has chosen nothing yet', () => {
    const summary = buildOrderSummary(createOrder(routine), routine.now)
    expect(summary.groups).toEqual([])
    expect(summary.hasFood).toBe(false)
    expect(summary.coverage.shortfall).toBe(40)
  })

  it('totals a built order and raises no flags for the routine scenario', () => {
    const summary = buildOrderSummary(withSuggestion(routine), routine.now)
    expect(summary.estimate.subtotalCents).toBe(61_290)
    expect(summary.coverage.shortfall).toBe(0)
    expect(summary.flags).toEqual([])
  })

  it('surfaces the unusual order flags', () => {
    const summary = buildOrderSummary(withSuggestion(unusual), unusual.now)
    expect(summary.flags.map((f) => f.code).sort()).toEqual([...unusual.expectedFlags].sort())
  })

  it('prices per-person supplies once per guest and does not count them as food', () => {
    const order = { ...createOrder(routine), lines: setQuantity([], 'supplies-plates-cutlery', 1) }
    const summary = buildOrderSummary(order, routine.now)
    expect(summary.estimate.subtotalCents).toBe(40 * 150)
    expect(summary.hasFood).toBe(false)
    expect(summary.groups[0].rows[0].quantityLabel).toBe('per person x 40')
  })

  it('updates coverage and total as quantities change', () => {
    const order = { ...createOrder(routine), lines: setQuantity([], 'sous-poulet', 25) }
    const summary = buildOrderSummary(order, routine.now)
    expect(summary.coverage).toEqual({ servings: 25, guests: 40, shortfall: 15 })
    expect(summary.estimate.subtotalCents).toBe(25 * 500)
  })
})

describe('menu view', () => {
  it('lists every observed item by category and nothing else in browse categories', () => {
    const order = createOrder(routine)
    expect(menuEntries(order, 'entree', []).length).toBe(7)
    expect(menuEntries(order, 'salad', []).length).toBe(2)
    expect(supplyEntries(order).length).toBe(7)
  })

  it('filters by dietary tag and requires every selected tag', () => {
    const order = createOrder(routine)
    const vegan = menuEntries(order, 'entree', ['vegan']).map((e) => e.item.id)
    expect(vegan).toEqual(['curry-tofu', 'creole-beans'])
    expect(menuEntries(order, 'entree', ['vegan', 'dairy-free'])).toEqual([])
  })

  it('shows quantities already chosen', () => {
    const order = { ...createOrder(routine), lines: setQuantity([], 'kale-salad', 6) }
    expect(menuEntries(order, 'salad', []).find((e) => e.item.id === 'kale-salad')?.quantity).toBe(6)
  })
})
