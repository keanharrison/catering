// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { renderAppAt } from './test/renderApp'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('pi2go-demo-account', 'team')
})
afterEach(cleanup)

const names = ['Google Calendar', 'Toast', 'Square for Restaurants', 'Clover', 'Lightspeed Restaurant', 'TouchBistro', 'QuickBooks Online', '7shifts', 'ezCater', 'DoorDash']

describe('Admin Integrations catalog', () => {
  it('lists the ten services by purpose, each with a Connect button', () => {
    renderAppAt('/staff/integrations', <AppRoutes />)
    expect(screen.getByRole('heading', { level: 1, name: 'Integrations' })).toBeTruthy()
    for (const name of names) {
      expect(screen.getByRole('heading', { level: 3, name })).toBeTruthy()
      expect(screen.getByRole('button', { name: `Connect ${name}` })).toBeTruthy()
    }
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Calendar', 'Point of sale', 'Accounting', 'Staffing', 'Catering and delivery'])
    expect(within(screen.getByRole('region', { name: 'Point of sale' })).getAllByRole('listitem')).toHaveLength(5)
  })

  it('never shows a connected state, and says plainly that Connect does nothing yet', async () => {
    renderAppAt('/staff/integrations', <AppRoutes />)
    expect(screen.queryByText(/^connected$/i)).toBeNull()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect Toast' }))
    expect(screen.getByRole('status').textContent).toMatch(/Toast isn’t available in this prototype yet/)
  })
})
