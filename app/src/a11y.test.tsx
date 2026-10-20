// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'
import { fillEventBasics } from './test/fillEventBasics'
import { renderAppAt } from './test/renderApp'

function renderAt(path: string) {
  return renderAppAt(path, <AppRoutes />)
}

beforeEach(() => {
  localStorage.clear()
  useDemoStore.getState().loadScenario('routine')
  vi.setSystemTime(new Date('2026-10-13T09:00')) // the first page defaults its date to today
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('keyboard and structure', () => {
  it('offers a skip link to the main content', () => {
    renderAt('/customer')
    const link = screen.getByRole('link', { name: 'Skip to main content' })
    expect(link.getAttribute('href')).toBe('#main')
  })

  it('leaves focus at the top on first load so the skip link is the first Tab stop', async () => {
    const user = userEvent.setup()
    renderAt('/customer')
    expect(document.activeElement?.id).not.toBe('main')
    await user.tab()
    expect(document.activeElement?.textContent).toBe('Skip to main content')
  })

  it('moves focus to the page after navigating', async () => {
    const user = userEvent.setup()
    renderAt('/customer')
    await fillEventBasics(user)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(document.activeElement?.id).toBe('main')
  })

  it('marks the current journey step and disables steps that cannot be reached yet', () => {
    renderAt('/customer/menu')
    const nav = screen.getByRole('navigation', { name: 'Request progress' })
    expect(within(nav).getByRole('button', { name: 'Menu' }).getAttribute('aria-current')).toBe('step')
    expect((within(nav).getByRole('button', { name: 'Supplies' }) as HTMLButtonElement).disabled).toBe(true)
    expect((within(nav).getByRole('button', { name: 'Event' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('moves between menu category tabs with the arrow keys and keeps one tab in the tab order', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    const entrees = screen.getByRole('tab', { name: 'Entrees' })
    const sides = screen.getByRole('tab', { name: 'Sides' })
    expect(entrees.tabIndex).toBe(0)
    expect(sides.tabIndex).toBe(-1)

    await user.click(entrees)
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(sides)
    expect(sides.tabIndex).toBe(0)
    await user.keyboard('{Enter}')
    expect(sides.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(sides.id)
  })

  it('labels every quantity control and filter button', () => {
    renderAt('/customer/menu')
    for (const input of screen.getAllByRole('spinbutton')) {
      expect(input.getAttribute('aria-label')).toMatch(/^Quantity of /)
    }
    for (const button of screen.getAllByRole('button', { pressed: false })) {
      expect(button.textContent?.length).toBeGreaterThan(0)
    }
  })

  it('supports completing the event form with the keyboard alone', async () => {
    const user = userEvent.setup()
    renderAt('/customer')
    await fillEventBasics(user)
    const guests = screen.getByLabelText('Guests')
    guests.focus()
    await user.keyboard('{Control>}a{/Control}45{Tab}')
    expect(document.activeElement).toBe(screen.getByLabelText('Date'))
    expect(useDemoStore.getState().order.intent.guestCount).toBe(40) // nothing saved until the form is submitted
    const chooseMenu = screen.getByRole('button', { name: 'Continue' })
    let tabCount = 0
    while (document.activeElement !== chooseMenu && tabCount < 12) {
      await user.tab()
      tabCount += 1
    }
    expect(document.activeElement).toBe(chooseMenu)
    await user.keyboard('{Enter}') // Enter submits the form
    expect(useDemoStore.getState().order.intent.guestCount).toBe(45)
    expect(screen.getByRole('heading', { level: 1, name: 'Build your menu' })).toBeTruthy()
  })
})
