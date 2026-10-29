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

const cards = () => within(document.getElementById('main') as HTMLElement).getAllByRole('listitem')
const names = ['Google Calendar', 'Toast', 'Square for Restaurants', 'Clover', 'Lightspeed Restaurant', 'TouchBistro', 'QuickBooks Online', '7shifts', 'ezCater', 'DoorDash']

describe('Admin Integrations catalog', () => {
  it('lists all ten services on one page, each with its type and a Connect button', () => {
    renderAppAt('/staff/integrations', <AppRoutes />)
    expect(screen.getByRole('heading', { level: 1, name: 'Integrations' })).toBeTruthy()
    for (const name of names) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy()
      expect(screen.getByRole('button', { name: `Connect ${name}` })).toBeTruthy()
    }
    expect(cards()).toHaveLength(10)
  })

  it('searches by name', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/integrations', <AppRoutes />)
    await user.type(screen.getByRole('searchbox', { name: 'Search integrations' }), 'quick')
    expect(cards()).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: 'QuickBooks Online' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('1 of 10 integrations')
  })

  it('filters by type and combines with search, with a way back from no results', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/integrations', <AppRoutes />)
    await user.click(screen.getByRole('combobox', { name: 'Type' }))
    await user.click(await screen.findByRole('option', { name: 'Point of sale' }))
    expect(cards()).toHaveLength(5)
    await user.type(screen.getByRole('searchbox'), 'doordash')
    expect(screen.getByText('No matching integrations')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(cards()).toHaveLength(10)
  })

  it('never shows a connected state, and says plainly that Connect does nothing yet', async () => {
    renderAppAt('/staff/integrations', <AppRoutes />)
    expect(screen.queryByText(/^connected$/i)).toBeNull()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect Toast' }))
    expect(screen.getByRole('status').textContent).toMatch(/Toast isn’t available in this prototype yet/)
  })
})
