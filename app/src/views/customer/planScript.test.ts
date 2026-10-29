import { describe, expect, it } from 'vitest'
import { answerText, answersToFormPatch, emptyAnswers, parseBudget, parseGuestCount, planSteps, stepError } from './planScript'

const today = '2026-10-29'
const answered = { ...emptyAnswers(), step: 6, eventType: 'corporate-lunch', eventDate: '2026-11-02', guests: 'about 40', fulfillment: 'delivery' as const, dietary: ['vegan' as const], budget: '$1,200' }

describe('guided chat script', () => {
  it('asks exactly the six agreed questions in order', () => {
    expect(planSteps.map((step) => step.id)).toEqual(['eventType', 'eventDate', 'guests', 'fulfillment', 'dietary', 'budget'])
  })

  it('reads numbers the way people type them', () => {
    expect(parseGuestCount('about 40')).toBe(40)
    expect(parseGuestCount('1,200 people')).toBe(1200)
    expect(parseGuestCount('lots')).toBeNull()
    expect(parseBudget('$1,200')).toBe(1200)
    expect(parseBudget('0')).toBeNull()
    expect(parseBudget('plenty')).toBeNull()
  })

  it('names what is wrong with an answer, and lets dietary and budget be skipped', () => {
    expect(stepError('eventType', emptyAnswers(), today)).toBe('Choose an event type.')
    expect(stepError('eventDate', emptyAnswers(), today)).toBe('Choose a date.')
    expect(stepError('eventDate', { ...emptyAnswers(), eventDate: '2026-10-01' }, today)).toBe('Choose today or a future date.')
    expect(stepError('guests', { ...emptyAnswers(), guests: '0' }, today)).toContain('at least 1')
    expect(stepError('guests', { ...emptyAnswers(), guests: '99999' }, today)).toContain('up to')
    expect(stepError('fulfillment', emptyAnswers(), today)).toBe('Choose pickup or delivery.')
    expect(stepError('dietary', emptyAnswers(), today)).toBeNull()
    expect(stepError('budget', emptyAnswers(), today)).toBeNull()
    expect(stepError('budget', { ...emptyAnswers(), budget: 'lots' }, today)).toContain('dollar amount')
  })

  it('maps every answer onto the request form', () => {
    expect(answersToFormPatch(answered)).toEqual({
      eventType: 'corporate-lunch', eventDate: '2026-11-02', guestCount: '40', fulfillment: 'delivery', dietary: ['vegan'], budget: '1200',
    })
  })

  it('leaves unanswered fields out so blanks never overwrite anything', () => {
    expect(answersToFormPatch(emptyAnswers())).toEqual({})
  })

  it('reads replies back as short chat bubbles', () => {
    expect(answerText('guests', answered)).toBe('40 guests')
    expect(answerText('dietary', answered)).toBe('Vegan')
    expect(answerText('dietary', emptyAnswers())).toBe('No dietary needs')
    expect(answerText('budget', answered)).toBe('$1,200')
    expect(answerText('budget', emptyAnswers())).toBe('Skipped')
  })
})
