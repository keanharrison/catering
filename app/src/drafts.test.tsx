// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { sampleOrders } from './data/sampleOrders'
import { useDemoStore } from './state/store'
import { fillEventBasics } from './test/fillEventBasics'
import { renderAppAt } from './test/renderApp'

const store = () => useDemoStore.getState()
const btn = (name: string | RegExp) => screen.getByRole('button', { name })

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  localStorage.setItem('pi2go-demo-account', 'customer')
  vi.setSystemTime(new Date('2026-10-13T09:00'))
  store().loadScenario('routine')
  useDemoStore.setState({ orders: sampleOrders, savedDrafts: [] })
  store().startBlankDraft()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('saved drafts', () => {
  it('shows an empty Drafts page before anything is saved', () => {
    renderAppAt('/customer/drafts', <AppRoutes />)
    expect(screen.getByText('No saved drafts')).toBeTruthy()
  })

  it('does not save a draft just because someone typed', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer', <AppRoutes />)
    await fillEventBasics(user)
    expect(store().savedDrafts).toHaveLength(0)
  })

  it('files the request under Drafts on Save draft, then reopens it with Continue', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer', <AppRoutes />)
    await fillEventBasics(user)
    await user.click(btn('Save draft'))

    expect(screen.getByRole('heading', { level: 1, name: 'Drafts' })).toBeTruthy()
    expect(store().savedDrafts).toHaveLength(1)
    expect(store().order.intent.eventType).toBe('') // a clean request is waiting for next time

    await user.click(btn('Continue'))
    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('40')
    expect(store().savedDrafts).toHaveLength(0)
  })

  it('deletes a saved draft', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer', <AppRoutes />)
    await fillEventBasics(user)
    await user.click(btn('Save draft'))
    await user.click(btn('Delete'))
    expect(screen.getByText('No saved drafts')).toBeTruthy()
  })
})
