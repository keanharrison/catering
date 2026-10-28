import { describe, expect, it } from 'vitest'
import { catalog, type Order, type Scenario } from '../data'
import { createOrder } from '../state/orderMachine'
import { deriveNotifications } from './notifications'

const routine = catalog.scenarios.find((s) => s.id === 'routine') as Scenario

function order(id: string, patch: Partial<Order> = {}): Order {
  return { ...createOrder(routine), id, ...patch }
}

const change = (to: Order['status'], at: string, actor: 'staff' | 'customer' = 'staff') => ({ from: null, to, actor, at })

describe('notifications', () => {
  it('tells a customer about the team’s decisions, newest first, and skips their own actions and sample requests', () => {
    const accepted = order('a', { status: 'confirmed', history: [change('submitted', '2026-10-13T09:00', 'customer'), change('confirmed', '2026-10-13T11:00')] })
    const question = order('b', { status: 'needs_review', history: [change('needs_review', '2026-10-13T12:00')] })
    const sample = order('s', { status: 'confirmed', demoSample: true, history: [change('confirmed', '2026-10-13T13:00')] })
    const result = deriveNotifications([accepted, question, sample], 'customer')
    expect(result.map((item) => item.id)).toEqual(['b-0', 'a-1'])
    expect(result[1].title).toContain('was accepted')
    expect(result[1].href).toBe('/customer/orders?order=a')
  })

  it('points the team at requests waiting for review', () => {
    const waiting = order('w', { status: 'submitted', history: [change('submitted', '2026-10-13T09:00', 'customer')] })
    const done = order('d', { status: 'confirmed' })
    expect(deriveNotifications([waiting, done], 'team').map((item) => item.id)).toEqual(['w-review'])
  })

  it('is empty when nothing has happened', () => {
    expect(deriveNotifications([], 'customer')).toEqual([])
  })
})
