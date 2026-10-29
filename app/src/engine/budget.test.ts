import { describe, expect, it } from 'vitest'
import { catalog, type OrderIntent } from '../data'
import { budgetStatus, foodCostCents, recommendForBudget } from './budget'
import { recommend } from './recommend'

const intent = (patch: Partial<OrderIntent> = {}): OrderIntent => ({
  contactName: '', email: '', phone: '', organization: '', deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryZip: '',
  eventType: 'wedding', guestCount: 40, eventAt: '2026-11-01T12:00', fulfillment: 'pickup', dietary: [], budgetCents: null, notes: '', customRequest: '', ...patch,
})
const asLines = (r: { lines: Array<{ itemId: string; units: number }> }) => r.lines.map(({ itemId, units }) => ({ itemId, units }))
const entreeServings = (lines: Array<{ itemId: string; units: number }>) =>
  lines.reduce((sum, l) => sum + (catalog.menu.find((i) => i.id === l.itemId)?.category === 'entree' ? l.units : 0), 0)
const baseCost = foodCostCents(asLines(recommend(intent())))

describe('budget-aware suggestions', () => {
  it('matches the standard suggestion when no budget is given', () => {
    const result = recommendForBudget(intent())
    expect(asLines(result)).toEqual(asLines(recommend(intent())))
    expect(result.fit.status).toBe('none')
    expect(result.fit.remainingCents).toBeNull()
    expect(result.fit.upgrades).toEqual([])
  })

  it('treats the budget as a ceiling: a roomy budget changes nothing and adds nothing', () => {
    const result = recommendForBudget(intent({ budgetCents: baseCost * 3 }))
    expect(asLines(result)).toEqual(asLines(recommend(intent())))
    expect(result.fit.status).toBe('within')
    expect(result.fit.totalCents).toBe(baseCost)
    expect(result.fit.remainingCents).toBe(baseCost * 3 - baseCost)
  })

  it('offers optional add-ons only when well under budget, and only ones that fit', () => {
    const roomy = recommendForBudget(intent({ budgetCents: baseCost * 2 }))
    expect(roomy.fit.upgrades.length).toBeGreaterThan(0)
    expect(roomy.fit.upgrades.every((u) => u.costCents <= roomy.fit.remainingCents!)).toBe(true)
    const snug = recommendForBudget(intent({ budgetCents: Math.round(baseCost * 1.05) }))
    expect(snug.fit.upgrades).toEqual([])
  })

  it('trims sides to fit a tight budget while still covering every guest with an entree', () => {
    const budget = baseCost - 3000
    const result = recommendForBudget(intent({ budgetCents: budget }))
    expect(result.fit.status).toBe('within')
    expect(result.fit.totalCents).toBeLessThanOrEqual(budget)
    expect(entreeServings(asLines(result))).toBe(40)
    expect(result.lines.length).toBeLessThan(recommend(intent()).lines.length)
    expect(result.fit.explanation).toMatch(/Left out/)
  })

  it('says plainly when the budget cannot be met, and does not cut below one entree per guest', () => {
    const result = recommendForBudget(intent({ budgetCents: 1000 }))
    expect(result.fit.status).toBe('over')
    expect(result.fit.remainingCents!).toBeLessThan(0)
    expect(entreeServings(asLines(result))).toBe(40)
    expect(result.fit.explanation).toMatch(/lowest-cost order/)
  })

  it('keeps add-ons within the dietary needs', () => {
    const result = recommendForBudget(intent({ budgetCents: 200000, dietary: ['vegan'] }))
    for (const upgrade of result.fit.upgrades) {
      expect(catalog.menu.find((i) => i.id === upgrade.itemId)?.dietaryTags).toContain('vegan')
    }
  })

  it('keeps what the customer already chose, and only fills in around it', () => {
    const existing = [{ itemId: 'slow-roasted-pork', units: 40 }, { itemId: 'tostones', units: 12 }, { itemId: 'supplies-cups', units: 40 }]
    const result = recommendForBudget(intent({ budgetCents: 500000 }), existing)
    const lines = asLines(result)
    expect(lines).toContainEqual({ itemId: 'slow-roasted-pork', units: 40 })
    expect(lines).toContainEqual({ itemId: 'tostones', units: 12 })
    expect(entreeServings(lines)).toBe(40) // their entrees already cover the guests
    expect(lines.some((l) => l.itemId === 'supplies-cups')).toBe(false) // supplies are not part of the food suggestion
  })

  it('computes totals against a budget for any set of lines', () => {
    expect(budgetStatus([{ itemId: 'slow-roasted-pork', units: 10 }], 5000)).toMatchObject({ totalCents: 6250, remainingCents: -1250, status: 'over' })
  })
})
