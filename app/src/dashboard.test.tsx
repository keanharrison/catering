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

describe('customer dashboard', () => {
  it('adds a Dashboard tab to the sidebar and marks only it as current', () => {
    renderAppAt('/customer/dashboard', <AppRoutes />)
    const current = document.querySelectorAll('[data-slot="sidebar-menu-button"][data-active]')
    expect(current).toHaveLength(1)
    expect(current[0].textContent).toBe('Dashboard')
  })

  it('lists Ask Pearl in the sidebar and marks it current on its page', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    const current = document.querySelectorAll('[data-slot="sidebar-menu-button"][data-active]')
    expect(Array.from(current).map((el) => el.textContent)).toEqual(['Ask Pearl'])
  })

  it('does not mark Dashboard as current on New request', () => {
    renderAppAt('/customer', <AppRoutes />)
    const current = document.querySelectorAll('[data-slot="sidebar-menu-button"][data-active]')
    expect(Array.from(current).map((el) => el.textContent)).toEqual(['New request'])
  })

  it('shows the four tiles and links each to its page', () => {
    renderAppAt('/customer/dashboard', <AppRoutes />)
    const main = within(document.getElementById('main') as HTMLElement)
    expect(main.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy()
    expect(main.getByRole('link', { name: /Past/ }).getAttribute('href')).toBe('/customer/orders/past')
    expect(main.getByRole('link', { name: /Active/ }).getAttribute('href')).toBe('/customer/orders')
    expect(main.getByRole('link', { name: /Drafts/ }).getAttribute('href')).toBe('/customer')
    expect(main.getByRole('link', { name: /Messages/ }).getAttribute('href')).toBe('/customer/messages')
  })

  it('answers a typed question in the assistant and keeps the field usable', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/dashboard', <AppRoutes />)
    const send = screen.getByRole('button', { name: 'Send question' }) as HTMLButtonElement
    expect(send.disabled).toBe(true)
    await user.type(screen.getByLabelText('Ask a question'), 'Do I have any drafts?')
    await user.click(send)
    const log = screen.getByRole('log', { name: 'Conversation' })
    expect(within(log).getByText(/You have no draft right now/)).toBeTruthy()
    expect((screen.getByLabelText('Ask a question') as HTMLInputElement).value).toBe('')
  })

  it('sends a suggested question when it is chosen', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/dashboard', <AppRoutes />)
    await user.click(screen.getByRole('button', { name: 'When is my next event?' }))
    expect(within(screen.getByRole('log')).getByText(/no upcoming event/)).toBeTruthy()
  })
})
