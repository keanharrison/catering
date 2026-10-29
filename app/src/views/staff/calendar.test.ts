import { describe, expect, it } from 'vitest'
import { eventsOn, monthDays, offsetFor, rangeTitle, step, weekDays, HOUR_HEIGHT, type CalendarEvent } from './calendar'

const day = (iso: string) => new Date(`${iso}T12:00`)
const iso = (date: Date) => date.toISOString().slice(0, 10)

describe('calendar date math', () => {
  it('builds a Sunday-to-Saturday week around any day', () => {
    expect(weekDays(day('2026-10-29')).map((d) => d.getDate())).toEqual([25, 26, 27, 28, 29, 30, 31])
  })

  it('pads a month out to whole weeks', () => {
    const days = monthDays(day('2026-10-13'))
    expect(days.length % 7).toBe(0)
    expect(days[0].getDay()).toBe(0)
    expect(days.at(-1)?.getDay()).toBe(6)
    expect(days.some((d) => d.getMonth() === 8)).toBe(true) // trailing September days
  })

  it('titles the range, and spans two months when a week does', () => {
    expect(rangeTitle(day('2026-10-13'), 'week')).toBe('October 2026')
    expect(rangeTitle(day('2026-10-13'), 'month')).toBe('October 2026')
    expect(rangeTitle(day('2026-09-30'), 'week')).toBe('Sep – Oct 2026')
    expect(rangeTitle(day('2026-12-30'), 'week')).toBe('Dec 2026 – Jan 2027')
  })

  it('steps by a week or a month', () => {
    expect(iso(step(day('2026-10-13'), 'week', 1))).toBe('2026-10-20')
    expect(iso(step(day('2026-10-13'), 'week', -1))).toBe('2026-10-06')
    expect(iso(step(day('2026-10-13'), 'month', 1))).toBe('2026-11-13')
  })

  it('places a time on the 24-hour grid', () => {
    expect(offsetFor(0, 0)).toBe(0)
    expect(offsetFor(9, 30)).toBe(9.5 * HOUR_HEIGHT)
  })

  it('picks out a day’s events, earliest first', () => {
    const events: CalendarEvent[] = [
      { id: 'b', title: 'Later', start: '2026-10-13T15:00', end: '2026-10-13T16:00' },
      { id: 'a', title: 'Earlier', start: '2026-10-13T09:00', end: '2026-10-13T10:00' },
      { id: 'c', title: 'Another day', start: '2026-10-14T09:00', end: '2026-10-14T10:00' },
    ]
    expect(eventsOn(events, day('2026-10-13')).map((e) => e.id)).toEqual(['a', 'b'])
  })
})
