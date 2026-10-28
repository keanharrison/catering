import { describe, expect, it } from 'vitest'
import { catalog, type Order, type Scenario } from '../../data'
import { createOrder } from '../../state/orderMachine'
import { answerQuestion, summarizeDashboard } from './dashboardSummary'

const routine = catalog.scenarios.find((s) => s.id === 'routine') as Scenario
const clock = routine.now

function order(id: string, patch: Partial<Order> = {}): Order {
  return { ...createOrder(routine), id, ...patch }
}

const blank = order('draft', { intent: { ...routine.intent, eventType: '', guestCount: null } })

describe('dashboard summary', () => {
  it('counts nothing for a brand-new customer', () => {
    const summary = summarizeDashboard([], blank, clock)
    expect(summary).toMatchObject({ drafts: 0, active: [], past: [], threads: [], needsAction: [], nextEvent: null })
  })

  it('counts a started draft once', () => {
    expect(summarizeDashboard([], order('d'), clock).drafts).toBe(1)
  })

  it('files requests with the same rules as the orders pages and skips sample fixtures', () => {
    const upcoming = order('a', { status: 'confirmed', intent: { ...routine.intent, eventAt: '2026-12-01T12:00' } })
    const done = order('b', { status: 'confirmed', intent: { ...routine.intent, eventAt: '2026-01-01T12:00' } })
    const declined = order('c', { status: 'rejected' })
    const sample = order('s', { status: 'submitted', demoSample: true })
    const summary = summarizeDashboard([upcoming, done, declined, sample], blank, clock)
    expect(summary.active.map((o) => o.id)).toEqual(['a'])
    expect(summary.past.map((o) => o.id).sort()).toEqual(['b', 'c'])
    expect(summary.nextEvent?.id).toBe('a')
  })

  it('flags requests waiting on the customer and counts message threads', () => {
    const waiting = order('w', {
      status: 'needs_review',
      messages: [{ id: 'm1', author: 'staff', text: 'Which entrée?', at: '2026-10-13T10:00' }],
    })
    const summary = summarizeDashboard([waiting], blank, clock)
    expect(summary.needsAction.map((o) => o.id)).toEqual(['w'])
    expect(summary.threads).toHaveLength(1)
  })
})

describe('assistant answers', () => {
  const empty = summarizeDashboard([], blank, clock)
  const withActive = summarizeDashboard([order('a', { status: 'submitted' })], blank, clock)

  it('answers from the customer’s own requests', () => {
    expect(answerQuestion('What is the status of my request?', withActive).text).toContain('submitted')
    expect(answerQuestion('What is the status of my request?', empty).text).toContain('no active requests')
  })

  it('points drafts to New request and changes to Messages', () => {
    expect(answerQuestion('Do I have any drafts?', empty).href).toBe('/customer')
    expect(answerQuestion('How do I change a submitted request?', empty).href).toBe('/customer/messages')
  })

  it('does not overclaim on dietary questions', () => {
    expect(answerQuestion('Is the menu vegan friendly?', empty).text).toContain('not allergy or nutrition guarantees')
  })

  it('says what it can help with when it does not understand', () => {
    expect(answerQuestion('blorp', empty).text).toContain('I can answer questions about your requests')
  })
})
