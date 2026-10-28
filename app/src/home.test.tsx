// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { catalog, type Order, type Scenario } from './data'
import { createOrder } from './state/orderMachine'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'

const routine = catalog.scenarios.find((s) => s.id === 'routine') as Scenario

beforeEach(() => {
  localStorage.clear()
  useDemoStore.getState().loadScenario('routine')
  useDemoStore.getState().startBlankDraft()
})
afterEach(cleanup)

function current() {
  return Array.from(document.querySelectorAll('[data-slot="sidebar-menu-button"][data-active]')).map((el) => el.textContent)
}

describe('Chat as home (the Dashboard is folded into it)', () => {
  it('has no Dashboard tab and starts the customer list with Chat', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    const labels = Array.from(document.querySelectorAll('.linear-nav-group [data-slot="sidebar-menu-button"]')).map((el) => el.textContent)
    expect(labels).toEqual(['Chat', 'New request', 'Current orders', 'Past orders', 'Messages', 'Account settings'])
    expect(current()).toEqual(['Chat'])
  })

  it('sends the old Dashboard address to Chat', () => {
    renderAppAt('/customer/dashboard', <AppRoutes />)
    expect(screen.getByRole('heading', { level: 1, name: 'What can I help you with?' })).toBeTruthy()
    expect(current()).toEqual(['Chat'])
  })

  it('keeps the Dashboard\'s account summaries, each linking to its page', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    const main = within(document.getElementById('main') as HTMLElement)
    const account = within(main.getByRole('navigation', { name: 'Your account' }))
    expect(account.getByRole('link', { name: /Past orders/ }).getAttribute('href')).toBe('/customer/orders/past')
    expect(account.getByRole('link', { name: /Current orders/ }).getAttribute('href')).toBe('/customer/orders')
    expect(account.getByRole('link', { name: /Drafts/ }).getAttribute('href')).toBe('/customer')
    expect(account.getByRole('link', { name: /Messages/ }).getAttribute('href')).toBe('/customer/messages')
  })

  it('keeps a way to start a request', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    expect(screen.getByRole('link', { name: /Start a catering request/ }).getAttribute('href')).toBe('/customer')
  })

  it('shows recent updates only when the team has acted on a request', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    expect(screen.queryByRole('heading', { name: 'Recent' })).toBeNull()
    cleanup()
    const accepted: Order = {
      ...createOrder(routine),
      id: 'accepted-1',
      status: 'confirmed',
      history: [{ from: 'submitted', to: 'confirmed', actor: 'staff', at: '2026-10-13T11:00' }],
    }
    useDemoStore.setState({ orders: [accepted] })
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    const recent = screen.getByRole('heading', { name: 'Recent' }).closest('section') as HTMLElement
    expect(within(recent).getByRole('link', { name: /was accepted/ }).getAttribute('href')).toContain('/customer/orders')
  })
})
