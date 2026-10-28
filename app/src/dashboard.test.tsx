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

  it('lists Chat in the sidebar and marks it current on its page', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    const current = document.querySelectorAll('[data-slot="sidebar-menu-button"][data-active]')
    expect(Array.from(current).map((el) => el.textContent)).toEqual(['Chat'])
  })

  it('does not mark Dashboard as current on New request', () => {
    renderAppAt('/customer', <AppRoutes />)
    const current = document.querySelectorAll('[data-slot="sidebar-menu-button"][data-active]')
    expect(Array.from(current).map((el) => el.textContent)).toEqual(['New request'])
  })

  it('shows a shortcut to each part of the account and links it to its page', () => {
    renderAppAt('/customer/dashboard', <AppRoutes />)
    const main = within(document.getElementById('main') as HTMLElement)
    expect(main.getByRole('heading', { level: 1, name: 'What can I help you with?' })).toBeTruthy()
    expect(main.getByRole('link', { name: /Past/ }).getAttribute('href')).toBe('/customer/orders/past')
    expect(main.getByRole('link', { name: /Active/ }).getAttribute('href')).toBe('/customer/orders')
    expect(main.getByRole('link', { name: /Drafts/ }).getAttribute('href')).toBe('/customer')
    expect(main.getByRole('link', { name: /Messages/ }).getAttribute('href')).toBe('/customer/messages')
  })

  it('hands a typed question to the Chat page, which answers it once', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/dashboard', <AppRoutes />)
    const send = screen.getByRole('button', { name: 'Send question' }) as HTMLButtonElement
    expect(send.disabled).toBe(true)
    await user.type(screen.getByLabelText('Ask a question'), 'Do I have any drafts?')
    await user.click(send)
    const log = await screen.findByRole('log', { name: 'Conversation' })
    expect(within(log).getAllByText(/You have a request in progress|You have no draft right now/)).toHaveLength(1)
  })

  it('shows the quickstarts tab with a way to start a request', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/dashboard', <AppRoutes />)
    expect(screen.getByText(/Nothing yet\./)).toBeTruthy()
    await user.click(screen.getByRole('tab', { name: 'Quickstarts' }))
    expect(screen.getByRole('link', { name: /Start a catering request/ }).getAttribute('href')).toBe('/customer')
  })
})
