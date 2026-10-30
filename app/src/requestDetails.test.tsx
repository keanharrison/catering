// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('pi2go-demo-account', 'team')
  useDemoStore.getState().loadScenario('routine')
  useDemoStore.setState({ orders: [], seeded: false })
  useDemoStore.getState().seedStartingRequests()
})
afterEach(cleanup)

async function openRequest(name: RegExp) {
  const user = userEvent.setup()
  renderAppAt('/staff', <AppRoutes />)
  await user.click(screen.getByRole('row', { name }))
  return user
}

describe('selected request panel', () => {
  it('leads with the event, a Name line and a Location line, then five sections in order', async () => {
    await openRequest(/Owen Park/)
    const panel = within(screen.getByRole('dialog'))
    expect(panel.getByText('Corporate lunch')).toBeTruthy()
    expect(panel.getByText(/Name:/).parentElement?.textContent).toBe('Name: Nashville Tech Meetup')
    expect(panel.getByText(/Location:/).parentElement?.textContent).toBe('Location: 1 Music Row, Nashville, TN, 37203')
    const headings = panel.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(headings.slice(0, 5)).toEqual(['Details', 'Food', 'Supplies', 'Contacts', 'Instructions'])
  })

  it('does not repeat the name or the address in Details, and keeps every other fact', async () => {
    await openRequest(/Owen Park/)
    const details = within(screen.getByRole('heading', { level: 3, name: 'Details' }).closest('section') as HTMLElement)
    expect(details.queryByText('Delivery address')).toBeNull()
    expect(details.queryByText(/Nashville Tech Meetup/)).toBeNull()
    for (const label of ['Guests', 'Date and time', 'Fulfillment', 'Food budget']) expect(details.getByText(label)).toBeTruthy()
    expect(screen.getByText('Food subtotal')).toBeTruthy()
    expect(screen.getByText('Estimated total')).toBeTruthy()
    expect(screen.getByText('owen.park@nashtech.example')).toBeTruthy()
    expect(screen.getByText('Conference lunch; headcount may grow.')).toBeTruthy()
  })

  it('names a private customer’s event and shows pickup as the location', async () => {
    await openRequest(/Hannah Brooks/)
    expect(screen.getByText(/Location:/).parentElement?.textContent).toBe('Location: Pickup at the restaurant')
    cleanup()
    await openRequest(/Elena Ruiz/)
    expect(screen.getByText(/Name:/).parentElement?.textContent).toBe('Name: Elena Ruiz’s event')
  })

  it('keeps the actions', async () => {
    await openRequest(/Owen Park/)
    expect(screen.getByRole('button', { name: 'Accept request' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Delete request' })).toBeTruthy()
  })
})
