// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'
import { fillEventBasics } from './test/fillEventBasics'
import { renderAppAt } from './test/renderApp'

function RouteProbe() {
  const { pathname } = useLocation()
  return <output data-testid="route-path">{pathname}</output>
}

function renderAt(path: string) {
  return renderAppAt(path, <><AppRoutes /><RouteProbe /></>)
}

const pageTitle = (name: RegExp | string) => screen.getByText(name)
const click = (user: ReturnType<typeof userEvent.setup>, name: RegExp | string, role: 'button' | 'link' | 'radio' | 'checkbox' = 'button') =>
  user.click(screen.getAllByRole(role, { name })[0])

async function completeDetails(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email (required)'), 'jordan@example.com')
  await user.type(screen.getByLabelText('Phone (required)'), '555-010-0199')
  if (screen.queryByLabelText('Street address (required)')) {
    await user.type(screen.getByLabelText('Street address (required)'), '100 Main Street')
    await user.type(screen.getByLabelText('City (required)'), 'Nashville')
    await user.type(screen.getByLabelText('State (required)'), 'TN')
    await user.type(screen.getByLabelText('ZIP code (required)'), '37201')
  }
}

async function switchToTeam(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Customer account menu' }))
  await user.keyboard('{ArrowDown}'); await user.keyboard('{ArrowRight}')
  await user.click(screen.getByRole('menuitemradio', { name: 'Admin' }))
}

beforeEach(() => {
  localStorage.clear()
  vi.setSystemTime(new Date('2026-10-13T09:00')) // the first page defaults its date to today
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('customer journey end to end', () => {
  it('routine: customer builds the menu without any suggestion and submits a simulated request', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer')

    // The first page opens empty; the customer answers it.
    expect(pageTitle('Plan your catering')).toBeTruthy()
    await fillEventBasics(user)
    await click(user, 'Continue')

    // Menu starts empty; the customer chooses.
    expect(pageTitle('Build your menu')).toBeTruthy()
    expect(screen.getByText(/Nothing chosen yet/)).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Choose supplies' }).map((button) => (button as HTMLButtonElement).disabled)).toEqual([true, true])

    const entree = screen.getByRole('spinbutton', { name: 'Quantity of Sous Poulet Chicken' })
    await user.clear(entree)
    await user.type(entree, '40')
    expect(screen.getByTestId('coverage').textContent).toContain('40 of 40 guests')
    expect(screen.getAllByRole('button', { name: 'Choose supplies' }).map((button) => (button as HTMLButtonElement).disabled)).toEqual([false, false])
    expect(screen.getByText('Estimated total').parentElement?.textContent).toBe('Estimated total$200')

    await click(user, 'Choose supplies')
    expect(screen.getByTestId('route-path').textContent).toBe('/customer/supplies')
    expect(pageTitle('Catering supplies')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Continue to details' }) as HTMLButtonElement).disabled).toBe(true)
    await click(user, 'No supplies needed', 'radio')
    await click(user, 'Continue to details')

    expect(pageTitle('Final details')).toBeTruthy()
    await completeDetails(user)
    await click(user, 'Review your request')

    expect(pageTitle('Review your catering request')).toBeTruthy()
    expect(screen.queryByText('Our team will check')).toBeNull()
    await click(user, 'Submit request')

    expect(pageTitle('Review your catering request')).toBeTruthy()
    expect(screen.getByText(/Request recorded · Submitted/)).toBeTruthy()
    expect(screen.getByText(/The Pearl Island team will review/)).toBeTruthy()
    expect(useDemoStore.getState().order.status).toBe('submitted')

    // Minimal simulated staff view accepts it.
    await switchToTeam(user)
    expect(screen.queryByText('Our team will check')).toBeNull() // nothing flagged for the routine order
    await click(user, 'Accept request')
    expect(useDemoStore.getState().order.status).toBe('confirmed')
    await click(user, 'View handoff', 'button')
    expect(pageTitle('Staff handoff')).toBeTruthy()
    expect(screen.getByText('Accepted')).toBeTruthy()
  }, 30000)

  it('unusual: help me choose fills the menu, supplies are priced, and the request is routed to review', async () => {
    useDemoStore.getState().loadScenario('unusual')
    const user = userEvent.setup()
    renderAt('/customer/menu')

    expect(screen.queryByText(/Suggested for/)).toBeNull() // never appears unasked
    await click(user, 'Suggest')
    expect(screen.getByText(/Suggested for 150 guests/)).toBeTruthy()
    await click(user, 'Apply')
    expect(screen.getByTestId('coverage').textContent).toContain('150 of 150 guests')

    await click(user, 'Choose supplies')
    await click(user, 'I need supplies', 'radio')
    expect((screen.getByRole('button', { name: 'Continue to details' }) as HTMLButtonElement).disabled).toBe(true)
    await click(user, 'Plates & Cutlery', 'checkbox')
    await click(user, 'Continue to details')
    await completeDetails(user)
    await click(user, 'Review your request')

    const reviewAlert = screen.getByRole('alert')
    expect(within(reviewAlert).getByText(/over the 50-guest limit/)).toBeTruthy()
    await click(user, 'Submit request')

    expect(useDemoStore.getState().order.status).toBe('needs_review')
    expect(useDemoStore.getState().order.flags.length).toBeGreaterThan(0)
    expect(screen.getByText(/Request recorded · Needs review/)).toBeTruthy()

    expect(screen.getByText(/The Pearl Island team will review/)).toBeTruthy()

    // The review flags are still shown on the staff side, without the extra explanatory heading.
    await switchToTeam(user)
    expect(screen.getByText(/over the 50-guest limit/)).toBeTruthy()
    expect(screen.queryByText('Why it needs a look')).toBeNull()
  }, 30000)

  it('undo restores the menu from before the suggestion', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await click(user, 'Suggest')
    await click(user, 'Apply')
    expect(useDemoStore.getState().order.lines.length).toBeGreaterThan(0)
    await click(user, 'Undo')
    expect(useDemoStore.getState().order.lines).toEqual([])
  })

  it('does not let the customer skip ahead by URL', () => {
    useDemoStore.getState().loadScenario('routine')
    renderAt('/customer/supplies')
    expect(pageTitle('Build your menu')).toBeTruthy()
    cleanup()
    renderAt('/customer/review')
    expect(pageTitle('Plan your catering')).toBeTruthy()
  })

  it('goes back to the previous stage', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await click(user, 'Back')
    expect(pageTitle('Plan your catering')).toBeTruthy()
  })

  it('blocks continuing from the event basics with a missing guest count', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer')
    await fillEventBasics(user, 'routine', { guests: false })
    await click(user, 'Continue')
    expect(screen.getByRole('alert').textContent).toMatch(/whole number of guests/)
    expect(pageTitle('Plan your catering')).toBeTruthy()
  })

  it('blocks the final details without a contact name', async () => {
    useDemoStore.getState().loadScenario('routine')
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await click(user, 'Suggest')
    await click(user, 'Apply')
    await click(user, 'Choose supplies')
    await click(user, 'No supplies needed', 'radio')
    await click(user, 'Continue to details')
    await user.clear(screen.getByLabelText('Contact name (required)'))
    await click(user, 'Review your request')
    expect(screen.getAllByRole('alert').some((alert) => /contact name/i.test(alert.textContent ?? ''))).toBe(true)
  })
})
