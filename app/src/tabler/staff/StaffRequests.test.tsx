// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { sampleOrders } from '../../data/sampleOrders'
import { useDemoStore } from '../../state/store'
import { StaffRequests } from './StaffRequests'

// jsdom's matchMedia stub never matches, so the detail pane opens as the offcanvas dialog (narrow layout).
const dialog = () => screen.getByRole('dialog', { name: 'Request details' })
const store = () => useDemoStore.getState()
const rowButtons = () => within(screen.getByRole('list', { name: 'Catering requests' })).getAllByRole('listitem').map((li) => within(li).getByRole('button'))
const rowFor = (name: RegExp) => rowButtons().find((button) => name.test(button.textContent ?? ''))!

beforeEach(() => {
  localStorage.clear()
  store().loadScenario('routine')
  useDemoStore.setState({ orders: sampleOrders })
})
afterEach(cleanup)

describe('Tabler Staff Requests', () => {
  it('shows filter counts and narrows the list by status', async () => {
    const user = userEvent.setup()
    render(<StaffRequests />)
    const group = screen.getByRole('group', { name: 'Filter requests by status' })
    expect(within(group).getAllByRole('button')).toHaveLength(4)
    await user.click(within(group).getByRole('button', { name: /Confirmed/ }))
    expect(rowButtons().length).toBe(sampleOrders.filter((o) => o.status === 'confirmed').length)
    expect(within(group).getByRole('button', { name: /Confirmed/ }).getAttribute('aria-pressed')).toBe('true')
  })

  it('opens request details, records a clarification question, and keeps the order in the queue', async () => {
    const user = userEvent.setup()
    render(<StaffRequests />)
    await user.click(rowFor(/Sam Rivera/))
    const panel = within(dialog())
    expect(panel.getByText('Review reasons')).toBeTruthy()
    await user.click(panel.getByRole('button', { name: 'Ask for clarification' }))
    const save = panel.getByRole('button', { name: 'Save question' }) as HTMLButtonElement
    expect(save.disabled).toBe(true)
    await user.type(panel.getByLabelText('Question for the customer'), 'Can you confirm the allergy list?')
    await user.click(save)
    expect(panel.getByRole('status').textContent).toMatch(/Question recorded locally/)
    expect(store().order.messages.some((m) => m.text === 'Can you confirm the allergy list?')).toBe(true)
  })

  it('revises the proposal so the customer must approve before acceptance', async () => {
    const user = userEvent.setup()
    render(<StaffRequests />)
    await user.click(rowFor(/Sam Rivera/))
    const panel = within(dialog())
    await user.click(panel.getByRole('button', { name: 'Edit request' }))
    const qty = panel.getAllByRole('spinbutton')[0]
    await user.clear(qty)
    await user.type(qty, '20')
    await user.click(panel.getByRole('button', { name: 'Save changes' }))
    expect(panel.getByRole('status').textContent).toMatch(/Proposal saved locally/)
    expect(store().order.status).toBe('awaiting_customer_approval')
    expect((panel.getByRole('button', { name: 'Accept request' }) as HTMLButtonElement).disabled).toBe(true)
    expect(panel.getByText(/customer/i, { selector: '#accept-disabled-reason' })).toBeTruthy()
  })

  it('accepts a routine request and links to the handoff', async () => {
    const user = userEvent.setup()
    render(<StaffRequests />)
    await user.click(rowFor(/Jordan Lee/))
    const panel = within(dialog())
    await user.click(panel.getByRole('button', { name: 'Accept request' }))
    expect(panel.getByRole('status').textContent).toMatch(/Accepted in the demo/)
    expect(store().order.status).toBe('confirmed')
    expect(panel.getByRole('link', { name: 'View handoff' }).getAttribute('href')).toBe('/handoff')
  })

  it('closes the details dialog with Escape and returns focus to the request', async () => {
    const user = userEvent.setup()
    render(<StaffRequests />)
    const item = rowButtons()[0]
    item.focus()
    await user.keyboard('{Enter}')
    expect(dialog()).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(item)
  })
})
