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

const rowTitles = ['Business profile', 'Logo', 'Restaurant food image', 'Intro text', 'Catering availability', 'Lead-time rules', 'Pickup', 'Delivery', 'Menu and catering rules', 'Team access', 'Request notifications', 'Customer notifications', 'Integrations', 'Language', 'Time zone', 'Download your data', 'Security', 'Sign out', 'Delete workspace']

describe('Admin Settings', () => {
  it('groups every requested setting into compact rows under one heading', () => {
    renderAppAt('/staff/settings', <AppRoutes />)
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Business', 'Ordering page', 'Catering and fulfillment', 'Team and notifications', 'Account'])
    const main = within(document.getElementById('main') as HTMLElement)
    for (const title of rowTitles) expect(main.getByRole('heading', { level: 3, name: title })).toBeTruthy()
    expect(main.getByText(/Changes can’t be saved yet/)).toBeTruthy()
  })

  it('keeps the working links and never claims a change was saved', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/settings', <AppRoutes />)
    expect(screen.getByRole('link', { name: 'Open integrations' }).getAttribute('href')).toBe('/staff/integrations')
    expect(screen.getByRole('link', { name: 'Open menu and rules' }).getAttribute('href')).toBe('/settings')
    expect(screen.queryByText(/saved successfully|changes (were )?saved|settings saved/i)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Uploading a logo' }))
    expect(await screen.findByText(/Uploading a logo isn’t available in this prototype yet\. Nothing was changed\./)).toBeTruthy()
  })

  it('keeps customers out', () => {
    localStorage.setItem('pi2go-demo-account', 'customer')
    renderAppAt('/staff/settings', <AppRoutes />)
    expect(screen.queryByRole('heading', { level: 1, name: 'Settings' })).toBeNull()
  })
})
