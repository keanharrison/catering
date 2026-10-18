import { describe, expect, it } from 'vitest'
import { catalog, type Order, type Scenario } from '../data'
import { recommend } from '../engine'
import { accept, canAccept, createOrder as createBare, customerApprove, customerReply, requestClarification, revise, reject, submit, updateDraft, type Result } from './orderMachine'

const routine = catalog.scenarios.find((s) => s.id === 'routine') as Scenario
const unusual = catalog.scenarios.find((s) => s.id === 'unusual') as Scenario
const at = routine.now

/** A draft ready to submit: menu filled from the rule engine, supplies decided. */
function createOrder(scenario: Scenario): Order {
  const bare = createBare(scenario)
  const lines = recommend(scenario.intent).lines.map(({ itemId, units }) => ({ itemId, units }))
  return must(updateDraft(bare, { lines, suppliesChoice: 'none' }))
}

function must(result: Result): Order {
  if (!result.ok) throw new Error(`Expected success, got: ${result.error}`)
  return result.order
}

function refused(result: Result): string {
  if (result.ok) throw new Error('Expected the move to be refused')
  return result.error
}

describe('submission', () => {
  it('creates a draft from a scenario with an empty menu', () => {
    const order = createBare(routine)
    expect(order.status).toBe('draft')
    expect(order.lines).toEqual([])
    expect(order.suppliesChoice).toBeNull()
  })

  it('refuses to submit an empty order or one with no supplies decision', () => {
    expect(refused(submit(createBare(routine), at))).toMatch(/menu item/)
    const noSupplies = must(updateDraft(createOrder(routine), { suppliesChoice: null }))
    expect(refused(submit(noSupplies, at))).toMatch(/supplies/)
  })

  it('sends a routine order to submitted, not confirmed', () => {
    const order = must(submit(createOrder(routine), routine.now))
    expect(order.status).toBe('submitted')
    expect(order.flags).toEqual([])
  })

  it('sends a flagged order to needs_review and keeps the flags', () => {
    const order = must(submit(createOrder(unusual), unusual.now))
    expect(order.status).toBe('needs_review')
    expect(order.flags.map((f) => f.code).sort()).toEqual([...unusual.expectedFlags].sort())
  })

  it('cannot be submitted twice or edited after submitting', () => {
    const order = must(submit(createOrder(routine), at))
    expect(refused(submit(order, at))).toMatch(/draft/)
    expect(refused(updateDraft(order, { lines: [] }))).toMatch(/draft/)
  })
})

describe('guardrails', () => {
  it('cannot accept a draft', () => {
    expect(refused(accept(createOrder(routine), 'staff', at))).toBeTruthy()
  })

  it('does not let the customer accept', () => {
    const order = must(submit(createOrder(routine), at))
    expect(refused(accept(order, 'customer', at))).toMatch(/staff/)
  })

  it('does not let a flagged order jump straight to confirmed from submitted', () => {
    const flagged = { ...must(submit(createOrder(routine), at)), flags: [{ code: 'large_order' as const, reason: 'test' }] }
    expect(canAccept(flagged, 'staff').allowed).toBe(false)
  })

  it('blocks acceptance of a revised proposal until the customer approves', () => {
    let order = must(submit(createOrder(unusual), unusual.now))
    order = must(revise(order, order.lines, at))
    expect(order.status).toBe('awaiting_customer_approval')
    expect(refused(accept(order, 'staff', at))).toMatch(/not approved/)
    order = must(customerApprove(order, at))
    expect(must(accept(order, 'staff', at)).status).toBe('confirmed')
  })

  it('requires a new approval when staff revise again', () => {
    let order = must(submit(createOrder(unusual), unusual.now))
    order = must(customerApprove(must(revise(order, order.lines, at)), at))
    order = must(revise(order, order.lines, at))
    expect(order.revision).toBe('pending')
    expect(canAccept(order, 'staff').allowed).toBe(false)
  })

  it('treats confirmed and rejected orders as closed', () => {
    const confirmed = must(accept(must(submit(createOrder(routine), at)), 'staff', at))
    expect(refused(reject(confirmed, 'no', at))).toMatch(/closed/)
    expect(refused(customerReply(confirmed, 'hi', at))).toMatch(/closed/)
    const rejected = must(reject(must(submit(createOrder(routine), at)), 'Cannot fulfill.', at))
    expect(refused(accept(rejected, 'staff', at))).toBeTruthy()
  })
})

describe('full scenarios', () => {
  it('routine: submit then staff accept', () => {
    const order = must(accept(must(submit(createOrder(routine), at)), 'staff', at))
    expect(order.status).toBe('confirmed')
    expect(order.history.map((h) => h.to)).toEqual(['draft', 'submitted', 'confirmed'])
  })

  it('unusual: review, clarify, reply, revise, customer approves, staff accepts', () => {
    let order = must(submit(createOrder(unusual), unusual.now))
    order = must(requestClarification(order, 'Can the snack station be a standard tray instead?', at))
    order = must(customerReply(order, 'Yes, that works.', at))
    order = must(revise(order, order.lines, at))
    order = must(customerApprove(order, at))
    order = must(accept(order, 'staff', at))
    expect(order.status).toBe('confirmed')
    expect(order.flags.length).toBeGreaterThan(0)
    expect(order.messages.some((m) => m.author === 'staff')).toBe(true)
    expect(order.messages.some((m) => m.author === 'customer')).toBe(true)
  })
})
