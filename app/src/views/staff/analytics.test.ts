import { describe, expect, it } from 'vitest'
import type { Order } from '../../data'
import { acceptedEvents, dailyCounts, eventTypeMix, fulfillmentMix, menuDemand, niceMax, smoothPath } from './analytics'

const clock = '2026-10-29T09:00:00'

function order(history: Array<[Order['status'] | null, Order['status'], string]>): Order {
  return { history: history.map(([from, to, at]) => ({ from, to, actor: 'system', at })) } as Order
}

describe('admin analytics counts', () => {
  it('counts each request on the day it arrived and the day it was accepted', () => {
    const points = dailyCounts([
      order([[null, 'draft', '2026-10-27T08:00'], ['draft', 'submitted', '2026-10-27T09:00'], ['submitted', 'confirmed', '2026-10-28T10:00']]),
      order([['draft', 'needs_review', '2026-10-28T12:00']]),
      order([['draft', 'submitted', '2026-09-01T12:00']]), // older than the window
    ], clock, 7)
    expect(points).toHaveLength(7)
    expect(points.at(-1)?.date).toBe('2026-10-29')
    const byDate = Object.fromEntries(points.map((point) => [point.date, point]))
    expect(byDate['2026-10-27']).toMatchObject({ received: 1, accepted: 0 })
    expect(byDate['2026-10-28']).toMatchObject({ received: 1, accepted: 1 })
    expect(points.reduce((sum, point) => sum + point.received, 0)).toBe(2)
  })

  it('is all zeros with no requests', () => {
    expect(dailyCounts([], clock).every((point) => point.received === 0 && point.accepted === 0)).toBe(true)
  })
})

describe('chart helpers', () => {
  it('rounds the axis top to a tidy number, never below 4', () => {
    expect([0, 3, 5, 7, 9, 13, 42].map(niceMax)).toEqual([4, 4, 5, 8, 10, 20, 50])
  })

  it('draws a smooth path that stays between its neighbours', () => {
    const path = smoothPath([[0, 10], [10, 0], [20, 0], [30, 10]])
    expect(path.startsWith('M0,10 C')).toBe(true)
    expect(smoothPath([])).toBe('')
    expect(smoothPath([[5, 5]])).toBe('M5,5')
  })
})

const request = (over: Record<string, unknown>) => ({ history: [], lines: [], status: 'submitted', intent: { eventType: 'wedding', fulfillment: 'pickup', guestCount: 10, eventAt: '2026-11-01T12:00' }, ...over }) as unknown as Order

describe('breakdowns', () => {
  it('ranks event types and fulfillment by how many requests chose them', () => {
    const orders = [
      request({}),
      request({ intent: { eventType: 'corporate-lunch', fulfillment: 'delivery' } }),
      request({ intent: { eventType: 'corporate-lunch', fulfillment: 'delivery' } }),
    ]
    expect(eventTypeMix(orders).map((row) => [row.id, row.value])).toEqual([['corporate-lunch', 2], ['wedding', 1]])
    expect(fulfillmentMix(orders).map((row) => [row.label, row.value])).toEqual([['Delivery', 2], ['Pickup', 1]])
  })

  it('totals menu quantities, skipping declined requests and supplies', () => {
    const orders = [
      request({ lines: [{ itemId: 'slow-roasted-pork', units: 3 }, { itemId: 'supplies-cups', units: 50 }] }),
      request({ lines: [{ itemId: 'slow-roasted-pork', units: 2 }] }),
      request({ status: 'rejected', lines: [{ itemId: 'slow-roasted-pork', units: 99 }] }),
    ]
    const demand = menuDemand(orders)
    expect(demand).toHaveLength(1)
    expect(demand[0]).toMatchObject({ id: 'slow-roasted-pork', value: 5 })
  })

  it('splits accepted events into upcoming (soonest first) and completed, with guests', () => {
    const accepted = (eventAt: string, guestCount: number) => request({ status: 'confirmed', intent: { eventType: 'wedding', fulfillment: 'pickup', guestCount, eventAt } })
    const result = acceptedEvents([
      accepted('2026-11-05T12:00', 20), accepted('2026-10-30T12:00', 15), accepted('2026-10-01T12:00', 40), request({}),
    ], clock)
    expect(result.upcoming.map((order) => order.intent.eventAt)).toEqual(['2026-10-30T12:00', '2026-11-05T12:00'])
    expect(result.upcomingGuests).toBe(35)
    expect(result).toMatchObject({ completed: 1, completedGuests: 40 })
  })
})
