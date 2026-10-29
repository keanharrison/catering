import { describe, expect, it } from 'vitest'
import type { Order } from '../../data'
import { dailyCounts, niceMax, sampleCounts, smoothPath } from './analytics'

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

  it('is all zeros with no requests, and the sample is never all zeros', () => {
    expect(dailyCounts([], clock).every((point) => point.received === 0 && point.accepted === 0)).toBe(true)
    const sample = sampleCounts(clock)
    expect(sample.some((point) => point.received > 0)).toBe(true)
    expect(sample.every((point) => point.accepted <= point.received && point.received >= 0)).toBe(true)
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
