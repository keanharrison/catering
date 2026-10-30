import { describe, expect, it } from 'vitest'
import { defaultSort, requestId, sortRequests, updatedAt } from './requestFilters'
import type { Order } from '../../data'

const order = (id: string, at: string, guests = 10, messageAt?: string) =>
  ({
    id,
    status: 'submitted',
    intent: { contactName: id, organization: '', guestCount: guests, eventAt: '2026-11-01T12:00', fulfillment: 'pickup' },
    history: [{ from: null, to: 'draft', actor: 'system', at: '2026-01-01T00:00' }, { from: 'draft', to: 'submitted', actor: 'customer', at }],
    messages: messageAt ? [{ id: 'm1', author: 'staff', text: 'Hi', at: messageAt }] : [],
  }) as unknown as Order

describe('request list order', () => {
  it('puts the most recently updated request first by default', () => {
    const sorted = sortRequests([order('pi-0001', '2026-10-01T10:00'), order('pi-0003', '2026-10-12T09:00'), order('pi-0002', '2026-10-05T10:00')], defaultSort)
    expect(sorted.map((o) => o.id)).toEqual(['pi-0003', 'pi-0002', 'pi-0001'])
  })

  it('counts a message as an update', () => {
    const quiet = order('pi-0001', '2026-10-01T10:00', 10, '2026-10-20T08:00')
    expect(updatedAt(quiet)).toBe('2026-10-20T08:00')
    expect(sortRequests([order('pi-0002', '2026-10-12T09:00'), quiet], defaultSort)[0].id).toBe('pi-0001')
  })

  it('sorts numeric columns as numbers', () => {
    const sorted = sortRequests([order('pi-0001', '2026-10-01T10:00', 9), order('pi-0002', '2026-10-02T10:00', 120)], { key: 'guests', direction: 'desc' })
    expect(sorted.map((o) => o.id)).toEqual(['pi-0002', 'pi-0001'])
  })
})

describe('requestId', () => {
  it('formats numbered requests as PI-0001', () => {
    expect(requestId('pi-0007')).toBe('PI-0007')
  })
})
