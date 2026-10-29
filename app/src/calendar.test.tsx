// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'
import { CalendarPage } from './views/staff/CalendarPage'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('pi2go-demo-account', 'team')
  useDemoStore.getState().loadScenario('routine') // the demo clock starts at 2026-10-13 09:00
})
afterEach(cleanup)

const title = () => screen.getByRole('status').textContent

describe('Admin Calendar', () => {
  it('opens on the week of the demo clock’s today, with today marked', () => {
    renderAppAt('/staff/calendar', <AppRoutes />)
    expect(screen.getByRole('heading', { level: 1, name: 'Calendar' })).toBeTruthy()
    expect(title()).toBe('October 2026')
    expect(screen.getAllByRole('columnheader')).toHaveLength(7)
    expect(screen.getByRole('columnheader', { name: 'Tuesday, October 13' }).getAttribute('aria-current')).toBe('date')
    expect(screen.getByText('No events yet.')).toBeTruthy()
  })

  it('is in the Admin sidebar, and AI & agents is gone', () => {
    renderAppAt('/staff/calendar', <AppRoutes />)
    const sidebar = within(document.querySelector('[data-slot="sidebar"]') as HTMLElement)
    expect(sidebar.getByText('Calendar')).toBeTruthy()
    expect(sidebar.queryByText('AI & agents')).toBeNull()
  })

  it('moves by week and month, and Today brings it back', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/calendar', <AppRoutes />)
    await user.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByRole('columnheader', { name: 'Tuesday, October 20' })).toBeTruthy()
    await user.click(screen.getByRole('combobox', { name: 'Calendar view' }))
    await user.click(await screen.findByRole('option', { name: 'Month' }))
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(title()).toBe('November 2026')
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(title()).toBe('October 2026')
  })

  it('opens a day’s week from the month view', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/calendar', <AppRoutes />)
    await user.click(screen.getByRole('combobox', { name: 'Calendar view' }))
    await user.click(await screen.findByRole('option', { name: 'Month' }))
    await user.click(screen.getByRole('button', { name: 'Thursday, October 29, open week' }))
    expect(screen.getByRole('columnheader', { name: 'Thursday, October 29' })).toBeTruthy()
  })

  it('places events it is given in their day, ready for linked orders later', () => {
    render(<CalendarPage events={[{ id: 'e1', title: 'Corporate lunch', start: '2026-10-13T12:00', end: '2026-10-13T13:00' }]} />)
    expect(screen.getByText('Corporate lunch')).toBeTruthy()
    expect(screen.queryByText('No events yet.')).toBeNull()
  })

  it('keeps customers out', () => {
    localStorage.setItem('pi2go-demo-account', 'customer')
    renderAppAt('/staff/calendar', <AppRoutes />)
    expect(screen.queryByRole('heading', { level: 1, name: 'Calendar' })).toBeNull()
  })
})
