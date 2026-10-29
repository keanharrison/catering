import { describe, expect, it } from 'vitest'
import { seedOrders } from '../../data/seedOrders'
import { eventName, lastActivity, matchesSearch, relativeTime, sortThreads, unreadCount } from './threads'

const byId = (id: string) => seedOrders.find((order) => order.id === id)!
const clock = '2026-10-13T09:00'

describe('conversation helpers', () => {
  it('counts customer messages not yet read, and drops them once read', () => {
    const owen = byId('pi-0010')
    expect(unreadCount(owen, {})).toBe(1)
    expect(unreadCount(owen, { 'pi-0010': ['pi-0010-m1'] })).toBe(0)
    expect(unreadCount(byId('pi-0009'), {})).toBe(0) // no messages
  })

  it('sorts by latest activity, newest first or oldest first', () => {
    const open = ['pi-0010', 'pi-0009', 'pi-0007'].map(byId)
    expect(sortThreads(open, 'newest').map((o) => o.id)).toEqual(['pi-0010', 'pi-0009', 'pi-0007'])
    expect(sortThreads(open, 'oldest').map((o) => o.id)).toEqual(['pi-0007', 'pi-0009', 'pi-0010'])
    expect(lastActivity(byId('pi-0009'))).toBe('2026-10-12T11:15') // no messages: when it arrived
  })

  it('searches customer, organization, event type and message text', () => {
    const owen = byId('pi-0010')
    for (const query of ['owen', 'tech meetup', 'corporate', 'add up to 20', '']) expect(matchesSearch(owen, query)).toBe(true)
    expect(matchesSearch(owen, 'wedding')).toBe(false)
  })

  it('names the event the way the request panel does', () => {
    expect(eventName(byId('pi-0010'))).toBe('Nashville Tech Meetup')
    expect(eventName(byId('pi-0007'))).toBe('Elena Ruiz’s event')
  })

  it('shows recent activity relative to the demo clock', () => {
    expect(relativeTime('2026-10-12T16:40', clock)).toBe('16h ago')
    expect(relativeTime('2026-10-13T08:30', clock)).toBe('30m ago')
    expect(relativeTime('2026-09-30T09:00', clock)).toBe('Sep 30')
  })
})
