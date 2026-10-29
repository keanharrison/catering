import { describe, expect, it } from 'vitest'
import { answersToFormPatch, composeNotes, emptyAnswers, parseGuestCount, stepError } from './planScript'

const today = '2026-10-29'
const answered = { ...emptyAnswers(today), eventType: 'corporate-lunch', guests: 'about 40', fulfillment: 'delivery' as const, dietary: ['vegan' as const], mealSize: 'hearty' as const, preferences: 'No cilantro' }

describe('guided intake script', () => {
  it('reads the first whole number a customer types', () => {
    expect(parseGuestCount('about 40')).toBe(40)
    expect(parseGuestCount('1,200 people')).toBe(1200)
    expect(parseGuestCount('lots')).toBeNull()
  })

  it('names what is missing on each required step', () => {
    expect(stepError('eventType', emptyAnswers(today), today)).toBe('Choose an event type.')
    expect(stepError('guests', { ...emptyAnswers(today), guests: '0' }, today)).toContain('at least 1')
    expect(stepError('guests', { ...emptyAnswers(today), guests: '99999' }, today)).toContain('up to')
    expect(stepError('when', { ...emptyAnswers(today), eventDate: '2026-10-01', fulfillment: 'pickup' }, today)).toBe('Choose today or a future date.')
    expect(stepError('when', emptyAnswers(today), today)).toBe('Choose pickup or delivery.')
    expect(stepError('dietary', emptyAnswers(today), today)).toBeNull()
    expect(stepError('extras', emptyAnswers(today), today)).toBeNull()
  })

  it('maps answers onto the request form without inventing a quantity rule', () => {
    const patch = answersToFormPatch(answered)
    expect(patch).toMatchObject({ eventType: 'corporate-lunch', guestCount: '40', fulfillment: 'delivery', eventDate: today, dietary: ['vegan'] })
    expect(patch.notes).toBe('Meal size: Hearty. Food preferences: No cilantro')
  })

  it('leaves unanswered fields out so blanks never overwrite anything', () => {
    expect(answersToFormPatch(emptyAnswers(today))).toEqual({})
    expect(composeNotes(emptyAnswers(today))).toBe('')
  })
})
