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
    expect(h1()).toBe('Tell us about your event.') // nothing to review yet: start at the beginning
    store().loadScenario('unusual')
    expect(store().order.status).toBe('draft')
    await user.click(btn('Reset'))
    expect(h1()).toBe('Tell us about your event.')
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

  it('menu sidebar order: calculator, one continue button, then the assistant mockup', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await user.click(btn('Help me choose'))
    await user.click(btn('Use these'))

    const total = screen.getByLabelText('Estimated total')
    const continues = screen.getAllByRole('button', { name: 'Continue to supplies' })
    expect(continues).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Next: supplies' })).toBeNull()
    const assistant = screen.getByRole('region', { name: /demo only/i })

    const after = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    expect(after(total, continues[0])).toBe(true)
    expect(after(continues[0], assistant)).toBe(true)
  })

  it('assistant mockup is display-only: every control is disabled and nothing changes the order', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    const assistant = screen.getByRole('region', { name: /demo only/i })
    const before = JSON.stringify(store().order)
    expect((screen.getByLabelText('Ask a question') as HTMLInputElement).disabled).toBe(true)
    for (const control of assistant.querySelectorAll('button')) {
      expect((control as HTMLButtonElement).disabled).toBe(true)
      await user.click(control)
    }
    expect(JSON.stringify(store().order)).toBe(before)
  })

  it('assistant mockup says it is demo-only and shows no answers', () => {
    renderAt('/customer/menu')
    const assistant = screen.getByRole('region', { name: /demo only/i })
    expect(assistant.textContent).toContain('Demo only')
    expect(assistant.textContent).toMatch(/can't be sent or answered/)
    // Suggested questions only: nothing in the panel states a price, allergen or portion answer.
    expect(assistant.textContent).not.toMatch(/\$\d|allergen|contains/i)
  })

  it('staff assistant mockup matches the customer one: demo-only, disabled, no answers', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    renderAt('/staff')
    const assistant = screen.getByRole('region', { name: /staff assistant \(demo only\)/i })
    expect(assistant.textContent).toContain('Demo only')
    expect(assistant.textContent).toMatch(/can't be sent or answered/)
    const before = JSON.stringify(store().order)
    for (const control of [...assistant.querySelectorAll('button'), ...assistant.querySelectorAll('input')]) {
      expect((control as HTMLButtonElement | HTMLInputElement).disabled).toBe(true)
      await user.click(control)
    }
    expect(JSON.stringify(store().order)).toBe(before)
  })

  it('staff can draft a question and simulate sending it without implying delivery', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    renderAt('/staff')

    await user.click(btn('Ask customer a question'))
    const send = btn('Simulate send')
    expect((send as HTMLButtonElement).disabled).toBe(true) // empty draft cannot be sent
    await user.type(screen.getByLabelText('Question for the customer'), 'Can the pickup move to 11:30?')
    await user.click(send)

    expect(screen.getByRole('status').textContent).toMatch(/Nothing was sent to the customer/)
    expect(screen.getByText(/Recorded in the demo. Not delivered to the customer./)).toBeTruthy()
    expect(store().order.messages.map((m) => m.text)).toContain('Can the pickup move to 11:30?')
    expect(store().order.status).toBe('needs_review')
    // Acceptance is unchanged: staff can still accept afterwards.
    await user.click(btn('Accept request'))
    expect(store().order.status).toBe('confirmed')
  })

  it('ask-customer is unavailable once the request is closed', async () => {
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    store().accept('staff')
    renderAt('/staff')
    expect((btn('Ask customer a question') as HTMLButtonElement).disabled).toBe(true)
  })

  it('staff edit goes through the revise flow: customer must approve before acceptance', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    renderAt('/staff')

    await user.click(btn('Edit request'))
    expect((btn('Save changes') as HTMLButtonElement).disabled).toBe(true) // nothing changed yet
    const qty = screen.getByRole('spinbutton', { name: 'Quantity of Sous Poulet Chicken' })
    await user.clear(qty)
    await user.type(qty, '30')
    expect(screen.getByTestId('edit-estimate').textContent).toContain('$150')
    expect(screen.getByTestId('edit-estimate').textContent).toContain('30')
    await user.click(btn('Save changes'))

    expect(store().order.lines).toEqual([{ itemId: 'sous-poulet', units: 30 }])
    expect(store().order.status).toBe('awaiting_customer_approval')
    expect(screen.getByRole('status').textContent).toMatch(/Nothing was sent to the customer/)
    expect((btn('Accept request') as HTMLButtonElement).disabled).toBe(true)
    cleanup()

    renderAt('/customer/review')
    await user.click(btn('Approve changes'))
    expect(store().order.revision).toBe('approved')
    cleanup()

    renderAt('/staff')
    await user.click(btn('Accept request'))
    expect(store().order.status).toBe('confirmed')
  })

  it('staff edit can be cancelled without changing the order, and is unavailable once accepted', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    renderAt('/staff')
    const before = JSON.stringify(store().order)
    await user.click(btn('Edit request'))
    await user.click(screen.getByRole('button', { name: 'Increase quantity of Sous Poulet Chicken' }))
    await user.click(btn('Cancel'))
    expect(JSON.stringify(store().order)).toBe(before)
    cleanup()

    store().accept('staff')
    renderAt('/staff')
    expect((btn('Edit request') as HTMLButtonElement).disabled).toBe(true)
  })

  it('Start over returns to the event page with a fresh draft', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    renderAt('/customer/review')
    await user.click(btn('Start over'))
    expect(h1()).toBe('Tell us about your event.')
    expect(store().order.status).toBe('draft')
    expect(store().order.lines).toEqual([])
  })
})
