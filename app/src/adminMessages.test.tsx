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

const list = () => within(screen.getByRole('list', { name: 'Conversations' }))

describe('Admin Messages', () => {
  it('lists each thread with customer, organization, event date, latest message and unread count', () => {
    renderAppAt('/staff/messages', <AppRoutes />)
    const owen = within(list().getByRole('button', { name: /Owen Park/ }))
    expect(owen.getByText(/Nashville Tech Meetup/)).toBeTruthy()
    expect(owen.getByText('Sat, Oct 24 · 12:00 PM')).toBeTruthy()
    expect(owen.getByText('We may add up to 20 guests. Is that possible?')).toBeTruthy()
    expect(owen.getByText('16h ago')).toBeTruthy()
    expect(owen.getByLabelText('1 unread')).toBeTruthy()
    expect(within(list().getByRole('button', { name: /Luis Ortega/ })).getByText('No messages yet')).toBeTruthy()
  })

  it('puts the newest conversation first and can reverse the order', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/messages', <AppRoutes />)
    const names = () => list().getAllByRole('button').map((b) => b.textContent)
    expect(names()[0]).toMatch(/Owen Park/)
    await user.click(screen.getByRole('combobox', { name: 'Sort conversations' }))
    await user.click(await screen.findByRole('option', { name: 'Oldest first' }))
    expect(names()[0]).toMatch(/Elena Ruiz/)
  })

  it('searches conversations by customer, event or message text', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/messages', <AppRoutes />)
    await user.type(screen.getByRole('searchbox', { name: 'Search conversations' }), 'luis')
    expect(list().getAllByRole('button')).toHaveLength(1)
    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'zzz')
    expect(screen.getByText(/No conversations match/)).toBeTruthy()
  })

  it('shows the customer, event name, date and time, and status above the thread', () => {
    renderAppAt('/staff/messages', <AppRoutes />)
    const header = within(document.querySelectorAll('[data-slot="card-header"]')[1] as HTMLElement)
    expect(header.getByText('Owen Park')).toBeTruthy()
    expect(header.getByText('Nashville Tech Meetup')).toBeTruthy()
    expect(header.getByText('Saturday, October 24, 2026 at 12:00 PM')).toBeTruthy()
    expect(header.getByText('Needs review')).toBeTruthy()
    expect(header.getByRole('button', { name: 'View request' })).toBeTruthy()
  })

  it('shows messages as labeled, timestamped bubbles under a date separator, with one reply action', () => {
    renderAppAt('/staff/messages', <AppRoutes />)
    const log = within(screen.getByRole('log', { name: 'Messages in this conversation' }))
    expect(log.getByText('Yesterday')).toBeTruthy()
    expect(log.getByText('Customer')).toBeTruthy()
    expect(log.getByText(/4:40 PM/)).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Save message' })).toHaveLength(1)
  })

  it('says so when search leaves no conversation selected', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/messages', <AppRoutes />)
    await user.type(screen.getByRole('searchbox'), 'zzz')
    expect(screen.getByText('No conversation selected')).toBeTruthy()
  })

  it('marks a thread read when it is opened', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/messages', <AppRoutes />)
    await user.click(list().getByRole('button', { name: /Owen Park/ }))
    expect(within(list().getByRole('button', { name: /Owen Park/ })).queryByLabelText('1 unread')).toBeNull()
  })

  it('opens the linked request from the thread', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/messages', <AppRoutes />)
    await user.click(screen.getByRole('button', { name: 'View request' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Catering requests' })).toBeTruthy()
    expect(useDemoStore.getState().order.id).toBe('pi-0010')
  })
})
