// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { destinationTones } from './components/destinationIcons'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'

beforeEach(() => {
  localStorage.clear()
  useDemoStore.getState().loadScenario('routine')
  useDemoStore.getState().startBlankDraft()
})
afterEach(cleanup)

describe('colored icon tiles', () => {
  it('gives each account summary on Chat its destination color', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    const account = within(screen.getByRole('navigation', { name: 'Your account' }))
    const tone = (name: RegExp) => account.getByRole('link', { name }).querySelector('.floating-tile')?.getAttribute('data-tone')
    expect(tone(/Past orders/)).toBe(destinationTones.pastOrders)
    expect(tone(/Current orders/)).toBe(destinationTones.currentOrders)
    expect(tone(/Drafts/)).toBe(destinationTones.drafts)
    expect(tone(/Messages/)).toBe(destinationTones.messages)
  })

  it('colors the empty-state tiles on the orders and messages pages', () => {
    renderAppAt('/customer/orders', <AppRoutes />)
    expect(document.querySelector('[data-slot="empty-icon"]')?.getAttribute('data-tone')).toBe('indigo')
    cleanup()
    renderAppAt('/customer/messages', <AppRoutes />)
    expect(document.querySelector('[data-slot="empty-icon"]')?.getAttribute('data-tone')).toBe('sky')
  })

  it('keeps the sidebar neutral', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    expect(document.querySelectorAll('[data-slot="sidebar"] [data-tone], .linear-sidebar [data-tone]')).toHaveLength(0)
  })
})
