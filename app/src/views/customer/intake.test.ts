import { describe, expect, it } from 'vitest'
import { catalog, type Scenario } from '../../data'
import { formToIntent, INTAKE_LIMITS, intentToForm, sectionErrors, validateForm } from './intake'

const routine = catalog.scenarios.find((s) => s.id === 'routine') as Scenario
const routineForm = () => intentToForm(routine.intent)
const check = (patch: object) => validateForm({ ...routineForm(), ...patch }, routine.now, catalog)

describe('intake validation', () => {
  it('keeps sample event basics valid while requiring missing contact details', () => {
    for (const s of catalog.scenarios) {
      const errors = validateForm(intentToForm(s.intent), s.now, catalog)
      expect(Object.keys(sectionErrors(errors, 'basics')), s.id).toEqual([])
      expect(errors.email, s.id).toBe('Enter an email address.')
      expect(errors.phone, s.id).toBe('Enter a phone number.')
      if (s.intent.fulfillment === 'delivery') {
        expect(Object.keys(sectionErrors(errors, 'details')), s.id).toEqual([
          'email', 'phone', 'deliveryAddress', 'deliveryCity', 'deliveryState', 'deliveryZip',
        ])
      }
    }
  })

  it('round-trips an intent through the form', () => {
    for (const s of catalog.scenarios) expect(formToIntent(intentToForm(s.intent)), s.id).toEqual(s.intent)
  })

  it('requires a contact name', () => {
    expect(check({ contactName: '  ' }).contactName).toBeTruthy()
  })

  it('requires a valid email and phone number', () => {
    expect(check({ email: '' }).email).toBe('Enter an email address.')
    expect(check({ email: 'not-an-email' }).email).toBe('Enter a valid email address.')
    expect(check({ phone: '' }).phone).toBe('Enter a phone number.')
  })

  it('rejects overlong contact and instruction fields', () => {
    for (const [field, limit] of Object.entries(INTAKE_LIMITS)) {
      const error = check({ [field]: 'x'.repeat(limit + 1) })[field as keyof typeof INTAKE_LIMITS]
      expect(error, field).toBe(`Keep this answer to ${limit} characters or fewer.`)
    }
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
    expect(formToIntent({ ...routineForm(), budget: '$1,200.50' }).budgetCents).toBe(120050)
  })

  it('keeps the default time when only the date is chosen', () => {
    expect(formToIntent({ ...routineForm(), eventTime: '' }).eventAt.endsWith('T12:00')).toBe(true)
  })

  it('reports errors only for the fields in a section', () => {
    const errors = check({ contactName: '', guestCount: '' })
    expect(Object.keys(sectionErrors(errors, 'basics'))).toEqual(['guestCount'])
    expect(Object.keys(sectionErrors(errors, 'details'))).toEqual(['contactName', 'email', 'phone'])
  })
})

describe('time of day', () => {
  it('starts at noon (shown as 00:00 PM) when nothing has been chosen, and saves what is chosen', () => {
    const blank = { ...routineForm(), eventTime: '' }
    expect(intentToForm({ ...formToIntent(blank), eventAt: '' }).eventTime).toBe('12:00')
    expect(formToIntent({ ...routineForm(), eventDate: '2026-11-02', eventTime: '18:30' }).eventAt).toBe('2026-11-02T18:30')
    expect(intentToForm(formToIntent({ ...routineForm(), eventDate: '2026-11-02', eventTime: '06:05' })).eventTime).toBe('06:05')
  })
})
