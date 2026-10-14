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

const heading = (name: RegExp | string) => screen.getByRole('heading', { level: 1, name })
const click = (user: ReturnType<typeof userEvent.setup>, name: RegExp | string, role: 'button' | 'link' | 'radio' | 'checkbox' = 'button') =>
  user.click(screen.getByRole(role, { name }))

beforeEach(() => {
  localStorage.clear()
})
afterEach(cleanup)

describe('customer journey end to end', () => {
  it('routine: customer builds the menu without any suggestion and submits a simulated request', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer')

    // Event basics are prefilled from the scenario.
    expect(heading('Tell us about your event.')).toBeTruthy()
    await click(user, 'Choose your menu')

    // Menu starts empty; the customer chooses.
    expect(heading('Choose what you would like.')).toBeTruthy()
    expect(screen.getByText(/Nothing chosen yet/)).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Continue to supplies' }) as HTMLButtonElement).disabled).toBe(true)

    const entree = screen.getByRole('spinbutton', { name: 'Quantity of Sous Poulet Chicken' })
    await user.clear(entree)
    await user.type(entree, '40')
    expect(screen.getByTestId('coverage').textContent).toContain('everyone covered')
    expect(screen.getByLabelText('Estimated total').textContent).toBe('$200')

    await click(user, 'Continue to supplies')
    expect(heading('Plates, cutlery and serving.')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Continue to details' }) as HTMLButtonElement).disabled).toBe(true)
    await click(user, /No cutlery, plates or serving utensils needed/, 'radio')
    await click(user, 'Continue to details')

    expect(heading('Almost there.')).toBeTruthy()
    await click(user, 'Review your request')

    expect(heading('Review your request.')).toBeTruthy()
    expect(screen.queryByText('Our team will check')).toBeNull()
    await click(user, 'Submit request')

    expect(heading('Request recorded.')).toBeTruthy()
    expect(screen.getByText(/Nothing was sent to Pearl Island, and no payment was taken/)).toBeTruthy()
    expect(useDemoStore.getState().order.status).toBe('submitted')

    // Minimal simulated staff view accepts it.
    await user.click(screen.getAllByRole('link', { name: 'Staff' })[0])
    expect(screen.getByText(/Nothing flagged/)).toBeTruthy()
    await click(user, 'Accept request')
    expect(useDemoStore.getState().order.status).toBe('confirmed')
    await click(user, 'View handoff summary', 'link')
    expect(screen.getByText(/Simulated - no real order exists/)).toBeTruthy()
  })

  it('unusual: help me choose fills the menu, supplies are priced, and the request is routed to review', async () => {
    useDemoStore.getState().loadScenario('unusual')
    const user = userEvent.setup()
    renderAt('/customer/menu')

    expect(screen.queryByText(/Suggested for/)).toBeNull() // never appears unasked
    await click(user, 'Help me choose')
    expect(screen.getByText(/Suggested for 150 guests/)).toBeTruthy()
    await click(user, 'Use these')
    expect(screen.getByTestId('coverage').textContent).toContain('everyone covered')

    await click(user, 'Continue to supplies')
    await click(user, 'Add supplies', 'radio')
    expect((screen.getByRole('button', { name: 'Continue to details' }) as HTMLButtonElement).disabled).toBe(true)
    await click(user, 'Add Plates & Cutlery', 'checkbox')
    await click(user, 'Continue to details')
    await click(user, 'Review your request')

    const panel = screen.getByText('Our team will check').closest('div')?.parentElement as HTMLElement
    expect(within(panel).getByText(/over the 50-guest limit/)).toBeTruthy()
    await click(user, 'Submit request')

    expect(useDemoStore.getState().order.status).toBe('needs_review')
    expect(screen.getAllByText('Needs review').length).toBeGreaterThan(0)
    expect(screen.getByText(/recorded in the demo/)).toBeTruthy()
  })

  it('undo restores the menu from before the suggestion', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await click(user, 'Help me choose')
    await click(user, 'Use these')
    expect(useDemoStore.getState().order.lines.length).toBeGreaterThan(0)
    await click(user, 'Undo')
    expect(useDemoStore.getState().order.lines).toEqual([])
  })

  it('does not let the customer skip ahead by URL', () => {
    useDemoStore.getState().loadScenario('routine')
    renderAt('/customer/review')
    expect(heading('Choose what you would like.')).toBeTruthy()
  })

  it('goes back to the previous stage', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await click(user, 'Back')
    expect(heading('Tell us about your event.')).toBeTruthy()
  })

  it('blocks continuing from the event basics with a missing guest count', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer')
    await user.clear(screen.getByLabelText('Number of guests'))
    await click(user, 'Choose your menu')
    expect(screen.getByRole('alert').textContent).toMatch(/whole number of guests/)
    expect(heading('Tell us about your event.')).toBeTruthy()
  })

  it('blocks the final details without a contact name', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await click(user, 'Help me choose')
    await click(user, 'Use these')
    await click(user, 'Continue to supplies')
    await click(user, /No cutlery/, 'radio')
    await click(user, 'Continue to details')
    await user.clear(screen.getByLabelText('Your name'))
    await click(user, 'Review your request')
    expect(screen.getByRole('alert').textContent).toMatch(/contact name/)
  })
})
