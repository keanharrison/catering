import { describe, expect, it } from 'vitest'
import { catalog, type OrderIntent, type Scenario } from '../data'
import { businessHoursBetween, detectExceptions, estimate, recommend } from './index'

const routine = catalog.scenarios.find((s) => s.id === 'routine') as Scenario
const unusual = catalog.scenarios.find((s) => s.id === 'unusual') as Scenario

function flagsFor(intent: OrderIntent, now: string) {
  const { lines } = recommend(intent)
  return detectExceptions({ intent, lines, now })
}

function flagCodes(intent: OrderIntent, now: string) {
  return flagsFor(intent, now).map((f) => f.code)
}

describe('businessHoursBetween', () => {
  it('counts weekday hours and skips the weekend', () => {
    expect(businessHoursBetween('2026-10-13T09:00', '2026-10-15T17:00')).toBe(56)
    expect(businessHoursBetween('2026-10-13T09:00', '2026-10-19T12:00')).toBe(99)
  })

  it('returns 0 when the end is not after the start', () => {
    expect(businessHoursBetween('2026-10-15T09:00', '2026-10-13T09:00')).toBe(0)
  })
})

describe('recommend', () => {
  it('proposes trays, sides and an explanation for each line (routine)', () => {
    const { lines } = recommend(routine.intent)
    const units = Object.fromEntries(lines.map((l) => [l.itemId, l.units]))
    expect(units['sous-poulet']).toBe(2)
    expect(units['curry-chicken']).toBe(2)
    expect(units['curry-tofu']).toBe(1)
    expect(units['kale-salad']).toBe(4)
    for (const line of lines) {
      expect(line.reason.length).toBeGreaterThan(0)
      expect(line.assumptions.length).toBeGreaterThan(0)
    }
  })

  it('covers every guest with entree servings', () => {
    for (const s of [routine, unusual]) {
      const { lines } = recommend(s.intent)
      const result = estimate(lines, s.intent.guestCount)
      expect(result.entreeShortfall, s.id).toBe(0)
    }
  })

  it('adds no plant-based entree when no plant-based need is listed', () => {
    const { lines } = recommend({ ...routine.intent, dietary: [] })
    expect(lines.some((l) => l.itemId === 'curry-tofu')).toBe(false)
  })

  it('does not invent an answer when the guest count is missing', () => {
    const result = recommend({ ...routine.intent, guestCount: null })
    expect(result.lines).toEqual([])
    expect(result.notes.length).toBeGreaterThan(0)
  })

  it('is repeatable', () => {
    expect(recommend(unusual.intent)).toEqual(recommend(unusual.intent))
  })
})

describe('estimate', () => {
  it('totals line costs and reports cost per guest', () => {
    const { lines } = recommend(routine.intent)
    const result = estimate(lines, 40)
    expect(result.subtotalCents).toBe(106_400)
    expect(result.costPerGuestCents).toBe(2_660)
  })

  it('reports a shortfall and a below-minimum line after an edit', () => {
    const result = estimate([{ itemId: 'sous-poulet', units: 1 }], 40)
    expect(result.entreeShortfall).toBe(28)
    expect(estimate([{ itemId: 'box-salad', units: 3 }], 3).lines[0].belowMinimum).toBe(true)
  })
})

describe('detectExceptions', () => {
  it('matches each scenario expectedFlags exactly', () => {
    for (const s of [routine, unusual]) {
      expect(flagCodes(s.intent, s.now).sort(), s.id).toEqual([...s.expectedFlags].sort())
    }
  })

  it('explains every flag', () => {
    for (const flag of flagsFor(unusual.intent, unusual.now)) {
      expect(flag.reason.length, flag.code).toBeGreaterThan(0)
    }
  })

  it('flags a missing headcount', () => {
    expect(flagCodes({ ...routine.intent, guestCount: null }, routine.now)).toContain(
      'unclear_headcount',
    )
  })

  it('flags short notice for a standard order', () => {
    const intent = { ...routine.intent, eventAt: '2026-10-14T12:00' }
    expect(flagCodes(intent, routine.now)).toContain('short_notice')
  })

  it('flags a budget below the estimate', () => {
    const intent = { ...routine.intent, budgetCents: 50_000 }
    expect(flagCodes(intent, routine.now)).toContain('budget_mismatch')
  })

  it('does not flag a vegetarian-only request on its own', () => {
    expect(flagCodes(routine.intent, routine.now)).not.toContain('dietary_complexity')
  })
})
