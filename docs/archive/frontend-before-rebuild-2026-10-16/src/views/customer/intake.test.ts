import { describe, expect, it } from 'vitest'
import { catalog, type Scenario } from '../../data'
import { formToIntent, intentToForm, sectionErrors, validateForm } from './intake'

const routine = catalog.scenarios.find((s) => s.id === 'routine') as Scenario
const valid = () => intentToForm(routine.intent)
const check = (patch: object) => validateForm({ ...valid(), ...patch }, routine.now, catalog)

describe('intake validation', () => {
  it('accepts both sample scenarios', () => {
    for (const s of catalog.scenarios) {
      expect(validateForm(intentToForm(s.intent), s.now, catalog), s.id).toEqual({})
    }
  })

  it('round-trips an intent through the form', () => {
    for (const s of catalog.scenarios) expect(formToIntent(intentToForm(s.intent)), s.id).toEqual(s.intent)
  })

  it('requires a contact name', () => {
    expect(check({ contactName: '  ' }).contactName).toBeTruthy()
  })

  it('requires a real event type', () => {
    expect(check({ eventType: '' }).eventType).toBeTruthy()
    expect(check({ eventType: 'bar-mitzvah' }).eventType).toBeTruthy()
  })

  it('requires a whole guest count of at least 1', () => {
    for (const guestCount of ['', 'abc', '0', '-3', '12.5', '5001']) {
      expect(check({ guestCount }).guestCount, guestCount).toBeTruthy()
    }
    expect(check({ guestCount: '1' }).guestCount).toBeUndefined()
  })

  it('requires a future date and a time', () => {
    expect(check({ eventDate: '' }).eventDate).toBeTruthy()
    expect(check({ eventDate: '2026-10-01' }).eventDate).toBeTruthy()
    expect(check({ eventTime: '' }).eventTime).toBeTruthy()
  })

  it('treats the budget as optional but checks it when given', () => {
    expect(check({ budget: '' }).budget).toBeUndefined()
    expect(check({ budget: '$1,200' }).budget).toBeUndefined()
    expect(check({ budget: 'lots' }).budget).toBeTruthy()
    expect(check({ budget: '0' }).budget).toBeTruthy()
    expect(formToIntent({ ...valid(), budget: '$1,200.50' }).budgetCents).toBe(120050)
  })

  it('keeps the default time when only the date is chosen', () => {
    expect(formToIntent({ ...valid(), eventTime: '' }).eventAt.endsWith('T12:00')).toBe(true)
  })

  it('reports errors only for the fields in a section', () => {
    const errors = check({ contactName: '', guestCount: '' })
    expect(Object.keys(sectionErrors(errors, 'basics'))).toEqual(['guestCount'])
    expect(Object.keys(sectionErrors(errors, 'details'))).toEqual(['contactName'])
  })
})
