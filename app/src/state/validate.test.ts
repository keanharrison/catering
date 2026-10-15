import { describe, expect, it } from 'vitest'
import { catalog } from '../data'
import { createOrder } from './orderMachine'
import { isValidDemoState } from './validate'

const scenario = catalog.scenarios[0]
const good = () => ({ scenarioId: scenario.id, session: 3, clock: scenario.now, order: createOrder(scenario) })

describe('saved state validation', () => {
  it('accepts a real saved state', () => {
    expect(isValidDemoState(good())).toBe(true)
    const withItems = { ...good(), order: { ...createOrder(scenario), lines: [{ itemId: 'sous-poulet', units: 3 }] } }
    expect(isValidDemoState(withItems)).toBe(true)
  })

  it('rejects things that are not a state object', () => {
    for (const bad of [null, undefined, 'x', 42, [], {}]) expect(isValidDemoState(bad)).toBe(false)
  })

  it('rejects a missing, null or malformed order', () => {
    expect(isValidDemoState({ ...good(), order: null })).toBe(false)
    expect(isValidDemoState({ ...good(), order: {} })).toBe(false)
    expect(isValidDemoState({ ...good(), order: { ...good().order, status: 'bogus' } })).toBe(false)
    expect(isValidDemoState({ ...good(), order: { ...good().order, lines: 'nope' } })).toBe(false)
  })

  it('rejects unknown menu items, bad quantities and bad intent fields', () => {
    const order = good().order
    expect(isValidDemoState({ ...good(), order: { ...order, lines: [{ itemId: 'ghost', units: 1 }] } })).toBe(false)
    expect(isValidDemoState({ ...good(), order: { ...order, lines: [{ itemId: 'sous-poulet', units: -1 }] } })).toBe(false)
    expect(isValidDemoState({ ...good(), order: { ...order, intent: { ...order.intent, guestCount: '40' } } })).toBe(false)
    expect(isValidDemoState({ ...good(), order: { ...order, intent: { ...order.intent, eventAt: 'soon' } } })).toBe(false)
  })

  it('rejects an unknown scenario or a bad clock', () => {
    expect(isValidDemoState({ ...good(), scenarioId: 'nope' })).toBe(false)
    expect(isValidDemoState({ ...good(), clock: 'later' })).toBe(false)
  })
})
