// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useDemoStore.getState().loadScenario('routine')
})
afterEach(cleanup)

describe('keyboard and structure', () => {
  it('offers a skip link to the main content', () => {
    renderAt('/customer')
    const link = screen.getByRole('link', { name: 'Skip to main content' })
    expect(link.getAttribute('href')).toBe('#main')
  })

  it('moves focus to the page after navigating', async () => {
    const user = userEvent.setup()
    renderAt('/customer')
    await user.click(screen.getByRole('button', { name: 'Choose your menu' }))
    expect(document.activeElement?.id).toBe('main')
  })

  it('marks the current journey step and disables steps that cannot be reached yet', () => {
    renderAt('/customer/menu')
    const nav = screen.getByRole('navigation', { name: 'Your request' })
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

    entrees.focus()
    await user.keyboard('{ArrowRight}')
    expect(sides.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(sides)
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('tab-side')
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
    const guests = screen.getByLabelText('Number of guests')
    guests.focus()
    await user.keyboard('{Control>}a{/Control}45{Tab}')
    expect(document.activeElement).toBe(screen.getByLabelText('Event date'))
    expect(useDemoStore.getState().order.intent.guestCount).toBe(40) // nothing saved until the form is submitted
    await user.keyboard('{Enter}') // Enter submits the form
    expect(useDemoStore.getState().order.intent.guestCount).toBe(45)
    expect(screen.getByRole('heading', { level: 1, name: 'Choose what you would like.' })).toBeTruthy()
  })
})
