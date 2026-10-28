// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'

beforeEach(() => {
  localStorage.clear()
  useDemoStore.getState().loadScenario('routine')
  useDemoStore.getState().startBlankDraft()
})
afterEach(cleanup)

function header() {
  return within(document.querySelector('[data-slot="site-header"]') as HTMLElement)
}

describe('top bar', () => {
  it.each(['/customer', '/customer/dashboard', '/customer/orders', '/customer/messages', '/settings'])('is present on %s with the page title and all three tools', (path) => {
    renderAppAt(path, <AppRoutes />)
    expect(header().getByRole('button', { name: 'Toggle navigation' })).toBeTruthy()
    expect(header().getByRole('button', { name: 'Notifications' })).toBeTruthy()
    expect(header().getByRole('link', { name: 'Ask' }).getAttribute('href')).toBe('/customer/ask-pearl')
    expect(header().getByRole('link', { name: 'Account settings' }).getAttribute('href')).toBe('/settings')
  })

  it('names the page in the bar', () => {
    renderAppAt('/customer/dashboard', <AppRoutes />)
    expect(header().getByText('Dashboard')).toBeTruthy()
  })

  it('opens the Ask Pearl page from the X tab', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/dashboard', <AppRoutes />)
    await user.click(header().getByRole('link', { name: 'Ask' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Ask Pearl' })).toBeTruthy()
    expect(header().getByText('Chat', { selector: 'p' })).toBeTruthy()
  })

  it('shows an empty notifications list when nothing has happened', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/dashboard', <AppRoutes />)
    await user.click(header().getByRole('button', { name: 'Notifications' }))
    expect(await screen.findByText('You’re all caught up.')).toBeTruthy()
  })

  it('stays on staff pages without the customer-only Ask Pearl tab', () => {
    localStorage.setItem('pi2go-demo-account', 'team')
    renderAppAt('/staff', <AppRoutes />)
    expect(header().getByText('Requests')).toBeTruthy()
    expect(header().queryByRole('link', { name: 'Ask' })).toBeNull()
    expect(header().getByRole('link', { name: 'Account settings' }).getAttribute('href')).toBe('/staff/settings')
  })
})
