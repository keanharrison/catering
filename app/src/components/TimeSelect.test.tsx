// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { TimeSelect, joinTime, parseTime, timeLabel } from './TimeSelect'

afterEach(cleanup)

function Harness({ start = '12:00', onValue }: { start?: string; onValue?: (v: string) => void }) {
  const [value, setValue] = useState(start)
  return (
    <>
      <span id="lbl">Pickup time (required)</span>
      <TimeSelect id="time" labelledBy="lbl" value={value} onChange={(next) => { setValue(next); onValue?.(next) }} />
    </>
  )
}

describe('time conversion', () => {
  it('shows noon as 00:00 PM and midnight as 00:00 AM, and round-trips', () => {
    expect(timeLabel('12:00')).toBe('00:00 PM')
    expect(timeLabel('00:00')).toBe('00:00 AM')
    expect(timeLabel('13:30')).toBe('01:30 PM')
    expect(timeLabel('23:55')).toBe('11:55 PM')
    expect(timeLabel('nonsense')).toBe('')
    for (const value of ['00:00', '06:15', '12:00', '12:45', '18:05', '23:59']) {
      const p = parseTime(value)!
      expect(joinTime(p.hour, p.minute, p.meridiem)).toBe(value)
    }
  })
})

describe('TimeSelect', () => {
  it('shows the default as 00 : 00 PM in three labeled dropdowns', () => {
    render(<Harness />)
    expect(screen.getByRole('group', { name: 'Pickup time (required)' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Hour' }).textContent).toBe('00')
    expect(screen.getByRole('combobox', { name: 'Minute' }).textContent).toBe('00')
    expect(screen.getByRole('combobox', { name: 'AM or PM' }).textContent).toBe('PM')
  })

  it('changes hour, minutes and AM or PM, each from its own dropdown, saving a 24-hour value', async () => {
    const user = userEvent.setup()
    const seen: string[] = []
    render(<Harness onValue={(v) => seen.push(v)} />)
    await user.click(screen.getByRole('combobox', { name: 'Hour' }))
    await user.click(await screen.findByRole('option', { name: '06' }))
    await user.click(screen.getByRole('combobox', { name: 'Minute' }))
    await user.click(await screen.findByRole('option', { name: '30' }))
    await user.click(screen.getByRole('combobox', { name: 'AM or PM' }))
    expect((await screen.findAllByRole('option')).map((o) => o.textContent)).toEqual(['AM', 'PM']) // its own compact list
    await user.click(screen.getByRole('option', { name: 'AM' }))
    expect(seen).toEqual(['18:00', '18:30', '06:30'])
    expect(screen.getByRole('combobox', { name: 'AM or PM' }).textContent).toBe('AM')
  })

  it('keeps a stored minute that is not on the five-minute grid', async () => {
    const user = userEvent.setup()
    render(<Harness start="09:07" />)
    expect(screen.getByRole('combobox', { name: 'Minute' }).textContent).toBe('07')
    await user.click(screen.getByRole('combobox', { name: 'Minute' }))
    expect(await screen.findByRole('option', { name: '07' })).toBeTruthy()
  })
})
