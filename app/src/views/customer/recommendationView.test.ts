import { describe, expect, it } from 'vitest'
import { catalog } from '../../data'
import { createOrder } from '../../state/orderMachine'
import { buildRecommendationView } from './recommendationView'

describe('recommendation view', () => {
  it('builds grouped rows from the engine for both scenarios', () => {
    for (const scenario of catalog.scenarios) {
      const view = buildRecommendationView(createOrder(scenario), scenario.now)
      expect(view.groups.map((g) => g.category), scenario.id).toEqual(['entree', 'side'])
      for (const row of view.groups.flatMap((g) => g.rows)) {
        expect(row.reason.length, row.itemId).toBeGreaterThan(0)
        expect(row.assumptions.length, row.itemId).toBeGreaterThan(0)
      }
      expect(view.estimate.entreeShortfall, scenario.id).toBe(0)
    }
  })

  it('totals the routine order and raises no flags', () => {
    const routine = catalog.scenarios[0]
    const view = buildRecommendationView(createOrder(routine), routine.now)
    expect(view.estimate.subtotalCents).toBe(106_400)
    expect(view.flags).toEqual([])
  })

  it('surfaces the unusual order flags and notes', () => {
    const unusual = catalog.scenarios[1]
    const view = buildRecommendationView(createOrder(unusual), unusual.now)
    expect(view.flags.map((f) => f.code).sort()).toEqual([...unusual.expectedFlags].sort())
    expect(view.notes.length).toBeGreaterThan(0)
  })

  it('has no rows when the guest count is missing', () => {
    const routine = catalog.scenarios[0]
    const order = createOrder({ ...routine, intent: { ...routine.intent, guestCount: null } })
    const view = buildRecommendationView(order, routine.now)
    expect(view.groups).toEqual([])
    expect(view.guestCount).toBeNull()
  })
})
