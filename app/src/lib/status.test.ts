import { describe, expect, it } from 'vitest'
import { formatEventTime } from './status'

describe('event time formatting', () => {
  it('shows valid event dates and times', () => {
    expect(formatEventTime('2026-10-20T12:00')).toMatch(/October 20, 2026/)
  })

  it('uses a clear fallback when saved event data is missing or malformed', () => {
    expect(formatEventTime('')).toBe('Not provided')
    expect(formatEventTime('not-a-date')).toBe('Not provided')
  })
})
