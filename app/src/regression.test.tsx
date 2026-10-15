// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'

const errors: string[] = []

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}
const h1 = () => screen.getByRole('heading', { level: 1 }).textContent
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const store = () => useDemoStore.getState()

beforeEach(() => {
  localStorage.clear()
  errors.length = 0
  vi.spyOn(console, 'error').mockImplementation((...args) => void errors.push(args.join(' ')))
  vi.spyOn(console, 'warn').mockImplementation((...args) => void errors.push(args.join(' ')))
  store().loadScenario('routine')
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('regression: full journeys and edge cases', () => {
  it('runs both full journeys without console errors or warnings', async () => {
    for (const id of ['routine', 'unusual']) {
      store().loadScenario(id)
      const user = userEvent.setup()
      renderAt('/customer')
      await user.click(btn('Choose your menu'))
      await user.click(btn('Help me choose'))
      await user.click(btn('Use these'))
      await user.click(btn('Continue to supplies'))
      await user.click(screen.getByRole('radio', { name: 'Add supplies' }))
      await user.click(screen.getByRole('checkbox', { name: 'Add Cups' }))
      await user.click(btn('Continue to details'))
      await user.click(btn('Review your request'))
      await user.click(btn('Submit request'))
      await user.click(screen.getAllByRole('link', { name: 'Staff' })[0])
      await user.click(btn('Accept request'))
      await user.click(screen.getByRole('link', { name: 'View handoff summary' }))
      expect(store().order.status).toBe('confirmed')
      cleanup()
    }
    expect(errors).toEqual([])
  })

  it('updates coverage when the guest count changes after the menu is built', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await user.click(btn('Help me choose'))
    await user.click(btn('Use these'))
    expect(screen.getByTestId('coverage').textContent).toContain('everyone covered')
    await user.click(btn('Back'))
    const guests = screen.getByLabelText('Number of guests')
    await user.clear(guests)
    await user.type(guests, '80')
    await user.click(btn('Choose your menu'))
    expect(screen.getByTestId('coverage').textContent).toContain('of 80 guests (40 more to cover everyone)')
  })

  it('caps a mistyped quantity so totals stay sane', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    const input = screen.getByRole('spinbutton', { name: 'Quantity of Sous Poulet Chicken' })
    await user.clear(input)
    await user.type(input, '999999999')
    expect(store().order.lines[0].units).toBe(5000)
  })

  it('handles scenario switching, reset and direct URLs without dead ends', async () => {
    const user = userEvent.setup()
    renderAt('/customer/review')
    expect(h1()).toBe('Choose what you would like.')
    store().loadScenario('unusual')
    expect(store().order.status).toBe('draft')
    await user.click(btn('Reset'))
    expect(h1()).toBe('Choose what you would like.')
  })

  it('keeps the draft in browser storage', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await user.click(btn('Help me choose'))
    await user.click(btn('Use these'))
    const saved = JSON.parse(localStorage.getItem('pi2go-demo') ?? '{}')
    expect(saved.state.order.lines.length).toBeGreaterThan(0)
  })

  it('locks a submitted request against edits and resubmission', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await user.click(btn('Help me choose'))
    await user.click(btn('Use these'))
    await user.click(btn('Continue to supplies'))
    await user.click(screen.getByRole('radio', { name: /No cutlery/ }))
    await user.click(btn('Continue to details'))
    await user.click(btn('Review your request'))
    await user.click(btn('Submit request'))
    expect(h1()).toBe('Request recorded.')
    expect(screen.queryAllByRole('button', { name: 'Submit request' })).toHaveLength(0)
    const before = store().order.lines.length
    store().updateDraft({ lines: [] })
    expect(store().lastError).toMatch(/draft/)
    expect(store().order.lines).toHaveLength(before)
  })

  it('shows clear empty states in the staff and handoff views before anything is submitted', () => {
    renderAt('/staff')
    expect(h1()).toBe('No requests yet.')
    cleanup()
    renderAt('/handoff')
    expect(h1()).toBe('Nothing to hand off yet.')
  })

  it('details page: clearer question labels still save their values and keep validation', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    renderAt('/customer/details')

    const request = screen.getByLabelText("Would you like to request an item that isn't on the menu?")
    const notes = screen.getByLabelText('Is there anything else we should know about your order?')
    await user.type(request, 'A vegan dessert tray')
    await user.type(notes, 'Please label the spicy dishes')
    await user.click(btn('Review your request'))

    expect(store().order.intent.customRequest).toBe('A vegan dessert tray')
    expect(store().order.intent.notes).toBe('Please label the spicy dishes')
    expect(h1()).toBe('Review your request.')
  })

  it('details page: required contact name is still enforced after the label change', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    renderAt('/customer/details')
    await user.clear(screen.getByLabelText('Your name'))
    await user.click(btn('Review your request'))
    expect(screen.getByRole('alert').textContent).toMatch(/contact name/)
    expect(h1()).toBe('Almost there.')
  })
})
